class GuestSessionsController < ApplicationController
  allow_unauthenticated_access only: :create

  def create
    if guest = User.guest
      start_new_session_for guest
      redirect_to after_authentication_url
    else
      redirect_to new_session_path, alert: "The guest account is unavailable."
    end
  end
end
