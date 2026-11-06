require "test_helper"

class ApiArticlesTest < ActionDispatch::IntegrationTest
  test "index returns summaries newest first without nested data" do
    rockets = articles(:rockets)
    rockets.update_columns(created_at: 2.days.ago)
    get "/api/v1/articles"
    assert_response :success
    assert_equal "application/json", response.media_type
    assert_shape({ "articles" => [ ApiTestHelper::ARTICLE_SUMMARY_SHAPE ] }, response.parsed_body)
    list = response.parsed_body["articles"]
    assert_equal [ articles(:plain).id, rockets.id ], list.map { |a| a["id"] }
    summary = list.last
    assert_equal "Rocket Engines", summary["title"]
    assert_equal "A rocket engine uses stored propellant. It works in a vacuum.", summary["excerpt"]
    assert_equal "https://example.com/rocket.jpg", summary["image_link"]
    assert_equal 2, summary["comments_count"]
    assert_equal user_json(users(:guest)), summary["user"]
    assert_nil list.first["image_link"]
  end

  test "index breaks created_at ties by id descending and caps at 100" do
    time = Time.current
    Article.delete_all
    rows = Array.new(101) { |i| { user_id: users(:ada).id, title: "T#{i}", body: "b", created_at: time, updated_at: time } }
    ids = Article.insert_all!(rows, returning: :id).map { |r| r["id"] }
    get "/api/v1/articles"
    listed = response.parsed_body["articles"].map { |a| a["id"] }
    assert_equal 100, listed.size
    assert_equal ids.sort.reverse.first(100), listed
  end

  test "index is empty list when there are no articles" do
    Article.destroy_all
    get "/api/v1/articles"
    assert_equal({ "articles" => [] }, response.parsed_body)
  end

  test "query count does not grow with the number of records" do
    get "/api/v1/articles"
    baseline = count_queries { get "/api/v1/articles" }
    get "/api/v1/articles/#{articles(:rockets).id}"
    show_baseline = count_queries { get "/api/v1/articles/#{articles(:rockets).id}" }

    other = users(:no_expertise)
    article = nil
    5.times do |i|
      article = Article.create!(user: other, title: "Extra #{i}", body: "Some body text #{i}")
      annotation = Annotation.create_serialized!(article: article, user: other, selection_start: 0, selection_length: 4, body: "ann")
      Improvement.create!(annotation: annotation, user: users(:ada), body: "better")
      Comment.create!(article: article, user: users(:guest), body: "hi")
    end
    rockets = articles(:rockets)
    5.times do |i|
      Annotation.create_serialized!(article: rockets, user: other, selection_start: 31 + i, selection_length: 1, body: "x#{i}")
      Comment.create!(article: rockets, user: other, body: "more #{i}")
    end
    Improvement.create!(annotation: annotations(:vacuum), user: other, body: "extra")

    assert_equal baseline, count_queries { get "/api/v1/articles" }
    assert_equal show_baseline, count_queries { get "/api/v1/articles/#{rockets.id}" }
    assert_equal 7, rockets.reload.comments_count
  end

  test "show returns the full article with ordered nested data" do
    rockets = articles(:rockets)
    get "/api/v1/articles/#{rockets.id}"
    assert_response :success
    assert_equal "application/json", response.media_type
    body = response.parsed_body
    assert_shape ApiTestHelper::ARTICLE_SHAPE, body
    assert_equal rockets.body, body["body"]
    assert_equal user_json(users(:guest)), body["user"]
    assert_equal [ 2, 20 ], body["annotations"].map { |a| a["selection_start"] }
    assert_equal [ annotations(:engine).id, annotations(:vacuum).id ], body["annotations"].map { |a| a["id"] }
    assert_equal [ comments(:first).id, comments(:second).id ], body["comments"].map { |c| c["id"] }
    improvements_json = body["annotations"].first["improvements"]
    assert_equal [ improvements(:older).id, improvements(:simpler).id ], improvements_json.map { |i| i["id"] }
    assert_equal [ annotations(:engine).id ], improvements_json.map { |i| i["annotation_id"] }.uniq
    assert_equal [ rockets.id ], body["comments"].map { |c| c["article_id"] }.uniq
    assert_equal rockets.created_at.utc.iso8601(3), body["created_at"]
  end

  test "show returns 404 for a missing article" do
    get "/api/v1/articles/0"
    assert_error :not_found, "not_found"
    get "/api/v1/articles/abc"
    assert_error :not_found, "not_found"
  end

  test "create returns 201 with the full shape and ignores ownership fields" do
    log_in_as users(:ada)
    api_post "/api/v1/articles", { title: "  New one ", body: "Line one\r\nLine two", image_link: "https://example.com/x.png",
                                   user_id: users(:guest).id, id: 999_999, comments_count: 50, user: { id: users(:guest).id }, article: { title: "wrapped" } }
    assert_response :created
    body = response.parsed_body
    assert_shape ApiTestHelper::ARTICLE_SHAPE, body
    assert_equal "New one", body["title"]
    assert_equal "Line one\nLine two", body["body"]
    assert_equal "https://example.com/x.png", body["image_link"]
    assert_equal user_json(users(:ada)), body["user"]
    assert_equal [], body["annotations"]
    assert_equal [], body["comments"]
    assert_not_equal 999_999, body["id"]
    article = Article.find(body["id"])
    assert_equal users(:ada), article.user
    assert_equal 0, article.comments_count
  end

  test "create with only title and body leaves image_link null and treats empty string as null" do
    log_in_as users(:ada)
    api_post "/api/v1/articles", { title: "T", body: "B" }
    assert_response :created
    assert_nil response.parsed_body["image_link"]
    api_post "/api/v1/articles", { title: "T", body: "B", image_link: "" }
    assert_response :created
    assert_nil response.parsed_body["image_link"]
  end

  test "create requires login" do
    assert_no_difference "Article.count" do
      api_post "/api/v1/articles", { title: "T", body: "B" }
    end
    assert_error :unauthorized, "unauthorized"
  end

  test "create validates title, body and image_link" do
    log_in_as users(:ada)
    api_post "/api/v1/articles", {}
    error = assert_error :unprocessable_content, "validation_failed"
    assert_equal %w[body title], error["details"].keys.sort
    assert_match(/\A(Title|Body) /, error["message"])

    api_post "/api/v1/articles", { title: "a" * 201, body: "b" * 50_001 }
    error = assert_error :unprocessable_content, "validation_failed"
    assert_equal %w[body title], error["details"].keys.sort

    api_post "/api/v1/articles", { title: "  ", body: "ok" }
    assert_validation_error "title"

    [ "javascript:alert(1)", "data:text/html,hi", "ftp://example.com/a.png", "not a url", "https://", "https://example.com/" + "a" * 2048 ].each do |link|
      api_post "/api/v1/articles", { title: "T", body: "B", image_link: link }
      assert_validation_error "image_link"
    end
    assert_no_difference("Article.count") { api_post "/api/v1/articles", { title: "T", body: "B", image_link: "javascript:alert(1)" } }
  end

  test "create with malformed json returns 400" do
    log_in_as users(:ada)
    api_post "/api/v1/articles", "{not json"
    assert_error :bad_request, "bad_request"
  end

  test "destroy removes the article and cascades to annotations, improvements and comments" do
    log_in_as users(:guest)
    rockets = articles(:rockets)
    annotation_ids = [ annotations(:engine).id, annotations(:vacuum).id ]
    assert_difference "Article.count", -1 do
      delete "/api/v1/articles/#{rockets.id}"
    end
    assert_response :no_content
    assert_empty response.body
    assert_equal 0, Annotation.where(article_id: rockets.id).count
    assert_equal 0, Comment.where(article_id: rockets.id).count
    assert_equal 0, Improvement.where(annotation_id: annotation_ids).count
    assert Article.exists?(articles(:plain).id)
    get "/api/v1/articles/#{rockets.id}"
    assert_error :not_found, "not_found"
  end

  test "destroy requires login" do
    assert_no_difference "Article.count" do
      delete "/api/v1/articles/#{articles(:rockets).id}"
    end
    assert_error :unauthorized, "unauthorized"
  end

  test "destroy returns 404 for missing and for not owned articles" do
    log_in_as users(:ada)
    assert_no_difference "Article.count" do
      delete "/api/v1/articles/#{articles(:rockets).id}"
      assert_error :not_found, "not_found"
      delete "/api/v1/articles/0"
      assert_error :not_found, "not_found"
    end
  end

  test "write verbs without a CSRF token return 403" do
    log_in_as users(:ada)
    with_forgery_protection do
      api_post "/api/v1/articles", { title: "T", body: "B" }
      assert_error :forbidden, "invalid_csrf_token"
      delete "/api/v1/articles/#{articles(:plain).id}"
      assert_error :forbidden, "invalid_csrf_token"
    end
    assert Article.exists?(articles(:plain).id)
  end
end
