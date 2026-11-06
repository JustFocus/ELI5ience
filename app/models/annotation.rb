# Offsets are UTF-16 code units; see docs/api.md "Annotation offsets (normative)".
class Annotation < ApplicationRecord
  BODY_MAX = 2000

  belongs_to :article
  belongs_to :user
  has_many :improvements, -> { order(:created_at, :id) }, dependent: :destroy

  normalizes :body, with: ->(text) { text.strip }

  validates :body, presence: true, length: { maximum: BODY_MAX }
  validate :validate_selection

  # Check-and-insert under a row lock on the article so two concurrent requests
  # cannot both pass the overlap check. Raises ActiveRecord::RecordInvalid.
  def self.create_serialized!(article:, **attrs)
    article.with_lock { create!(article: article, **attrs) }
  end

  def selection_end
    selection_start + selection_length
  end

  private

  # Rules run in order and only the first failure is reported.
  def validate_selection
    return unless article
    return unless selection_integers?
    return errors.add(:selection_start, :greater_than_or_equal_to, count: 0) if selection_start < 0
    return errors.add(:selection_length, :greater_than_or_equal_to, count: 1) if selection_length < 1
    return errors.add(:selection_length, "extends past the end of the article") if selection_end > article.body_utf16_length

    errors.add(:selection_start, "overlaps an existing annotation") if overlapping.exists?
  end

  def selection_integers?
    %i[selection_start selection_length].each do |field|
      value = public_send(field)
      raw = public_send(:"#{field}_before_type_cast")
      if value.nil? && raw.blank?
        errors.add(field, :blank)
      elsif value.nil? || (attribute_changed?(field) && !raw.is_a?(Integer))
        errors.add(field, "is not an integer")
      end
    end
    errors.empty?
  end

  def overlapping
    scope = Annotation.where(article_id: article.id)
      .where("selection_start < ? AND selection_start + selection_length > ?", selection_end, selection_start)
    persisted? ? scope.where.not(id: id) : scope
  end
end
