# json.ignore_nil!
# json.id @user.id
# json.username @user.username
# json.expertise @user.expertise

if @user
	json.extract! @user, :id, :username, :expertise
else
	json.null!
end

# json.extract! @user, :id, :username, :expertise
# TODO: extract needs to return empty object not nill
