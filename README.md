# ELI5ience

- [Website Link][website]
- [Heroku link][heroku]

[heroku]: eli5ience.herokuapp.com
[website]: http://www.eli5ience.com/

## Minimum Viable Product

ELI5ience is a web application inspired by Rap Genius built using Ruby on Rails
and React.js. ELI5ience allows users to:

<!-- This is a Markdown checklist. Use it to keep track of your
progress. Put an x between the brackets for a checkmark: [x] -->

- [ ] Create an account
- [ ] Log in / Log out
- [ ] Create, read, edit, and delete articles
- [ ] Create, read, edit, and delete comments on articles
- [ ] Create, read, edit, and delete annotations on articles
- [ ] Create, read, edit, and delete improvements on annotations
- [ ] Vote on annotations


## Design Docs
* [View Wireframes][views]
* [React Components][components]
* [Flux Stores][stores]
* [API endpoints][api-endpoints]
* [DB schema][schema]

[views]: ./docs/views.md
[components]: ./docs/components.md
[stores]: ./docs/stores.md
[api-endpoints]: ./docs/api-endpoints.md
[schema]: ./docs/schema.md

## Implementation Timeline

### Phase 1: Backend setup and User Authentication (0.5 days)
[details][phase1]
**Objective:** Functioning rails project with Authentication

- [ ] create new project
- [ ] create `User` model
- [ ] authentication
- [ ] user signup/signin pages
- [ ] user profile page
- [ ] blank landing page after signin

### Phase 2: Articles Model, API, and basic APIUtil (1 day)

**Objective:** Articles can be created, read, edited and destroyed through
the API.

- [ ] create `Article` model
- [ ] seed the database with a small amount of test data
- [ ] CRUD API for articles (`ArticlesController`)
- [ ] jBuilder views for articles
- [ ] setup Webpack & Flux scaffold
- [ ] setup `APIUtil` to interact with the API
- [ ] test out API interaction in the console.

### Phase 3: Article CRUD (1 day)

**Objective:** Articles can be created, read, edited and destroyed with the
user interface.

- [ ] article creation page
- [ ] main page w/ list of articles
- [ ] article page

### Phase 4: Comments (0.5 day)

**Objective:** Comments belong to articles and can be viewed on articles.

- [ ] create `Comment` model
- build out API, Flux loop, and components for:
  - [ ] Comment CRUD
  - [ ] viewing comments on articles

### Phase 5: Start Styling (0.5 day)

**Objective:** Existing pages (sign up, sign in, profile, articles, and main page) will look good.

- [ ] create a basic style guide
- [ ] position elements on the page
- [ ] add basic colors & styles

### Phase 6: Annotations Flux Architecture and Router (2.5 days)

**Objective:** Annotations belong to Articles, and can be viewed on articles.

- [ ] setup the flux loop with skeleton files
- [ ] setup React Router
- [ ] create `Annotation` model
- build out API, Flux loop, and components for:
  - [ ] Annotation CRUD
      - [ ] selecting text opens annotation form
  - [ ] viewing annotation on articles
  - [ ] modify article body to include links to Annotations
- [ ] Use CSS to style new views

### Phase 7: Improvements (0.5 day)

**Objective:** Improvements belong to annotations and can be viewed on annotations.

- [ ] create `Improvement` model
- build out API, Flux loop, and components for:
  - [ ] Improvement CRUD
  - [ ] viewing improvements on annotations

### Phase 8: Allow Complex Articles and Annotations (0.5 days)

**objective:** Enable complex styling of articles and annotations.

- [ ] Integrate `markdown-js`

### Phase 9: Styling Cleanup and Seeding (1 day)

**objective:** Make the site feel more cohesive and awesome.

- [ ] Add Bootstrap elements.
- [ ] Get feedback on my UI from others
- [ ] Refactor HTML classes & CSS rules
- [ ] Add modals, transitions, and other styling flourishes.

### Bonus Features (TBD)
- [ ] Search for articles by tags or name
- [ ] Pagination / infinite scroll for Articles Index
- [ ] File upload for annotations

[phase-one]: ./docs/phases/phase1.md
[phase-two]: ./docs/phases/phase2.md
[phase-three]: ./docs/phases/phase3.md
[phase-four]: ./docs/phases/phase4.md
[phase-five]: ./docs/phases/phase5.md
