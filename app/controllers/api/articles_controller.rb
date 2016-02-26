class Api::ArticlesController < ApplicationController
	def index
    @articles = Article.includes(:user, :comments)

			# TODO: search
	    # if(bounds)
	    #   articles = Article.in_bounds(bounds)
	    # end

	    # if (params[:minSeating] && params[:maxSeating])
	    #   articles = articles.where(seating: seating_range)
	    # end

		# TODO: n+1?
    # @articles = articles.includes(:reviews)
    render 'index'
  end

	def show
		article = Article.includes(:comments).find_by(id: params[:id])
		render json: article
	end

  def create
		article = params[:article]
		article[:author_id] = current_user.id
		#TODO: Add error if user is not logged in
    article = Article.create!(article_params)
    render json: article
  end

	def destroy
		article = Article.find_by(id: params[:id])
		article.destroy
		render json: article
	end

	def update
		article = Article.find_by(id: params[:id])
		article.update(article_params)
		render json: article
	end

	private

	def article_params
		params.require(:article).permit(
			:title,
			:body,
			:image_link,
			:background_link,
			:author_id,
			:locked
		)
	end

end
