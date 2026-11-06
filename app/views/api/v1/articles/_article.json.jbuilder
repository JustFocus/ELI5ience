json.(article, :id, :title, :body, :image_link)
json.user { json.partial! "api/v1/users/user", user: article.user }
json.created_at article.created_at.utc.iso8601(3)
json.annotations article.annotations, partial: "api/v1/annotations/annotation", as: :annotation
json.comments article.comments, partial: "api/v1/comments/comment", as: :comment
