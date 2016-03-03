class CreateImprovements < ActiveRecord::Migration
  def change
    create_table :improvements do |t|
      t.integer :user_id, null: false
      t.integer :annotation_id, null: false
      t.text :body, null: false

      t.timestamps null: false
    end
    add_index :improvements, :user_id
    add_index :improvements, :annotation_id
  end
end
