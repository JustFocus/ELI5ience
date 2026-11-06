module Api
  module V1
    # Shared behavior for every /api/v1 controller. Error shape and codes are
    # specified in docs/api.md. Order of checks: CSRF (403), authentication
    # (401), existence and ownership (404), validation (422).
    class BaseController < ActionController::Base
      include Authentication

      # Must run before require_authentication so CSRF failures win over 401.
      protect_from_forgery with: :exception, prepend: true

      # Reads are public; every non-GET request needs a logged-in user.
      skip_before_action :require_authentication, if: -> { request.get? || request.head? || action_name == "route_not_found" }

      rescue_from ActionController::InvalidAuthenticityToken do
        render_error :invalid_csrf_token, "Invalid or missing CSRF token", :forbidden
      end
      rescue_from ActionDispatch::Http::Parameters::ParseError do
        render_error :bad_request, "Malformed JSON request body", :bad_request
      end
      rescue_from ActiveRecord::RecordNotFound do
        render_error :not_found, "Not found", :not_found
      end
      rescue_from ActiveRecord::RecordInvalid do |error|
        render_validation_error error.record
      end

      skip_forgery_protection only: :route_not_found

      def route_not_found
        render_error :not_found, "Not found", :not_found
      end

      private
        def request_authentication
          render_error :unauthorized, "You must be logged in", :unauthorized
        end

        def render_error(code, message, status, details = {})
          render json: { error: { code: code, message: message, details: details } }, status: status
        end

        def render_validation_error(record)
          details = record.errors.to_hash
          field, messages = details.first
          message = field ? "#{record.class.human_attribute_name(field)} #{messages.first}" : "Validation failed"
          render_error :validation_failed, message, :unprocessable_content, details
        end
    end
  end
end
