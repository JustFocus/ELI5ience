require "test_helper"

class ApiUsersTest < ActionDispatch::IntegrationTest
  test "show returns the profile with that user's article summaries" do
    ada = users(:ada)
    get "/api/v1/users/#{ada.id}"
    assert_response :success
    assert_equal "application/json", response.media_type
    body = response.parsed_body
    assert_shape ApiTestHelper::USER_PROFILE_SHAPE, body
    assert_equal user_json(ada).merge("created_at" => ada.created_at.utc.iso8601(3)), body.except("articles")
    assert_equal [ articles(:plain).id ], body["articles"].map { |a| a["id"] }
    assert_equal user_json(ada), body["articles"].first["user"]
    assert_equal 1, body["articles"].first["comments_count"]
  end

  test "show returns an empty articles list for a user with none" do
    get "/api/v1/users/#{users(:no_expertise).id}"
    assert_response :success
    assert_equal [], response.parsed_body["articles"]
    assert_nil response.parsed_body["expertise"]
  end

  test "show orders newest first and caps at 100" do
    ada = users(:ada)
    time = Time.current
    rows = Array.new(100) { |i| { user_id: ada.id, title: "T#{i}", body: "b", created_at: time, updated_at: time } }
    Article.insert_all!(rows)
    get "/api/v1/users/#{ada.id}"
    list = response.parsed_body["articles"]
    assert_equal 100, list.size
    assert_equal list.map { |a| a["id"] }.sort.reverse, list.map { |a| a["id"] }
  end

  test "show returns 404 for a missing user" do
    get "/api/v1/users/0"
    assert_error :not_found, "not_found"
  end

  test "show does not expose the password digest" do
    get "/api/v1/users/#{users(:ada).id}"
    assert_no_match(/password|session/, response.body)
  end
end
