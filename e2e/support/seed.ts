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
