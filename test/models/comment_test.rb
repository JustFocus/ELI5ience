require "test_helper"

class CommentTest < ActiveSupport::TestCase
  def build(attrs = {})
    Comment.new({ article: articles(:plain), user: users(:ada), body: "Nice" }.merge(attrs))
  end

  test "valid with article, user and body" do
    assert build.valid?
  end

  test "requires article and user" do
    assert_not build(article: nil).valid?
    assert_not build(user: nil).valid?
  end

  test "body is required, stripped, and at most 2000 codepoints" do
    assert_not build(body: nil).valid?
    assert_not build(body: "  ").valid?
    assert_equal "padded", build(body: " padded\n").body
    assert build(body: "a" * 2000).valid?
    assert_not build(body: "a" * 2001).valid?
    assert build(body: "😀" * 2000).valid?
  end

  test "belongs to article and user" do
    assert_equal articles(:rockets), comments(:first).article
    assert_equal users(:ada), comments(:first).user
  end

  test "deleting a user deletes their comments" do
    user = users(:no_expertise)
    2.times { |i| Comment.create!(article: articles(:plain), user: user, body: "c#{i}") }
    assert_difference -> { Comment.count }, -2 do
      user.destroy!
    end
  end
end
