// Constants mirroring db/seeds.rb. Specs assert against these, so if the
// seeds change, update this file in the same commit.

export interface SeedUser {
  username: string;
  password: string;
  expertise: string;
}

export const GUEST_USER: SeedUser = {
  username: 'guest_user',
  password: 'guestguest',
  expertise: 'Jet Propulsion',
};

// All four seeded users in insertion order (guest first). Index 0 is the guest.
export const SEED_USERS: readonly SeedUser[] = [
  GUEST_USER,
  {
    username: 'EngineerGuy',
    password: 'engiguy',
    expertise: 'Electrical Engineering',
  },
  {
    username: 'CSPro',
    password: 'computerscience',
    expertise: 'Computer Science',
  },
  {
    username: 'TheRocketeer',
    password: 'getmeahelmet',
    expertise: 'Rocket Science',
  },
];

// The six seeded article titles in insertion order. Article ids are 1-based,
// so SEED_ARTICLE_TITLES[0] is article 1 ("Rocket Engines").
export const SEED_ARTICLE_TITLES: readonly string[] = [
  'Rocket Engines',
  'Specific Impulse',
  'Electrical Engineering',
  'Electromagnetism',
  'JavaScript',
  'Just-in-time compilation',
];

// Database ids of the seeded users. Users are created in insertion order on a
// freshly seeded database, so ids are 1-based in the order of SEED_USERS.
export const SEED_USER_IDS: Readonly<Record<string, number>> = {
  guest_user: 1,
  EngineerGuy: 2,
  CSPro: 3,
  TheRocketeer: 4,
};

// Seeded article titles grouped by author username, from the author_id of each
// Article.create! in db/seeds.rb. TheRocketeer authors no seeded articles.
export const SEED_ARTICLE_TITLES_BY_AUTHOR: Readonly<Record<string, readonly string[]>> = {
  guest_user: ['Rocket Engines', 'Specific Impulse'],
  EngineerGuy: ['Electrical Engineering', 'Electromagnetism'],
  CSPro: ['JavaScript', 'Just-in-time compilation'],
  TheRocketeer: [],
};
