# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_11_06_180000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "annotations", force: :cascade do |t|
    t.bigint "article_id", null: false
    t.bigint "user_id", null: false
    t.integer "selection_start", null: false
    t.integer "selection_length", null: false
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["article_id", "selection_start"], name: "index_annotations_on_article_id_and_selection_start"
    t.index ["user_id"], name: "index_annotations_on_user_id"
    t.check_constraint "selection_length >= 1", name: "annotations_selection_length_positive"
    t.check_constraint "selection_start >= 0", name: "annotations_selection_start_nonnegative"
  end

  create_table "articles", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", null: false
    t.text "body", null: false
    t.string "image_link"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "comments_count", default: 0, null: false
    t.index ["user_id"], name: "index_articles_on_user_id"
  end

  create_table "comments", force: :cascade do |t|
    t.bigint "article_id", null: false
    t.bigint "user_id", null: false
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["article_id"], name: "index_comments_on_article_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "improvements", force: :cascade do |t|
    t.bigint "annotation_id", null: false
    t.bigint "user_id", null: false
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["annotation_id"], name: "index_improvements_on_annotation_id"
    t.index ["user_id"], name: "index_improvements_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "ip_address"
    t.string "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username", null: false
    t.string "expertise"
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "lower((username)::text)", name: "index_users_on_lower_username", unique: true
  end

  add_foreign_key "annotations", "articles", on_delete: :cascade
  add_foreign_key "annotations", "users", on_delete: :cascade
  add_foreign_key "articles", "users", on_delete: :cascade
  add_foreign_key "comments", "articles", on_delete: :cascade
  add_foreign_key "comments", "users", on_delete: :cascade
  add_foreign_key "improvements", "annotations", on_delete: :cascade
  add_foreign_key "improvements", "users", on_delete: :cascade
  add_foreign_key "sessions", "users"
end
