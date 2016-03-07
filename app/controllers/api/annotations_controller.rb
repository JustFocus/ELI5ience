class Api::AnnotationsController < ApplicationController
	def index
    @annotations = Annotation.includes(:user, :improvements)
    render 'index'
  end

	def show
		annotation = Annotation.find_by(id: params[:id])
		render json: annotation
	end

  def create
		annotation = params[:annotation]
		annotation[:author_id] = current_user.id
    annotation = Annotation.create!(annotation_params)
		annotations = Article.find_by(id: annotation[:article_id]).annotations
    render json: annotations
  end

	def destroy
		annotation = Annotation.find_by(id: params[:id])
		annotation.destroy
		annotations = Article.find_by(id: annotation[:article_id]).annotations
		render json: annotation
	end

	def update
		annotation = Annotation.find_by(id: params[:id])
		annotation.update(params)
		annotations = Article.find_by(id: annotation[:article_id]).annotations
		render json: annotations
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
