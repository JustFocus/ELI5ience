class AddCommentsCountToArticles < ActiveRecord::Migration[8.1]
  def up
    add_column :articles, :comments_count, :integer, null: false, default: 0
    execute <<~SQL
      UPDATE articles
      SET comments_count = (SELECT COUNT(*) FROM comments WHERE comments.article_id = articles.id)
    SQL
  end

  def down
    remove_column :articles, :comments_count
  end
end
