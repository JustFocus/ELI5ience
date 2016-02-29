class CreateAnnotations < ActiveRecord::Migration
  def change
    create_table :annotations do |t|
      t.integer :author_id, null: false
      t.integer :article_id, null: false
      t.integer :selection_start, null: false
      t.integer :selection_length, null: false
      t.text :body, null: false
      t.timestamps null: false
    end
    add_index :annotations, :author_id
    add_index :annotations, :article_id
  end
end
