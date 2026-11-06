# Serves the React single-page app shell. Each client route is declared
# explicitly in config/routes.rb and points here; the SPA reads the current
# user from GET /api/v1/me, so nothing user-specific is rendered into the shell.
class SpaController < ApplicationController
  allow_unauthenticated_access only: :show

  def show
  end
end
