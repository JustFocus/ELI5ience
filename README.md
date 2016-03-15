# ELI5ience

- [Website Link][website]
- [Heroku link][heroku]

A science focused app for annotating difficult to understand articles. Based on RapGenius.

ELI5ience was built with a Ruby on Rails backend, and a React.js frontend.

[heroku]: eli5ience.herokuapp.com
[website]: http://www.eli5ience.com/

##Main Features
- Annotate articles by selecting text on the article page
  - Protections to prevent users from annotating over existing annotations.
- Article pages show all existing annotations as links that open in-page
- Post and delete comments on articles
- Post and delete improvements on annotations
- User view changes based on login status, will show delete/create buttons only when logged in
- Create and delete articles
- Sign Up/Login account management with user profiles

![image:](https://github.com/JustFocus/ELI5ience/docs/ELI5Annotation.png)

##Additional Features
- Custom authentication in rails
- Session management on backend with frontend reference for tailored UX
- Twitter bootstrap used for styling.


#Original Design Docs

## Minimum Viable Product

- [x] Create an account
- [x] Log in / Log out
- [x] Create, read, and delete articles
- [x] Create, read, and delete comments on articles
- [x] Create, read, and delete annotations on articles
- [x] Create, read, edit, and delete improvements on annotations
- [x] Vote on annotations


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

### Phase 1: [Backend setup and User Authentication (1 day)][phase-one]

**Objective:** Functioning rails project with Authentication

- [x] create new project
- [x] create `User` model
- [x] authentication
- [x] user signup/signin pages
- [x] user profile page
- [x] blank landing page after signin

### Phase 2: [Articles Model, API, and basic APIUtil (1 day)][phase-two]

**Objective:** Articles can be created, read, edited and destroyed through
the API.

- [x] create `Article` model
- [x] seed the database with a small amount of test data
- [x] CRUD API for articles (`ArticlesController`)
- [x] jBuilder views for articles
- [x] setup Webpack & Flux scaffold
- [x] setup `APIUtil` to interact with the API
- [x] test out API interaction in the console.

### Phase 3: [Article CRUD (2 days)][phase-three]

**Objective:** Articles can be created, read, edited and destroyed with the user interface.

- [x] article creation page
- [x] main page w/ list of articles
- [x] article page

### Phase 4: [Comments (0.5 day)][phase-four]

**Objective:** Comments belong to articles and can be viewed on articles.

- [x] create `Comment` model
- build out API, Flux loop, and components for:
  - [x] Comment CRUD
  - [x] viewing comments on articles

### Phase 5: [Start Styling (1 day)][phase-five]

**Objective:** Existing pages (sign up, sign in, profile, articles, and main page) will look good.

- [x] create a basic style guide
- [x] position elements on the page
- [x] add basic colors & styles

### Phase 6: [Annotations Flux Architecture and Router (2 days)][phase-six]

**Objective:** Annotations belong to Articles, and can be viewed on articles.

- [x] setup the flux loop with skeleton files
- [x] setup React Router
- [x] create `Annotation` model
- build out API, Flux loop, and components for:
  - [x] Annotation CRUD
      - [x] selecting text opens annotation form
  - [x] viewing annotation on articles
  - [x] modify article body to include links to Annotations
- [x] Use CSS to style new views

### Phase 7: [Improvements (1 day)][phase-seven]

**Objective:** Improvements belong to annotations and can be viewed on annotations.

- [x] create `Improvement` model
- build out API, Flux loop, and components for:
  - [x] Improvement CRUD
  - [x] viewing improvements on annotations

### Phase 8: [Styling Cleanup and Seeding (1 day)][phase-nine]

**objective:** Make the site feel more cohesive and awesome.

- [x] Get feedback on my UI from others
- [x] Refactor HTML classes & CSS rules
- [x] Add modals, transitions, and other styling flourishes.

### Bonus Features (TBD)
- [ ] Complex styling of articles and annotations using markdown-js
- [ ] Improvement voting and metrics
- [ ] Search for articles by tags or name
- [ ] Pagination / infinite scroll for Articles Index
- [ ] File upload for annotations and articles

[phase-one]: ./docs/phases/phase1.md
[phase-two]: ./docs/phases/phase2.md
[phase-three]: ./docs/phases/phase3.md
[phase-four]: ./docs/phases/phase4.md
[phase-five]: ./docs/phases/phase5.md
[phase-six]: ./docs/phases/phase6.md
[phase-seven]: ./docs/phases/phase7.md
[phase-eight]: ./docs/phases/phase8.md
[phase-nine]: ./docs/phases/phase9.md
