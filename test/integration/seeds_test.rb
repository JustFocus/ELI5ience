require "test_helper"

class SeedsTest < ActiveSupport::TestCase
  def seed
    load Rails.root.join("db/seeds.rb")
  end

  test "db:seed is idempotent and creates the legacy content" do
    User.destroy_all
    2.times { seed }

    assert_equal %w[CSPro EngineerGuy TheRocketeer guest_user].sort, User.pluck(:username).sort
    assert User.guest.authenticate("guestguest")
    assert_not User.find_by!(username: "EngineerGuy").authenticate("engiguy"), "persona accounts must not keep their public legacy passwords"

    assert_equal 6, Article.count
    assert_equal 23, Annotation.count
    assert_equal 22, Improvement.count
    assert_equal 14, Comment.count
  end

  test "re-seeding changes no records" do
    User.destroy_all
    seed
    snapshot = [ User, Article, Annotation, Improvement, Comment ].to_h { |m| [ m, m.order(:id).pluck(:id, :updated_at) ] }
    seed
    assert_equal snapshot, snapshot.to_h { |m, _| [ m, m.order(:id).pluck(:id, :updated_at) ] }
  end

  test "every seeded record is valid and linked by association" do
    User.destroy_all
    seed

    assert_equal 6, Article.joins(:user).count
    [ Article, Annotation, Improvement, Comment ].each do |model|
      model.find_each { |record| assert record.valid?, "#{model} #{record.id}: #{record.errors.full_messages.to_sentence}" }
    end
    assert_equal 4, Article.find_by!(title: "Rocket Engines").annotations.count
    assert_equal "Oberth effect", utf16_slice(Article.find_by!(title: "Rocket Engines"), 994, 13)
    assert_equal "IEEE", utf16_slice(Article.find_by!(title: "Electrical Engineering"), 1303, 4)
  end

  private

  def utf16_slice(article, start, length)
    article.body.encode("UTF-16LE").byteslice(start * 2, length * 2).force_encoding("UTF-16LE").encode("UTF-8")
  end
end
