# Placeholder landing page. Phase 3 replaces it with the SPA shell.
class HomeController < ApplicationController
  allow_unauthenticated_access only: :show

  def show
  end
end
