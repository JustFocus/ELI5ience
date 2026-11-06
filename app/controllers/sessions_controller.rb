class SessionsController < ApplicationController
  allow_unauthenticated_access only: %i[ new create ]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to new_session_path, alert: "Too many login attempts. Try again later." }

  def new
  end

  def create
    @username = params[:username].to_s
    if user = User.authenticate_by_credentials(@username, params[:password])
      start_new_session_for user
      redirect_to after_authentication_url
    else
      flash.now[:alert] = "Invalid username or password."
      render :new, status: :unprocessable_content
    end
  end

  def destroy
    terminate_session
    redirect_to new_session_path, status: :see_other
  end
end
