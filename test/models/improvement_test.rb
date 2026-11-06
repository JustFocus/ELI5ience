require "test_helper"

class ImprovementTest < ActiveSupport::TestCase
  def build(attrs = {})
    Improvement.new({ annotation: annotations(:engine), user: users(:ada), body: "Better" }.merge(attrs))
  end

  test "valid with annotation, user and body" do
    assert build.valid?
  end

  test "requires annotation and user" do
    assert_not build(annotation: nil).valid?
    assert_not build(user: nil).valid?
  end

  test "body is required, stripped, and at most 2000 codepoints" do
    assert_not build(body: nil).valid?
    assert_not build(body: "  ").valid?
    assert_equal "padded", build(body: " padded ").body
    assert build(body: "a" * 2000).valid?
    assert_not build(body: "a" * 2001).valid?
  end

  test "annotation lists improvements oldest first" do
    assert_equal [ improvements(:older), improvements(:simpler) ], annotations(:engine).improvements.to_a
  end

  test "deleting an annotation deletes its improvements" do
    assert_difference -> { Improvement.count }, -2 do
      annotations(:engine).destroy!
    end
  end

  test "deleting a user deletes their improvements" do
    user = users(:no_expertise)
    Improvement.create!(annotation: annotations(:engine), user: user, body: "mine")
    assert_difference -> { Improvement.count }, -1 do
      user.destroy!
    end
  end
end
