class Article < ApplicationRecord
  TITLE_MAX = 200
  BODY_MAX = 50_000
  IMAGE_LINK_MAX = 2048
  EXCERPT_LENGTH = 200

  belongs_to :user
  has_many :annotations, -> { order(:selection_start, :id) }, dependent: :destroy
  has_many :comments, -> { order(:created_at, :id) }, dependent: :destroy

  normalizes :title, with: ->(text) { text.strip }
  # Annotation offsets index into body, so it is stored with "\n" line endings:
  # what the browser reads is exactly what the offsets refer to.
  normalizes :body, with: ->(text) { text.strip.gsub(/\r\n?/, "\n") }
  normalizes :image_link, with: ->(url) { url.strip.presence }

  validates :title, presence: true, length: { maximum: TITLE_MAX }
  validates :body, presence: true, length: { maximum: BODY_MAX }
  validates :image_link, http_url: { maximum: IMAGE_LINK_MAX }

  # Length in UTF-16 code units, the unit of JS String#length and annotation offsets.
  def body_utf16_length
    body.to_s.encode("UTF-16LE").bytesize / 2
  end

  # First 200 codepoints of body (Ruby slices by codepoint, so a surrogate pair
  # is never split), newlines collapsed to single spaces, trailing whitespace
  # stripped, "..." only when the body was longer. See docs/api.md.
  def excerpt
    text = body.to_s
    excerpt = text[0, EXCERPT_LENGTH].gsub(/\n+/, " ").rstrip
    text.length > EXCERPT_LENGTH ? "#{excerpt}..." : excerpt
  end
end
