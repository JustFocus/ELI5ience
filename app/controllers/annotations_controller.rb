class Api::AnnotationsController < ApplicationController
	def index
    @annotations = Annotation.includes(:user)
    render 'index'
  end

	def show
		annotation = Annotation.find_by(id: params[:id])
		render json: annotation
	end

  def create
		annotation = params[:annotation]
		annotation[:user_id] = current_user.id
		#TODO: Add error if user is not logged in
    annotation = Annotation.create!(annotation_params)
    render json: annotation
  end

	def destroy
		annotation = Annotation.find_by(id: params[:id])
		#TODO: check if author is current user
		annotation.destroy
		render json: annotation
	end

	def update
		annotation = Annotation.find_by(id: params[:id])
		#TODO: check if author is current user
		annotation.update(params)
		render json: annotation
	end

	private

	def annotation_params
		params.require(:annotation).permit(
			:body,
			:author_id,
			:article_id,
			:selection_start,
			:selection_length
		)
	end
end
