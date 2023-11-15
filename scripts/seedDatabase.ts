// spell-checker:disable
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-console */

import { serverEnv } from 'src/env/server';
import { users } from 'src/schema';
import { db } from 'src/utils/db';

import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  // Create default user
  const password = 'P@ssw0rd!23';
  const saltedPassword = await bcrypt.hash(password, serverEnv.SALT_ROUNDS);
  await db.insert(users).values({
    email: 'emnnipal@gmail.com',
    name: 'Emman',
    password: saltedPassword,
    role: 'admin',
  });

  console.log('Success seeding database');
  process.exit(0);
};

seedDatabase().catch((err) => {
  console.error('Failed to seed database', err);
  process.exit(1);
});
