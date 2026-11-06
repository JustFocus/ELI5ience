require "test_helper"

class AnnotationTest < ActiveSupport::TestCase
  # docs/annotation_vectors.json is the single source of truth: one test per vector.
  VECTORS = JSON.parse(File.read(Rails.root.join("docs/annotation_vectors.json"))).fetch("vectors")

  # An article whose body is exactly the vector's UTF-16 length, using the
  # vector's own body when it has one.
  def article_for(vector)
    body = vector["body"] || "x" * vector["body_length"]
    Article.create!(user: users(:ada), title: "Vector article", body: body).tap do |article|
      assert_equal vector["body_length"], article.body_utf16_length
    end
  end

  VECTORS.each do |vector|
    test "vector: #{vector["name"]}" do
      article = article_for(vector)
      vector["existing"].each do |start, length|
        Annotation.create!(article: article, user: users(:ada), selection_start: start, selection_length: length, body: "existing")
      end

      start, length = vector["proposed"]
      annotation = Annotation.new(article: article, user: users(:guest), selection_start: start, selection_length: length, body: "proposed")

      assert_equal vector["valid"], annotation.valid?, annotation.errors.full_messages.to_sentence
      unless vector["valid"]
        assert_equal [ vector["error_field"].to_sym ], annotation.errors.attribute_names
      end
    end
  end

  def build(attrs = {})
    Annotation.new({ article: articles(:plain), user: users(:ada), selection_start: 0, selection_length: 5, body: "Simple" }.merge(attrs))
  end

  test "error messages follow docs/api.md" do
    Annotation.create!(article: articles(:plain), user: users(:ada), selection_start: 0, selection_length: 4, body: "x")
    {
      { selection_start: -1 } => [ :selection_start, "must be greater than or equal to 0" ],
      { selection_length: 0 } => [ :selection_length, "must be greater than or equal to 1" ],
      { selection_start: 5, selection_length: 999 } => [ :selection_length, "extends past the end of the article" ],
      { selection_start: 2, selection_length: 4 } => [ :selection_start, "overlaps an existing annotation" ]
    }.each do |attrs, (field, message)|
      annotation = build(attrs)
      assert_not annotation.valid?
      assert_equal [ message ], annotation.errors[field]
    end
  end

  test "rules are checked in order and only the first failure is reported" do
    annotation = build(selection_start: -1, selection_length: 0)
    annotation.valid?
    assert_equal [ :selection_start ], annotation.errors.attribute_names
  end

  test "offsets must be present integers" do
    assert_not build(selection_start: nil).valid?
    assert_not build(selection_length: nil).valid?
    [ "3", 1.5, "abc", true ].each do |bad|
      annotation = build(selection_start: bad)
      assert_not annotation.valid?, "#{bad.inspect} should be invalid"
      assert_equal [ "is not an integer" ], annotation.errors[:selection_start]
    end
  end

  test "an annotation does not overlap itself and loaded records stay valid" do
    assert annotations(:engine).valid?
    assert Annotation.find(annotations(:engine).id).valid?
  end

  test "overlap is only checked against the same article" do
    assert build(article: articles(:plain), selection_start: 2, selection_length: 5).valid?
    assert_not build(article: articles(:rockets), selection_start: 2, selection_length: 5).valid?
  end

  test "requires article and user" do
    assert_not build(article: nil).valid?
    assert_not build(user: nil).valid?
  end

  test "body is required, stripped, and at most 2000 codepoints" do
    assert_not build(body: nil).valid?
    assert_not build(body: "  ").valid?
    assert_equal "padded", build(body: " padded ").body
    assert build(body: "a" * 2000).valid?
    assert_not build(body: "a" * 2001).valid?
  end

  test "database rejects negative start and non-positive length" do
    assert_raises(ActiveRecord::StatementInvalid) { build(selection_start: -1).save!(validate: false) }
    assert_raises(ActiveRecord::StatementInvalid) { build(selection_length: 0).save!(validate: false) }
  end

  test "create_serialized! inserts under a row lock on the article" do
    queries = []
    callback = ->(*, payload) { queries << payload[:sql] }
    annotation = ActiveSupport::Notifications.subscribed(callback, "sql.active_record") do
      Annotation.create_serialized!(article: articles(:plain), user: users(:ada), selection_start: 0, selection_length: 5, body: "Locked")
    end

    assert annotation.persisted?
    lock_at = queries.index { |sql| sql.include?("FOR UPDATE") && sql.include?('"articles"') }
    insert_at = queries.index { |sql| sql.start_with?('INSERT INTO "annotations"') }
    assert lock_at, "expected SELECT ... FOR UPDATE on the article"
    assert_operator lock_at, :<, insert_at
  end

  test "create_serialized! rejects an overlap with RecordInvalid" do
    article = articles(:rockets)
    error = assert_raises(ActiveRecord::RecordInvalid) do
      Annotation.create_serialized!(article: article, user: users(:ada), selection_start: 5, selection_length: 4, body: "Overlap")
    end
    assert_equal [ "overlaps an existing annotation" ], error.record.errors[:selection_start]
    assert_equal 2, article.annotations.count
  end

  test "deleting a user deletes their annotations and those annotations' improvements" do
    assert_difference -> { Annotation.count } => -1, -> { Improvement.count } => -2 do
      users(:ada).annotations.destroy_all
    end
  end
end
