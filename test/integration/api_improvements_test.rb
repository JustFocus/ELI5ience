require "test_helper"

class ApiImprovementsTest < ActionDispatch::IntegrationTest
  def annotation
    annotations(:engine)
  end

  def create_path(target = annotation)
    "/api/v1/annotations/#{target.id}/improvements"
  end

  test "create returns 201 with the improvement shape and takes the user from the session" do
    log_in_as users(:no_expertise)
    assert_difference "Improvement.count", 1 do
      api_post create_path, { body: " Use simpler words. ", user_id: users(:guest).id, annotation_id: annotations(:vacuum).id,
                              id: 999_999, user: { id: users(:guest).id } }
    end
    assert_response :created
    body = response.parsed_body
    assert_shape ApiTestHelper::IMPROVEMENT_SHAPE, body
    assert_equal "Use simpler words.", body["body"]
    assert_equal annotation.id, body["annotation_id"]
    assert_equal user_json(users(:no_expertise)), body["user"]
    assert_not_equal 999_999, body["id"]
    assert_equal users(:no_expertise), Improvement.find(body["id"]).user
  end

  test "created improvement appears in the article's nested annotation" do
    log_in_as users(:ada)
    api_post create_path, { body: "Another one" }
    get "/api/v1/articles/#{annotation.article_id}"
    nested = response.parsed_body["annotations"].find { |a| a["id"] == annotation.id }["improvements"].last
    assert_equal response.parsed_body["annotations"].first["improvements"].last, nested
    assert_equal "Another one", nested["body"]
  end

  test "create requires login" do
    assert_no_difference "Improvement.count" do
      api_post create_path, { body: "x" }
    end
    assert_error :unauthorized, "unauthorized"
  end

  test "create returns 404 for a missing annotation" do
    log_in_as users(:ada)
    api_post "/api/v1/annotations/0/improvements", { body: "x" }
    assert_error :not_found, "not_found"
  end

  test "create validates body" do
    log_in_as users(:ada)
    assert_no_difference "Improvement.count" do
      [ {}, { body: "" }, { body: "x" * 2001 } ].each do |params|
        api_post create_path, params
        assert_validation_error "body"
      end
    end
  end

  test "create with malformed json returns 400" do
    log_in_as users(:ada)
    api_post create_path, "{nope"
    assert_error :bad_request, "bad_request"
  end

  test "destroy removes only the improvement" do
    log_in_as users(:guest)
    assert_difference "Improvement.count", -1 do
      delete "/api/v1/improvements/#{improvements(:simpler).id}"
    end
    assert_response :no_content
    assert_empty response.body
    assert Annotation.exists?(annotation.id)
  end

  test "destroy requires login" do
    assert_no_difference "Improvement.count" do
      delete "/api/v1/improvements/#{improvements(:simpler).id}"
    end
    assert_error :unauthorized, "unauthorized"
  end

  test "destroy returns 404 for missing and for not owned improvements, even for the annotation owner" do
    log_in_as users(:ada)
    assert_equal users(:ada), annotation.user
    assert_no_difference "Improvement.count" do
      delete "/api/v1/improvements/#{improvements(:simpler).id}"
      assert_error :not_found, "not_found"
      delete "/api/v1/improvements/0"
      assert_error :not_found, "not_found"
    end
  end

  test "write verbs without a CSRF token return 403" do
    log_in_as users(:guest)
    with_forgery_protection do
      api_post create_path, { body: "x" }
      assert_error :forbidden, "invalid_csrf_token"
      delete "/api/v1/improvements/#{improvements(:simpler).id}"
      assert_error :forbidden, "invalid_csrf_token"
    end
    assert Improvement.exists?(improvements(:simpler).id)
  end
end
