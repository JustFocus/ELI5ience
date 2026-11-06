module Api
  module V1
    class ImprovementsController < BaseController
      def create
        annotation = Annotation.find(params[:annotation_id])
        @improvement = annotation.improvements.create!(params.slice(:body).permit(:body).merge(user: Current.user))
        render :show, status: :created
      end

      def destroy
        Current.user.improvements.find(params[:id]).destroy!
        head :no_content
      end
    end
  end
end
