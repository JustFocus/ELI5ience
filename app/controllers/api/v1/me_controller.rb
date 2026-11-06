module Api
  module V1
    class MeController < BaseController
      def show
        @user = current_user
      end
    end
  end
end
