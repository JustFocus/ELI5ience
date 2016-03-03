class Improvement < ActiveRecord::Base

	validates :body, :user_id, :annotation_id, presence: true

	belongs_to :user

	belongs_to :annotation

end
