require "test_helper"

class SeedsTest < ActiveSupport::TestCase
  test "db:seed is idempotent and creates the four legacy users" do
    User.destroy_all
    2.times { load Rails.root.join("db/seeds.rb") }

    assert_equal %w[CSPro EngineerGuy TheRocketeer guest_user].sort, User.pluck(:username).sort
    assert User.guest.authenticate("guestguest")
    assert_not User.find_by!(username: "EngineerGuy").authenticate("engiguy"), "persona accounts must not keep their public legacy passwords"
  end
end
