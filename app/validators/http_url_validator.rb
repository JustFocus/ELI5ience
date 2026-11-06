# Accepts only absolute http(s) URLs with a host. Blank values are skipped
# (nil means "no link").
#
#   validates :image_link, http_url: { maximum: 2048 }
class HttpUrlValidator < ActiveModel::EachValidator
  SCHEMES = %w[http https].freeze

  def validate_each(record, attribute, value)
    return if value.blank?

    max = options[:maximum]
    if max && value.length > max
      record.errors.add(attribute, :too_long, count: max)
    elsif !http_url?(value)
      record.errors.add(attribute, options[:message] || "must be an http or https URL")
    end
  end

  private

  def http_url?(value)
    uri = URI.parse(value)
    SCHEMES.include?(uri.scheme&.downcase) && uri.host.present?
  rescue URI::InvalidURIError
    false
  end
end
