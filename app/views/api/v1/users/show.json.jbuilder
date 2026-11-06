json.partial! "api/v1/users/user", user: @user
json.created_at @user.created_at.utc.iso8601(3)
json.articles @articles, partial: "api/v1/articles/summary", as: :article
