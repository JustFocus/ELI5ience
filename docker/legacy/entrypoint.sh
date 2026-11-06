#!/bin/sh
set -e
rm -f tmp/pids/server.pid
mkdir -p tmp/pids
# Idempotent: schema:load recreates tables (force: :cascade), seed starts from an empty DB.
bundle exec rake db:create db:schema:load
bundle exec rake db:seed
exec bundle exec rails server -b 0.0.0.0 -p 3000
