# Schema Information

## articles
column name      | data type | details
-----------------|-----------|-----------------------
id               | integer   | not null, primary key
title            | string    | not null
body             | text      | not null
image_link       | string      | not null
background_link  | string      | nut null
author_id        | integer   | not null, foreign key (references users), indexed
locked           | boolean   | not null, default: false

## annotations
column name      | data type | details
-----------------|-----------|-----------------------
id               | integer   | not null, primary key
author_id        | integer   | not null, foreign key (references users), indexed
article_id       | integer   | not null, foreign key (references articles), indexed
selection_start  | integer   | not null
selection_length | integer   | not null
body             | text      | not null

## votes
column name      | data type | details
-----------------|-----------|-----------------------
id               | integer   | not null, primary key
vote             | boolean   | not null
user_id          | integer   | not null, foreign key (references users), indexed

## comments
column name      | data type | details
-----------------|-----------|-----------------------
id               | integer   | not null, primary key
user_id          | integer   | not null, foreign key (references users), indexed
article_id       | integer   | not null, foreign key (references articles), indexed
body             | text      | not null

## improvements
column name      | data type | details
-----------------|-----------|-----------------------
id               | integer   | not null, primary key
user_id          | integer   | not null, foreign key (references users), indexed
annotation_id    | integer   | not null, foreign key (references annotations), indexed
body             | text      | not null

## tags
column name | data type | details
------------|-----------|-----------------------
id          | integer   | not null, primary key
name        | string    | not null

## taggings
column name    | data type | details
---------------|-----------|-----------------------
id             | integer   | not null, primary key
article_id     | integer   | not null, foreign key (references articles), indexed, unique [tag_id]
tag_id         | integer   | not null, foreign key (references tags), indexed

## users
column name     | data type | details
----------------|-----------|-----------------------
id              | integer   | not null, primary key
username        | string    | not null, indexed, unique
expertise       | string    | not null, indexed, unique
password_digest | string    | not null
session_token   | string    | not null, indexed, unique
