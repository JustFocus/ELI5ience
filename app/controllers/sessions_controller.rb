class SessionsController < ApplicationController

	def new
	 @user = User.new
	 render :new
	end

	def create
		user = User.find_by_credentials(
			params[:user][:username],
			params[:user][:password]
		)
		if user
			sign_in(user)
			redirect_to root_url
		else
			flash.now[:errors] = ["Invalid usename or password"]
			@user = User.new
	 	 	render :new
		end
	end

	def destroy
		current_user.reset_session_token!
	  session[:session_token] = nil
		#TODO: change redirect to keep current page
	  redirect_to root_url
	end

end
