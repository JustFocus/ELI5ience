class UsersController < ApplicationController


	# TODO: Redirects/renders
	# def new
	# 	@user = User.new
	# end

	def new
		@user = User.new
		render :new
	end

	def create
		@user = User.new(user_params)

		if @user.save
			sign_in(@user)
			redirect_to root_url
		else
			flash.now[:errors] = @user.errors.full_messages
			render :new
		end
	end

	def show
		@user = User.find_by_id(params[:id])
		render :show
	end

	private
	def user_params
		params.require(:user).permit(:username, :password, :expertise)
	end

end