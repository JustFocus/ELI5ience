require "test_helper"

class UserTest < ActiveSupport::TestCase
  def build(attrs = {})
    User.new({ username: "new_user", password: "password123" }.merge(attrs))
  end

  test "valid with username and password, expertise optional" do
    assert build.valid?
    assert build(expertise: "Chemist").valid?
  end

  test "username must be unique ignoring case" do
    user = build(username: "ADA")
    assert_not user.valid?
    assert_includes user.errors[:username], "has already been taken"
  end

  test "database enforces unique lower(username)" do
    assert_raises(ActiveRecord::RecordNotUnique) do
      User.new(username: "ADA", password: "password123").save!(validate: false)
    end
  end

  test "username format and length" do
    %w[abc a_b_c Under_Score_9 ABC123].push("a" * 30).each do |name|
      assert build(username: name).valid?, "#{name} should be valid"
    end
    [ "ab", "a" * 31, "has space", "dash-ed", "dot.ted", "ünïcode", "", nil ].each do |name|
      assert_not build(username: name).valid?, "#{name.inspect} should be invalid"
    end
  end

  test "username is stripped" do
    assert_equal "padded", build(username: "  padded ").username
  end

  test "password length" do
    assert_not build(password: "a" * (User::PASSWORD_MIN_LENGTH - 1)).valid?
    assert build(password: "a" * User::PASSWORD_MIN_LENGTH).valid?
  end

  test "password is required on create" do
    assert_not User.new(username: "new_user").valid?
  end

  test "existing user stays valid without resetting the password" do
    assert users(:ada).valid?
  end

  test "blank expertise is stored as nil" do
    assert_nil build(expertise: "  ").expertise
  end

  test "authenticate_by_credentials is case insensitive and checks the password" do
    assert_equal users(:ada), User.authenticate_by_credentials("ADA", "password123")
    assert_not User.authenticate_by_credentials("ada", "wrong")
    assert_not User.authenticate_by_credentials("nobody", "password123")
  end

  test "guest finds the seeded guest user" do
    assert_equal users(:guest), User.guest
  end
end
