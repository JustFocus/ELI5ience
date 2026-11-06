require "test_helper"

class GuestSessionsControllerTest < ActionDispatch::IntegrationTest
  test "guest login starts a session as the guest user" do
    assert_difference "Session.count", 1 do
      post guest_session_path
    end
    assert_equal users(:guest), Session.last.user
    assert_redirected_to root_path
    follow_redirect!
    assert_select "nav span", "Welcome, guest_user"
  end

  test "missing guest account redirects to login with an alert" do
    users(:guest).destroy!
    post guest_session_path
    assert_redirected_to new_session_path
    follow_redirect!
    assert_select "[role=alert]", "The guest account is unavailable."
  end
end
