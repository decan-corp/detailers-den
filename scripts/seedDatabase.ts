// spell-checker:disable
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */

import { Role } from 'src/constants/common';
import { usersTable } from 'src/schema';
import { db } from 'src/utils/db';

import cuid2 from '@paralleldrive/cuid2';
import { Argon2id } from 'oslo/password';

const seedDatabase = async () => {
  // Create default user
  const email = 'emnnipal@gmail.com'.toLowerCase();
  const name = 'Emman';

  const id = cuid2.createId();
  const hashedPassword = await new Argon2id().hash('P@ssw0rd!23');

  await db.insert(usersTable).values({
    id,
    createdById: id,
    role: Role.Admin,
    email,
    name,
    hashedPassword,
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
