require "test_helper"

class ApiMeTest < ActionDispatch::IntegrationTest
  test "logged out returns null user" do
    get "/api/v1/me"
    assert_response :success
    assert_equal "application/json", response.media_type
    assert_equal({ "user" => nil }, response.parsed_body)
  end

  test "logged in returns id, username and expertise only" do
    sign_in_as users(:ada)
    get "/api/v1/me"
    assert_response :success
    assert_equal({ "user" => { "id" => users(:ada).id, "username" => "ada", "expertise" => "Physicist" } }, response.parsed_body)
  end

  test "expertise is null when absent" do
    sign_in_as users(:no_expertise)
    get "/api/v1/me"
    assert_nil response.parsed_body.dig("user", "expertise")
    assert_equal %w[expertise id username], response.parsed_body["user"].keys.sort
  end
end
