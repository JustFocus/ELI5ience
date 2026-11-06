require "test_helper"

class ApiCommentsTest < ActionDispatch::IntegrationTest
  def rockets
    articles(:rockets)
  end

  def create_path(article = rockets)
    "/api/v1/articles/#{article.id}/comments"
  end

  test "create returns 201 with the comment shape, takes the user from the session and bumps comments_count" do
    log_in_as users(:ada)
    assert_difference -> { rockets.reload.comments_count }, 1 do
      api_post create_path, { body: "  Nice! ", user_id: users(:guest).id, article_id: articles(:plain).id, id: 999_999,
                              user: { id: users(:guest).id }, created_at: "2000-01-01T00:00:00.000Z" }
    end
    assert_response :created
    body = response.parsed_body
    assert_shape ApiTestHelper::COMMENT_SHAPE, body
    assert_equal "Nice!", body["body"]
    assert_equal rockets.id, body["article_id"]
    assert_equal user_json(users(:ada)), body["user"]
    assert_not_equal 999_999, body["id"]
    assert_operator Time.iso8601(body["created_at"]), :>, 1.minute.ago
    assert_equal users(:ada), Comment.find(body["id"]).user
  end

  test "create requires login" do
    assert_no_difference "Comment.count" do
      api_post create_path, { body: "x" }
    end
    assert_error :unauthorized, "unauthorized"
  end

  test "create returns 404 for a missing article" do
    log_in_as users(:ada)
    api_post "/api/v1/articles/0/comments", { body: "x" }
    assert_error :not_found, "not_found"
  end

  test "create validates body" do
    log_in_as users(:ada)
    assert_no_difference "Comment.count" do
      [ {}, { body: "" }, { body: "   " }, { body: "x" * 2001 }, { body: { "a" => 1 } } ].each do |params|
        api_post create_path, params
        error = assert_validation_error "body"
        assert_match(/\ABody /, error["message"])
      end
    end
    api_post create_path, { body: "x" * 2000 }
    assert_response :created
  end

  test "create with malformed json returns 400" do
    log_in_as users(:ada)
    api_post create_path, "{nope"
    assert_error :bad_request, "bad_request"
  end

  test "destroy removes the comment and decrements comments_count" do
    log_in_as users(:ada)
    assert_difference -> { rockets.reload.comments_count }, -1 do
      delete "/api/v1/comments/#{comments(:first).id}"
    end
    assert_response :no_content
    assert_empty response.body
    assert_not Comment.exists?(comments(:first).id)
  end

  test "destroy requires login" do
    assert_no_difference "Comment.count" do
      delete "/api/v1/comments/#{comments(:first).id}"
    end
    assert_error :unauthorized, "unauthorized"
  end

  test "destroy returns 404 for missing and for not owned comments, even for the article owner" do
    log_in_as users(:guest)
    assert_equal users(:guest), rockets.user
    assert_no_difference "Comment.count" do
      delete "/api/v1/comments/#{comments(:first).id}"
      assert_error :not_found, "not_found"
      delete "/api/v1/comments/0"
      assert_error :not_found, "not_found"
    end
  end

  test "write verbs without a CSRF token return 403" do
    log_in_as users(:ada)
    with_forgery_protection do
      api_post create_path, { body: "x" }
      assert_error :forbidden, "invalid_csrf_token"
      delete "/api/v1/comments/#{comments(:first).id}"
      assert_error :forbidden, "invalid_csrf_token"
    end
    assert Comment.exists?(comments(:first).id)
  end
end
