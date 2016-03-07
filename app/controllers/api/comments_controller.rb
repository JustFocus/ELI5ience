class Api::CommentsController < ApplicationController
	def index
    @comments = Comment.includes(:user)
    render 'index'
  end

	def show
		@comment = Comment.includes(:user).find_by(id: params[:id])
		render 'show'
	end

  def create
		comment = params[:comment]
		comment[:user_id] = current_user.id
		#TODO: Add error if user is not logged in
    comment = Comment.create!(comment_params)

		@comment = Comment.includes(:user).find_by(id: comment.id)
		render 'show'
  end

	def destroy
		comment = Comment.find_by(id: params[:id])
		@comment = Comment.includes(:user).find_by(id: comment.id)
		comment.destroy
		render 'show'
	end

	private

	def comment_params
		params.require(:comment).permit(
			:body,
			:user_id,
			:article_id
		)
	end

end
