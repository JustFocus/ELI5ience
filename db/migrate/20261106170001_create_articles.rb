class CreateArticles < ActiveRecord::Migration[8.1]
  def change
    create_table :articles do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.string :title, null: false
      t.text :body, null: false
      t.string :image_link

      t.timestamps
    end
  end
end
