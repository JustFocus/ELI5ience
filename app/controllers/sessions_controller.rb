class SessionsController < ApplicationController

	def new
	 @user = User.new

	 session[:referer_url] = url_for(:back)
	 render :new
	end

	def create
		user = User.find_by_credentials(
			params[:user][:username],
			params[:user][:password]
		)
		if user
			sign_in(user)
			redirect_to(session[:referer_url])
			# redirect_to request.env["HTTP_REFERER"]
			# redirect_to(:root)
		else
			flash.now[:errors] = ["Invalid username or password"]
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
