json.extract! @comment, :id, :article_id, :body

json.user_id @comment.user.id
json.created_at @comment.user.created_at
json.username @comment.user.username
json.expertise @comment.user.expertise
