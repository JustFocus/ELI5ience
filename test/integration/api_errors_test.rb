require "test_helper"

# Exercises the shared Api::V1::BaseController behavior through a throwaway
# controller, since real write endpoints arrive in a later step.
class ApiErrorsTest < ActionDispatch::IntegrationTest
  class EchoController < Api::V1::BaseController
    def create
      params.permit!
      render json: { echo: params[:value] }, status: :created
    end

    def missing
      User.find(0)
    end

    def invalid
      User.create!(username: "x")
    end
  end

  def with_echo_routes(&block)
    with_routing do |set|
      set.draw do
        namespace :api do
          namespace :v1, defaults: { format: :json } do
            post "echo", to: "/api_errors_test/echo#create"
            get "missing", to: "/api_errors_test/echo#missing"
            post "invalid", to: "/api_errors_test/echo#invalid"
            match "*unmatched", to: "base#route_not_found", via: :all
          end
        end
        resource :session, only: %i[ new create destroy ]
      end
      block.call
    end
  end

  def json_post(path, body, headers = {})
    post path, params: body, headers: { "CONTENT_TYPE" => "application/json" }.merge(headers)
  end

  def assert_error(status, code)
    assert_response status
    assert_equal "application/json", response.media_type
    error = response.parsed_body["error"]
    assert_equal code, error["code"]
    assert_kind_of String, error["message"]
    assert_kind_of Hash, error["details"]
    error
  end

  def log_in
    sign_in_as users(:ada)
  end

  test "unknown api route returns 404 json for GET and POST" do
    get "/api/v1/nope"
    assert_error :not_found, "not_found"
    post "/api/v1/nope/deeper"
    assert_error :not_found, "not_found"
  end

  test "unauthenticated write returns 401" do
    with_echo_routes do
      json_post "/api/v1/echo", { value: 1 }.to_json
      assert_error :unauthorized, "unauthorized"
    end
  end

  test "authenticated write succeeds" do
    with_echo_routes do
      log_in
      json_post "/api/v1/echo", { value: 1 }.to_json
      assert_response :created
      assert_equal 1, response.parsed_body["echo"]
    end
  end

  test "malformed json returns 400" do
    with_echo_routes do
      log_in
      json_post "/api/v1/echo", "{not json"
      assert_error :bad_request, "bad_request"
    end
  end

  test "missing record returns 404" do
    with_echo_routes do
      get "/api/v1/missing"
      assert_error :not_found, "not_found"
    end
  end

  test "record invalid returns 422 with details" do
    with_echo_routes do
      log_in
      json_post "/api/v1/invalid", {}.to_json
      error = assert_error :unprocessable_content, "validation_failed"
      assert_includes error["details"].keys, "username"
      assert_includes error["details"].keys, "password"
      assert_match(/\APassword can't be blank/, error["message"])
    end
  end

  test "post without a CSRF token returns 403 json when forgery protection is on" do
    with_echo_routes do
      original = ActionController::Base.allow_forgery_protection
      ActionController::Base.allow_forgery_protection = true
      begin
        # Logged out: CSRF is checked before authentication, so 403 not 401.
        json_post "/api/v1/echo", { value: 1 }.to_json
        assert_error :forbidden, "invalid_csrf_token"

        json_post "/api/v1/echo", { value: 1 }.to_json, "X-CSRF-Token" => "bogus"
        assert_error :forbidden, "invalid_csrf_token"
      ensure
        ActionController::Base.allow_forgery_protection = original
      end
    end
  end
end
