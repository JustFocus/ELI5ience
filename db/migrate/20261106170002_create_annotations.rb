class CreateAnnotations < ActiveRecord::Migration[8.1]
  def change
    create_table :annotations do |t|
      t.references :article, null: false, foreign_key: { on_delete: :cascade }, index: false
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.integer :selection_start, null: false
      t.integer :selection_length, null: false
      t.text :body, null: false

      t.timestamps

      t.index [ :article_id, :selection_start ]
      t.check_constraint "selection_start >= 0", name: "annotations_selection_start_nonnegative"
      t.check_constraint "selection_length >= 1", name: "annotations_selection_length_positive"
    end
  end
end
