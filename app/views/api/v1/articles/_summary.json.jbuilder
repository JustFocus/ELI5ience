json.(article, :id, :title, :excerpt, :image_link, :comments_count)
json.user { json.partial! "api/v1/users/user", user: article.user }
json.created_at article.created_at.utc.iso8601(3)
