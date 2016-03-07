if @user
	json.extract! @user, :id, :username, :expertise
else
	json.null!
end
