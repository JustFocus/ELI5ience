json.(annotation, :id, :article_id, :selection_start, :selection_length, :body)
json.user { json.partial! "api/v1/users/user", user: annotation.user }
json.created_at annotation.created_at.utc.iso8601(3)
json.improvements annotation.improvements, partial: "api/v1/improvements/improvement", as: :improvement
