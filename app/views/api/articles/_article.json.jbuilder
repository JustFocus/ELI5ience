json.extract! article, :id, :title, :body, :image_link, :background_link, :author_id, :locked
json.author_id article.user.id
json.username article.user.username
json.expertise article.user.expertise

# json.comments article.comments, :body, :created_at

json.comments article.comments do |comment|
	json.id comment.id
	json.body comment.body
	json.created_at comment.created_at
	json.username comment.user.username
	json.expertise comment.user.expertise
end


# TODO: votes/ratings
# json.average_rating article.average_rating

# TODO: annotation and votes with articles
# json.annotations do
#   json.partial! 'api/annotations/review', collection: article.annotations, as: :annotation
# end
# json.votes do
#   json.partial! 'api/votes/review', collection: article.votes, as: :vote
# end
