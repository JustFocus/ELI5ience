class Api::UsersController < ApplicationController

	def show
		@user = User.find_by_id(params[:id])
		render :show
	end

end
