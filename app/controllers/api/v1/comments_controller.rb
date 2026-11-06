module Api
  module V1
    class CommentsController < BaseController
      def create
        article = Article.find(params[:article_id])
        @comment = article.comments.create!(params.slice(:body).permit(:body).merge(user: Current.user))
        render :show, status: :created
      end

      def destroy
        Current.user.comments.find(params[:id]).destroy!
        head :no_content
      end
    end
  end
end
