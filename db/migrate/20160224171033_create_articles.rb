class CreateArticles < ActiveRecord::Migration
  def change
    create_table :articles do |t|

      t.string :title, null: false
      t.text :body
      t.string :image_link
      t.string :background_link
      t.integer :author_id, null: false
      t.boolean :locked, default: false

      t.timestamps null: false
    end
    add_index :articles, :author_id
  end
end
