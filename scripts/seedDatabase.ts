// spell-checker:disable
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */

import { Role } from 'src/constants/common';
import { ProviderId, auth } from 'src/utils/lucia';

import cuid2 from '@paralleldrive/cuid2';

const seedDatabase = async () => {
  // Create default user
  const email = 'emnnipal@gmail.com'.toLowerCase();
  await auth.createUser({
    key: {
      password: 'P@ssw0rd!23',
      providerId: ProviderId.email,
      providerUserId: email,
    },
    attributes: {
      email,
      name: 'Emman',
      role: Role.Admin,
    },
    userId: cuid2.createId(),
  });
};

seedDatabase()
  .then(() => {
    console.log('Success seeding database');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to seed database', err);
    process.exit(1);
  });
