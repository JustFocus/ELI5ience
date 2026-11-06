require "test_helper"

# The SPA shell is served for explicit client routes only (config/routes.rb), never a catch-all.
class SpaShellTest < ActionDispatch::IntegrationTest
  SHELL_PATHS = [
    "/",
    "/articles/new",
    "/articles/1",
    "/articles/1/annotations/2",
    "/users/1"
  ].freeze

  # Test env disables forgery protection, which also omits the csrf-token meta tag the SPA needs.
  setup { @forgery_protection = ActionController::Base.allow_forgery_protection; ActionController::Base.allow_forgery_protection = true }
  teardown { ActionController::Base.allow_forgery_protection = @forgery_protection }

  SHELL_PATHS.each do |path|
    test "GET #{path} returns the SPA shell" do
      get path
      assert_response :success
      assert_equal "text/html", response.media_type
      assert_select "main #root", 1
      assert_select "meta[name=csrf-token]", 1
      assert_select "script[type=module][src*=application]"
      assert_select "link[rel=stylesheet][href*=theme]"
    end
  end

  test "shell does not inline user data, even when logged in" do
    sign_in_as users(:ada)
    get "/"
    assert_response :success
    assert_select "nav a[href='/users/#{users(:ada).id}']", "Welcome, ada"
    assert_no_match "Physicist", response.body
  end

  test "shell keeps the server-rendered navbar and footer" do
    get "/"
    assert_select "nav[aria-label=Main] a[href='/session/new']", "Log In / Guest"
    assert_select "nav[aria-label=Main] a[href='/users/new']", "Create Account"
    assert_select "footer", /Colin McMahon/
  end

  test "server-rendered pages are not shadowed by the shell" do
    get "/users/new"
    assert_response :success
    assert_select "h1", "Create Account"
    assert_select "#root", false

    get "/session/new"
    assert_response :success
    assert_select "h1", "Log In"
    assert_select "#root", false
  end

  test "health check and API are not shadowed by the shell" do
    get "/up"
    assert_response :success
    get "/api/v1/me"
    assert_equal "application/json", response.media_type
  end

  test "unknown paths are 404, not the shell" do
    [ "/nope", "/articles", "/articles/abc", "/articles/1/edit", "/users", "/users/abc", "/articles/1/annotations" ].each do |path|
      get path
      assert_response :not_found, "expected 404 for #{path}"
      assert_select "#root", false
    end
  end
end
