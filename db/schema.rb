# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160302184744) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "annotations", force: :cascade do |t|
    t.integer  "author_id",        null: false
    t.integer  "article_id",       null: false
    t.integer  "selection_start",  null: false
    t.integer  "selection_length", null: false
    t.text     "body",             null: false
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
  end

  add_index "annotations", ["article_id"], name: "index_annotations_on_article_id", using: :btree
  add_index "annotations", ["author_id"], name: "index_annotations_on_author_id", using: :btree

  create_table "articles", force: :cascade do |t|
    t.string   "title",                           null: false
    t.text     "body"
    t.string   "image_link"
    t.string   "background_link"
    t.integer  "author_id",                       null: false
    t.boolean  "locked",          default: false
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
  end

  add_index "articles", ["author_id"], name: "index_articles_on_author_id", using: :btree

  create_table "comments", force: :cascade do |t|
    t.integer  "user_id",    null: false
    t.integer  "article_id", null: false
    t.text     "body",       null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "comments", ["article_id"], name: "index_comments_on_article_id", using: :btree
  add_index "comments", ["user_id"], name: "index_comments_on_user_id", using: :btree

  create_table "improvements", force: :cascade do |t|
    t.integer  "user_id",       null: false
    t.integer  "annotation_id", null: false
    t.text     "body",          null: false
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
  end

  add_index "improvements", ["annotation_id"], name: "index_improvements_on_annotation_id", using: :btree
  add_index "improvements", ["user_id"], name: "index_improvements_on_user_id", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "username",        null: false
    t.string   "expertise"
    t.string   "session_token",   null: false
    t.string   "password_digest", null: false
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

end
