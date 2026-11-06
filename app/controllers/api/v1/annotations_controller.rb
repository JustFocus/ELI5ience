module Api
  module V1
    class AnnotationsController < BaseController
      def create
        article = Article.find(params[:article_id])
        @annotation = Annotation.create_serialized!(article: article, user: Current.user, **annotation_params.to_h.symbolize_keys)
        render :show, status: :created
      end

      def destroy
        Current.user.annotations.find(params[:id]).destroy!
        head :no_content
      end

      private
        def annotation_params
          params.slice(:selection_start, :selection_length, :body).permit(:selection_start, :selection_length, :body)
        end
    end
  end
end
