require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  test "new renders labelled fields" do
    get new_user_path
    assert_response :success
    assert_select "h1", "Create Account"
    %w[Username Expertise Password].each do |label|
      assert_select "label", label
    end
    assert_select "form[action='/users']"
  end

  test "create signs up, logs in and redirects to root" do
    assert_difference [ "User.count", "Session.count" ], 1 do
      post users_path, params: { user: { username: "newbie", expertise: "Botanist", password: "sup3rsecret" } }
    end
    assert_redirected_to root_path
    follow_redirect!
    assert_select "span", "Welcome, newbie"
    assert_equal "Botanist", User.find_by!(username: "newbie").expertise
  end

  test "create with invalid data re-renders errors and does not echo the password" do
    assert_no_difference [ "User.count", "Session.count" ] do
      post users_path, params: { user: { username: "ADA", expertise: "x", password: "sh0rt" } }
    end
    assert_response :unprocessable_content
    messages = css_select("[role=alert] li").map(&:text)
    assert_includes messages, "Username has already been taken"
    assert_includes messages, "Password is too short (minimum is 8 characters)"
    assert_select "input[type=password][value]", false
    assert_no_match "sh0rt", response.body
  end

  test "create rejects a malformed username" do
    post users_path, params: { user: { username: "bad name!", password: "password123" } }
    assert_response :unprocessable_content
    assert_select "[role=alert]", /Username may only contain/
  end

  test "create without the user key is a bad request" do
    post users_path, params: {}
    assert_response :bad_request
  end
end
