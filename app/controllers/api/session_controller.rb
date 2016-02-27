class Api::SessionController < ApplicationController

	def index
		@user = current_user
		# if @user
		# else
		# 	@user =
		# end
		render 'index'
	end

end
