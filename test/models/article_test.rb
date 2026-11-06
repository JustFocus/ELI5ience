require "test_helper"

class ArticleTest < ActiveSupport::TestCase
  def build(attrs = {})
    Article.new({ user: users(:ada), title: "A title", body: "A body" }.merge(attrs))
  end

  test "valid with title and body, image_link optional" do
    assert build.valid?
    assert build(image_link: "https://example.com/a.png").valid?
  end

  test "requires a user" do
    assert_not build(user: nil).valid?
  end

  test "title is required, stripped, and at most 200 codepoints" do
    assert_not build(title: nil).valid?
    assert_not build(title: "   ").valid?
    assert_equal "padded", build(title: "  padded ").title
    assert build(title: "a" * 200).valid?
    assert_not build(title: "a" * 201).valid?
    assert build(title: "😀" * 200).valid?, "length counts codepoints, not UTF-16 units"
  end

  test "body is required, stripped, and at most 50000 codepoints" do
    assert_not build(body: nil).valid?
    assert_not build(body: " \n ").valid?
    assert_equal "padded", build(body: "\n padded \n").body
    assert build(body: "a" * 50_000).valid?
    assert_not build(body: "a" * 50_001).valid?
  end

  test "body line endings are normalized to LF" do
    assert_equal "a\nb\nc\nd", build(body: "a\r\nb\rc\nd").body
  end

  test "blank image_link becomes nil" do
    assert_nil build(image_link: "").image_link
    assert_nil build(image_link: "  ").image_link
    assert build(image_link: "").valid?
  end

  test "image_link must be an http or https URL with a host" do
    [ "http://example.com/a.png", "https://example.com/a.png?x=1", "HTTPS://example.com/" ].each do |url|
      assert build(image_link: url).valid?, "#{url} should be valid"
    end
    [ "javascript:alert(1)", "data:text/html,hi", "ftp://example.com/a.png", "//example.com/a.png",
      "example.com/a.png", "http://", "https:///path", "http://exa mple.com", "not a url" ].each do |url|
      article = build(image_link: url)
      assert_not article.valid?, "#{url} should be invalid"
      assert article.errors.key?(:image_link)
    end
  end

  test "image_link is at most 2048 characters" do
    prefix = "https://example.com/"
    assert build(image_link: prefix + "a" * (2048 - prefix.length)).valid?
    assert_not build(image_link: prefix + "a" * (2049 - prefix.length)).valid?
  end

  test "body_utf16_length counts astral characters as two units" do
    assert_equal 4, build(body: "a😀b").body_utf16_length
    assert_equal 5, build(body: "héllo").body_utf16_length
  end

  test "annotations are ordered by selection_start, comments by created_at" do
    article = articles(:rockets)
    assert_equal %i[engine vacuum].map { |k| annotations(k) }, article.annotations.to_a
    assert_equal %i[first second].map { |k| comments(k) }, article.comments.to_a
  end

  test "destroying an article destroys its annotations, improvements and comments" do
    assert_difference -> { Annotation.count } => -2, -> { Improvement.count } => -2, -> { Comment.count } => -2 do
      articles(:rockets).destroy!
    end
    assert_equal [ comments(:on_plain) ], Comment.all.to_a
  end

  test "database cascades article deletion without callbacks" do
    assert_difference -> { Annotation.count } => -2, -> { Improvement.count } => -2, -> { Comment.count } => -2 do
      articles(:rockets).delete
    end
  end

  test "database requires title and body" do
    assert_raises(ActiveRecord::NotNullViolation) { build(title: nil).save!(validate: false) }
    assert_raises(ActiveRecord::NotNullViolation) { build(body: nil).save!(validate: false) }
  end

  test "excerpt returns short bodies unchanged with no ellipsis" do
    assert_equal "Short body", build(body: "Short body").excerpt
    assert_equal "a" * 200, build(body: "a" * 200).excerpt
  end

  test "excerpt truncates at 200 codepoints and appends an ellipsis" do
    assert_equal "#{"a" * 200}...", build(body: "a" * 201).excerpt
  end

  test "excerpt never splits a surrogate pair at the boundary" do
    body = "#{"a" * 199}😀tail"
    excerpt = build(body: body).excerpt
    assert_equal "#{"a" * 199}😀...", excerpt
    assert excerpt.valid_encoding?
    assert_equal "#{"a" * 199}😀", build(body: "#{"a" * 199}😀").excerpt
    assert_equal "#{"a" * 198}😀😀...", build(body: "#{"a" * 198}😀😀x").excerpt
  end

  test "excerpt collapses newlines, strips trailing whitespace, then appends the ellipsis" do
    assert_equal "one two three", build(body: "one\n\ntwo\nthree").excerpt
    assert_equal "#{"a" * 198}...", build(body: "#{"a" * 198}\n\nzzz").excerpt
    assert_equal "word...", build(body: "word#{" " * 196}zzzz").excerpt
  end

  test "counter cache tracks comments" do
    article = build.tap(&:save!)
    assert_difference -> { article.reload.comments_count }, 2 do
      2.times { Comment.create!(article: article, user: users(:ada), body: "hi") }
    end
    assert_difference -> { article.reload.comments_count }, -1 do
      article.comments.first.destroy!
    end
  end
end
