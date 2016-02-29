class Annotation < ActiveRecord::Base
	validates :body, :author_id, :article_id, :selection_start, :selection_length, presence: true

	belongs_to :user,
	foreign_key: :author_id,
	class_name: "User"

	belongs_to :article
end
