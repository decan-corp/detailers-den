// spell-checker:disable
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */

import { ProviderId, auth } from 'src/utils/lucia';

import cuid2 from '@paralleldrive/cuid2';

const seedDatabase = async () => {
  // Create default user
  const password = 'P@ssw0rd!23'; // user change the password afterwards
  const email = 'emnnipal@gmail.com';
  await auth.createUser({
    key: {
      password,
      providerId: ProviderId.email,
      providerUserId: email.toLowerCase(),
    },
    attributes: {
      email,
      name: 'Emman',
      role: 'admin',
    },
    userId: cuid2.createId(),
  });

  console.log('Success seeding database');
  process.exit(0);
};

seedDatabase().catch((err) => {
  console.error('Failed to seed database', err);
  process.exit(1);
});
