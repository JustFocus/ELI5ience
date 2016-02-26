json.extract! article, :id, :title, :body, :image_link, :background_link, :author_id, :locked
json.username article.user.username
json.expertise article.user.expertise

# TODO: votes/ratings
# json.average_rating article.average_rating

# TODO: annotation and votes with articles
# json.annotations do
#   json.partial! 'api/annotations/review', collection: article.annotations, as: :annotation
# end
# json.votes do
#   json.partial! 'api/votes/review', collection: article.votes, as: :vote
# end
