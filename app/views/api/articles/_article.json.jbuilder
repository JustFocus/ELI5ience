json.extract! article, :id, :title, :body, :image_link, :background_link, :author_id, :locked
json.author_id article.user.id
json.username article.user.username
json.expertise article.user.expertise

# json.comments article.comments, :body, :created_at

json.comments article.comments do |comment|
	json.id comment.id
	json.article_id comment.article_id
	json.body comment.body
	json.user_id comment.user_id
	json.created_at comment.created_at
	json.username comment.user.username
	json.expertise comment.user.expertise
end


json.annotations article.annotations do |annotation|
	json.id annotation.id
	json.body annotation.body
	json.selection_start annotation.selection_start
	json.selection_length annotation.selection_length
	json.user_id annotation.author_id
	json.created_at annotation.created_at
	json.username annotation.user.username
	json.expertise annotation.user.expertise
		json.improvements annotation.improvements do |improvement|
			json.id improvement.id
			json.annotation_id improvement.annotation_id
			json.body improvement.body
			json.user_id improvement.user_id
			json.created_at improvement.created_at
			json.username improvement.user.username
			json.expertise improvement.user.expertise
		end
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
