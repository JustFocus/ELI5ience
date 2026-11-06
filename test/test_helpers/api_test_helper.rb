# Helpers for /api/v1 request tests: JSON verbs, login, error and shape
# assertions (shapes are transcribed from docs/api.md), and a SQL query counter.
module ApiTestHelper
  TIMESTAMP = /\A\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\z/

  USER_SHAPE = { "id" => :integer, "username" => :string, "expertise" => :string_or_null }.freeze
  ARTICLE_SUMMARY_SHAPE = {
    "id" => :integer, "title" => :string, "excerpt" => :string, "image_link" => :string_or_null,
    "comments_count" => :integer, "user" => USER_SHAPE, "created_at" => :timestamp
  }.freeze
  IMPROVEMENT_SHAPE = {
    "id" => :integer, "annotation_id" => :integer, "body" => :string, "user" => USER_SHAPE, "created_at" => :timestamp
  }.freeze
  ANNOTATION_SHAPE = {
    "id" => :integer, "article_id" => :integer, "selection_start" => :integer, "selection_length" => :integer,
    "body" => :string, "user" => USER_SHAPE, "improvements" => [ IMPROVEMENT_SHAPE ], "created_at" => :timestamp
  }.freeze
  COMMENT_SHAPE = {
    "id" => :integer, "article_id" => :integer, "body" => :string, "user" => USER_SHAPE, "created_at" => :timestamp
  }.freeze
  ARTICLE_SHAPE = {
    "id" => :integer, "title" => :string, "body" => :string, "image_link" => :string_or_null, "user" => USER_SHAPE,
    "created_at" => :timestamp, "annotations" => [ ANNOTATION_SHAPE ], "comments" => [ COMMENT_SHAPE ]
  }.freeze
  USER_PROFILE_SHAPE = USER_SHAPE.merge("created_at" => :timestamp, "articles" => [ ARTICLE_SUMMARY_SHAPE ]).freeze

  # Signs in by cookie (see SessionTestHelper) rather than posting to the login
  # page, which is rate limited to 10 attempts per 3 minutes per process.
  def log_in_as(user)
    sign_in_as(user)
  end

  def api_post(path, body = {}, headers = {})
    body = body.to_json unless body.is_a?(String)
    post path, params: body, headers: { "CONTENT_TYPE" => "application/json" }.merge(headers)
  end

  def assert_error(status, code)
    assert_response status
    assert_equal "application/json", response.media_type
    error = response.parsed_body["error"]
    assert_equal %w[code details message], error.keys.sort
    assert_equal code, error["code"]
    assert_kind_of String, error["message"]
    assert_kind_of Hash, error["details"]
    error
  end

  def assert_validation_error(details_key, detail = nil)
    error = assert_error :unprocessable_content, "validation_failed"
    assert_includes error["details"].keys, details_key
    assert_equal detail, error["details"][details_key].first if detail
    error
  end

  # Asserts the exact key set and value types of a JSON value against a shape:
  # a Hash of key => shape, a one-element Array (list of that shape), or a symbol type.
  def assert_shape(shape, actual, path = "$")
    case shape
    when Hash
      assert_kind_of Hash, actual, "#{path} should be an object"
      assert_equal shape.keys.sort, actual.keys.sort, "#{path} keys"
      shape.each { |key, sub| assert_shape(sub, actual[key], "#{path}.#{key}") }
    when Array
      assert_kind_of Array, actual, "#{path} should be an array"
      actual.each_with_index { |item, i| assert_shape(shape.first, item, "#{path}[#{i}]") }
    else
      assert_scalar shape, actual, path
    end
  end

  def assert_scalar(type, actual, path)
    case type
    when :integer then assert_kind_of Integer, actual, "#{path} should be an integer"
    when :string then assert_kind_of String, actual, "#{path} should be a string"
    when :string_or_null then assert(actual.nil? || actual.is_a?(String), "#{path} should be a string or null")
    when :timestamp then assert_match TIMESTAMP, actual.to_s, "#{path} should be ISO 8601 UTC with milliseconds"
    else flunk "unknown shape type #{type.inspect}"
    end
  end

  def user_json(user)
    { "id" => user.id, "username" => user.username, "expertise" => user.expertise }
  end

  # Number of SQL statements (excluding schema lookups and transaction control) run by the block.
  def count_queries(&block)
    queries = []
    callback = lambda do |*, payload|
      queries << payload[:sql] unless payload[:name] == "SCHEMA" || payload[:sql].match?(/\A\s*(BEGIN|COMMIT|ROLLBACK|SAVEPOINT|RELEASE)/)
    end
    ActiveSupport::Notifications.subscribed(callback, "sql.active_record", &block)
    queries.size
  end

  def with_forgery_protection
    original = ActionController::Base.allow_forgery_protection
    ActionController::Base.allow_forgery_protection = true
    yield
  ensure
    ActionController::Base.allow_forgery_protection = original
  end
end

ActiveSupport.on_load(:action_dispatch_integration_test) do
  include ApiTestHelper
end
