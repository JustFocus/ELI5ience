if @user
  json.user { json.partial! "api/v1/users/user", user: @user }
else
  json.user nil
end
