module Api
  module V1
    class ArticlesController < BaseController
      INDEX_LIMIT = 100

      def index
        @articles = Article.includes(:user).order(created_at: :desc, id: :desc).limit(INDEX_LIMIT)
      end

      def show
        @article = Article.includes(:user, comments: :user, annotations: [ :user, { improvements: :user } ]).find(params[:id])
      end

      def create
        @article = Current.user.articles.create!(article_params)
        render :show, status: :created
      end

      def destroy
        Current.user.articles.find(params[:id]).destroy!
        head :no_content
      end

      private
        def article_params
          params.slice(:title, :body, :image_link).permit(:title, :body, :image_link)
        end
    end
  end
end
