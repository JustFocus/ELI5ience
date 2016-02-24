class StaticPagesController < ApplicationController
	def root
		if current_user
			@user = User.find_by_id(current_user.id)
		else
			
		end
	end
end
