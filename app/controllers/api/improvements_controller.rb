class Api::ImprovementsController < ApplicationController

	def index
    @improvements = Improvement.includes(:user)
    render 'index'
  end

	def show
		improvement = Improvement.includes(:user).find_by(id: params[:id])
		render 'show'
	end

  def create
		improvement = params[:improvement]
		improvement[:user_id] = current_user.id
    # improvement = Improvement.new(improvement_params)
		improvement = Improvement.create(improvement_params)
		if improvement
			@improvement = Improvement.includes(:user).find_by(id: improvement.id)
			render 'show'
		else
			flash.now[:errors] = improvement.errors.full_messages
			render json: improvement.errors.full_messages
		end



  end

	def destroy
		improvement = Improvement.find_by(id: params[:id])
		@improvement = Improvement.includes(:user).find_by(id: improvement.id)
		improvement.destroy
		render 'show'
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
