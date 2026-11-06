json.(improvement, :id, :annotation_id, :body)
json.user { json.partial! "api/v1/users/user", user: improvement.user }
json.created_at improvement.created_at.utc.iso8601(3)
