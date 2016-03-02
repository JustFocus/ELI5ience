class Api::CommentsController < ApplicationController
	def index
    @comments = Comment.includes(:user)
    render 'index'
  end

	def show
		comment = Comment.find_by(id: params[:id])
		render json: comment
	end

  def create
		comment = params[:comment]
		comment[:user_id] = current_user.id
		#TODO: Add error if user is not logged in
    comment = Comment.create!(comment_params)
		comments = Article.find_by(id: comment[:article_id]).comments
    render json: comments
  end

	def destroy
		comment = Comment.find_by(id: params[:id])
		# article = Article.find_by(id: params[:comment][:article_id])
		comment.destroy
		comments = Article.find_by(id: comment[:article_id]).comments
    render json: comments
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
