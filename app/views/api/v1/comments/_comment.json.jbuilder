json.(comment, :id, :article_id, :body)
json.user { json.partial! "api/v1/users/user", user: comment.user }
json.created_at comment.created_at.utc.iso8601(3)
