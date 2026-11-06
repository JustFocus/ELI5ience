require "test_helper"

class ApiAnnotationsTest < ActionDispatch::IntegrationTest
  def rockets
    articles(:rockets)
  end

  def create_path(article = rockets)
    "/api/v1/articles/#{article.id}/annotations"
  end

  test "create returns 201 with the annotation shape and takes the user from the session" do
    log_in_as users(:ada)
    assert_difference "Annotation.count", 1 do
      api_post create_path, { selection_start: 0, selection_length: 2, body: " A rocket. ", user_id: users(:guest).id,
                              article_id: articles(:plain).id, id: 999_999, user: { id: users(:guest).id } }
    end
    assert_response :created
    body = response.parsed_body
    assert_shape ApiTestHelper::ANNOTATION_SHAPE, body
    assert_equal({ "selection_start" => 0, "selection_length" => 2, "body" => "A rocket.", "article_id" => rockets.id, "improvements" => [] },
                 body.slice("selection_start", "selection_length", "body", "article_id", "improvements"))
    assert_equal user_json(users(:ada)), body["user"]
    assert_not_equal 999_999, body["id"]
    assert_equal users(:ada), Annotation.find(body["id"]).user
  end

  test "create allows touching ranges and the exact end of the body" do
    log_in_as users(:ada)
    api_post create_path, { selection_start: 15, selection_length: 5, body: "touches the end of engine and start of vacuum" }
    assert_response :created
    length = rockets.body_utf16_length
    api_post create_path, { selection_start: 30, selection_length: length - 30, body: "to the end" }
    assert_response :created
  end

  test "create requires login" do
    assert_no_difference "Annotation.count" do
      api_post create_path, { selection_start: 0, selection_length: 2, body: "x" }
    end
    assert_error :unauthorized, "unauthorized"
  end

  test "create returns 404 for a missing article" do
    log_in_as users(:ada)
    api_post "/api/v1/articles/0/annotations", { selection_start: 0, selection_length: 2, body: "x" }
    assert_error :not_found, "not_found"
  end

  test "create validates in the documented order and reports detail keys" do
    log_in_as users(:ada)
    cases = [
      [ { selection_start: -1, selection_length: 3, body: "x" }, "selection_start", "must be greater than or equal to 0" ],
      [ { selection_start: 0, selection_length: 0, body: "x" }, "selection_length", "must be greater than or equal to 1" ],
      [ { selection_start: 40, selection_length: 1000, body: "x" }, "selection_length", "extends past the end of the article" ],
      [ { selection_start: 3, selection_length: 2, body: "x" }, "selection_start", "overlaps an existing annotation" ],
      [ { selection_start: 0, selection_length: 3, body: "x" }, "selection_start", "overlaps an existing annotation" ],
      [ { selection_start: 0, selection_length: 2, body: "" }, "body", nil ],
      [ { selection_start: 0, selection_length: 2, body: "x" * 2001 }, "body", nil ],
      [ { selection_start: 0, selection_length: 2 }, "body", nil ],
      [ { selection_length: 2, body: "x" }, "selection_start", nil ],
      [ { selection_start: 0, body: "x" }, "selection_length", nil ]
    ]
    assert_no_difference "Annotation.count" do
      cases.each do |body, key, detail|
        api_post create_path, body
        assert_validation_error key, detail
      end
    end
  end

  test "create rejects non-integer offsets with 'is not an integer'" do
    log_in_as users(:ada)
    [ "5", 5.5, 5.0, true, [ 1 ], { "a" => 1 } ].each do |value|
      api_post create_path, { selection_start: value, selection_length: 2, body: "x" }
      assert_validation_error "selection_start", value.is_a?(String) || value.is_a?(Float) ? "is not an integer" : nil
      api_post create_path, { selection_start: 0, selection_length: value, body: "x" }
      assert_validation_error "selection_length", value.is_a?(String) || value.is_a?(Float) ? "is not an integer" : nil
    end
    api_post create_path, { selection_start: "abc", selection_length: 2, body: "x" }
    error = assert_validation_error "selection_start", "is not an integer"
    assert_equal "Selection start is not an integer", error["message"]
  end

  test "overlap error uses the documented message" do
    log_in_as users(:ada)
    api_post create_path, { selection_start: 3, selection_length: 2, body: "x" }
    error = assert_validation_error "selection_start", "overlaps an existing annotation"
    assert_equal "Selection start overlaps an existing annotation", error["message"]
    assert_equal({ "selection_start" => [ "overlaps an existing annotation" ] }, error["details"])
  end

  test "bounds are counted in UTF-16 code units" do
    log_in_as users(:ada)
    article = Article.create!(user: users(:ada), title: "Emoji", body: "a😀b")
    api_post create_path(article), { selection_start: 0, selection_length: 5, body: "x" }
    assert_validation_error "selection_length", "extends past the end of the article"
    api_post create_path(article), { selection_start: 0, selection_length: 4, body: "x" }
    assert_response :created
  end

  test "shared annotation vectors hold through the API" do
    log_in_as users(:ada)
    vectors = JSON.parse(Rails.root.join("docs/annotation_vectors.json").read).fetch("vectors")
    vectors.each do |vector|
      body = vector["body"] || ("x" * vector["body_length"])
      article = Article.create!(user: users(:guest), title: vector["name"].to_s[0, 50].presence || "v", body: body)
      vector["existing"].each do |start, length|
        Annotation.create_serialized!(article: article, user: users(:guest), selection_start: start, selection_length: length, body: "e")
      end
      start, length = vector["proposed"]
      api_post create_path(article), { selection_start: start, selection_length: length, body: "p" }
      if vector["valid"]
        assert_response :created, vector["name"]
      else
        assert_validation_error vector["error_field"]
      end
    end
  end

  test "destroy removes the annotation and its improvements" do
    log_in_as users(:ada)
    annotation = annotations(:engine)
    assert_difference "Annotation.count", -1 do
      delete "/api/v1/annotations/#{annotation.id}"
    end
    assert_response :no_content
    assert_empty response.body
    assert_equal 0, Improvement.where(annotation_id: annotation.id).count
    assert Annotation.exists?(annotations(:vacuum).id)
  end

  test "destroy requires login" do
    assert_no_difference "Annotation.count" do
      delete "/api/v1/annotations/#{annotations(:engine).id}"
    end
    assert_error :unauthorized, "unauthorized"
  end

  test "destroy returns 404 for missing and for not owned annotations, even for the article owner" do
    log_in_as users(:guest)
    assert_equal users(:guest), rockets.user
    assert_no_difference "Annotation.count" do
      delete "/api/v1/annotations/#{annotations(:engine).id}"
      assert_error :not_found, "not_found"
      delete "/api/v1/annotations/0"
      assert_error :not_found, "not_found"
    end
  end

  test "write verbs without a CSRF token return 403" do
    log_in_as users(:ada)
    with_forgery_protection do
      api_post create_path, { selection_start: 0, selection_length: 2, body: "x" }
      assert_error :forbidden, "invalid_csrf_token"
      delete "/api/v1/annotations/#{annotations(:engine).id}"
      assert_error :forbidden, "invalid_csrf_token"
    end
    assert Annotation.exists?(annotations(:engine).id)
  end

  test "malformed json returns 400" do
    log_in_as users(:ada)
    api_post create_path, "{nope"
    assert_error :bad_request, "bad_request"
  end
end
