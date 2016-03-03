class Api::ImprovementsController < ApplicationController

	def index
    @improvements = Improvement.includes(:user)
    render 'index'
  end

	def show
		improvement = Improvement.find_by(id: params[:id])
		render json: improvement
	end

  def create
		improvement = params[:improvement]
		improvement[:user_id] = current_user.id
		#TODO: Add error if user is not logged in
    improvement = Improvement.create!(improvement_params)
    render json: improvement
  end

	def destroy
		improvement = Improvement.find_by(id: params[:id])
		# article = Article.find_by(id: params[:improvement][:article_id])
		improvement.destroy
    render json: improvement
	end

	private

	def improvement_params
		params.require(:improvement).permit(
			:body,
			:user_id,
			:annotation_id
		)
	end

end
