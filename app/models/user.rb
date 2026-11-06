class User < ApplicationRecord
  # Seeded demo account behind the "Log In as Guest" button (see db/seeds.rb).
  GUEST_USERNAME = "guest_user"

  PASSWORD_MIN_LENGTH = 8
  USERNAME_FORMAT = /\A[A-Za-z0-9_]+\z/

  has_secure_password
  has_many :sessions, dependent: :destroy
  has_many :articles, dependent: :destroy
  has_many :annotations, dependent: :destroy
  has_many :improvements, dependent: :destroy
  has_many :comments, dependent: :destroy

  normalizes :username, with: ->(name) { name.strip }
  normalizes :expertise, with: ->(text) { text.strip.presence }

  validates :username,
    length: { in: 3..30 },
    format: { with: USERNAME_FORMAT, message: "may only contain letters, digits and underscores" },
    uniqueness: { case_sensitive: false }
  validates :password, length: { minimum: PASSWORD_MIN_LENGTH }, allow_nil: true

  # Case-insensitive username lookup. A missing user still pays for a bcrypt
  # hash so response time does not reveal whether the username exists.
  def self.authenticate_by_credentials(username, password)
    user = find_by("lower(username) = ?", username.to_s.strip.downcase)
    if user
      user.authenticate(password.to_s)
    else
      new(password: password.to_s)
      false
    end
  end

  def self.guest
    find_by(username: GUEST_USERNAME)
  end
end
