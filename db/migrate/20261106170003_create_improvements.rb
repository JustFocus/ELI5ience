class CreateImprovements < ActiveRecord::Migration[8.1]
  def change
    create_table :improvements do |t|
      t.references :annotation, null: false, foreign_key: { on_delete: :cascade }
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.text :body, null: false

      t.timestamps
    end
  end
end
