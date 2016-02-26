class Article < ActiveRecord::Base
	validates :title, :body, :author_id, presence: true

	belongs_to :user,
	foreign_key: :author_id,
	class_name: "User"

	has_many :comments

end
