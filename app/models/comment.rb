class Comment < ActiveRecord::Base
	validates :user_id, :article_id, presence: true

	belongs_to :user

	belongs_to :article
end
