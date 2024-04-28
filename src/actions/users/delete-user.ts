'use server';

import { Role } from 'src/constants/common';
import { usersTable } from 'src/schema';
import { db } from 'src/utils/db';
import { auth } from 'src/utils/lucia';
import { SafeActionError, authAction } from 'src/utils/safe-action';

import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const softDeleteUser = authAction(z.string().cuid2(), async (id, ctx) => {
  const { userId } = ctx.session;
  const { role } = ctx.user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(usersTable)
    .set({
      deletedBy: userId,
      deletedAt: dayjs().toDate(),
    })
    .where(eq(usersTable.id, id));

  await auth.invalidateUserSessions(id);
});

export const recoverUser = authAction(z.string().cuid2(), async (id, { user }) => {
  const { role } = user;

  if (role !== Role.Admin) {
    throw new SafeActionError('Forbidden access');
  }

  await db
    .update(usersTable)
    .set({
      deletedBy: null,
      deletedAt: null,
    })
    .where(eq(usersTable.id, id));
});
