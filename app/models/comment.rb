class Comment < ApplicationRecord
  BODY_MAX = 2000

  belongs_to :article
  belongs_to :user

  normalizes :body, with: ->(text) { text.strip }

  validates :body, presence: true, length: { maximum: BODY_MAX }
end
