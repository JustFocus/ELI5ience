# Legacy ELI5ience (Rails 4.2.3) runtime. Build context is the repo root.
FROM ruby:2.3

# ruby:2.3 is buildpack-deps based (gcc, libpq-dev, libxml2-dev already present), and its
# Debian stretch apt repos are EOL with expired signing keys, so avoid apt entirely.
# execjs needs a JS runtime: take node from the official stretch-based image.
COPY --from=node:8-stretch /usr/local/bin/node /usr/local/bin/node

RUN gem install bundler -v 1.11.2 --no-document

WORKDIR /app
COPY Gemfile Gemfile.lock ./
# bootstrap-sass 3.2.0.2 was yanked from rubygems.org; use the nearest patch release (3.2.0.4)
# by editing the lockfile copy inside the image only (repo Gemfile.lock stays untouched).
RUN sed -i 's/bootstrap-sass (3.2.0.2)/bootstrap-sass (3.2.0.4)/' Gemfile.lock \
 && bundle _1.11.2_ install --jobs 4 --without production

COPY . /app
RUN sed -i 's/bootstrap-sass (3.2.0.2)/bootstrap-sass (3.2.0.4)/' Gemfile.lock
COPY docker/legacy/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV RAILS_ENV=development
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
