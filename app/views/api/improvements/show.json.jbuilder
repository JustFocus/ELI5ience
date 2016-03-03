json.extract! @improvement, :id, :annotation_id, :body

json.user_id @improvement.user.id
json.created_at @improvement.user.created_at
json.username @improvement.user.username
json.expertise @improvement.user.expertise
