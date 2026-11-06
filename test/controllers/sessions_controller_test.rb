require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  setup { ActionController::Base.cache_store.clear }

  test "new renders the login form with labels and guest button" do
    get new_session_path
    assert_response :success
    assert_select "label[for=username]", "Username"
    assert_select "label[for=password]", "Password"
    assert_select "form[action='/session'] input[type=submit][value='Log In']"
    assert_select "form[action='/guest_session'] button", "Log In as Guest"
    assert_select "a[href='/users/new']", "Create Account"
    assert_select "input[type=hidden][value=guestguest]", false
  end

  test "logged out navbar" do
    get root_path
    assert_select "h1", "Welcome to ELI5ience!"
    assert_select "nav a", "Log In / Guest"
    assert_select "nav a", "Create Account"
    assert_select "nav button", false
  end

  test "login success shows the logged in navbar" do
    assert_difference "Session.count", 1 do
      post session_path, params: { username: "ada", password: "password123" }
    end
    assert_redirected_to root_path
    assert cookies[:session_id].present?
    follow_redirect!
    assert_select "nav a[href=?]", "/users/#{users(:ada).id}", "Welcome, ada"
    assert_select "nav form[action='/session'] button", "Sign Out"
  end

  test "login is case insensitive on username" do
    post session_path, params: { username: "ADA", password: "password123" }
    assert_redirected_to root_path
  end

  test "login with wrong password re-renders with an error and no echoed password" do
    assert_no_difference "Session.count" do
      post session_path, params: { username: "ada", password: "nope-nope" }
    end
    assert_response :unprocessable_content
    assert_select "[role=alert]", "Invalid username or password."
    assert_select "input[name=username][value=ada]"
    assert_no_match "nope-nope", response.body
    assert_nil cookies[:session_id].presence
  end

  test "login with unknown user fails the same way" do
    post session_path, params: { username: "ghost", password: "password123" }
    assert_response :unprocessable_content
    assert_select "[role=alert]", "Invalid username or password."
  end

  test "logout ends the session and destroys the Session row" do
    post session_path, params: { username: "ada", password: "password123" }
    session_id = Session.last.id

    assert_difference "Session.count", -1 do
      delete session_path
    end
    assert_redirected_to new_session_path
    assert_not Session.exists?(session_id)

    get root_path
    assert_select "nav a", "Log In / Guest"
  end

  test "rate limit blocks login after 10 attempts" do
    10.times do
      post session_path, params: { username: "ada", password: "wrong-password" }
      assert_response :unprocessable_content
    end
    assert_no_difference "Session.count" do
      post session_path, params: { username: "ada", password: "password123" }
    end
    assert_redirected_to new_session_path
    assert_equal "Too many login attempts. Try again later.", flash[:alert]
  end
end
