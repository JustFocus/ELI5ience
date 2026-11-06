module Api
  module V1
    class UsersController < BaseController
      def show
        @user = User.find(params[:id])
        @articles = @user.articles.includes(:user).order(created_at: :desc, id: :desc).limit(ArticlesController::INDEX_LIMIT)
      end
    end
  end
end
