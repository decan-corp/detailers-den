'use server';

import { AdminRoute } from 'src/constants/routes';
import { resetPasswordTokensTable, usersTable } from 'src/schema';
import { db } from 'src/utils/db';
import { SafeActionError, action } from 'src/utils/safe-action';
import { makeVerifiedSender, sendgrid } from 'src/utils/sendgrid';

import dayjs from 'dayjs';
import { and, eq, gt } from 'drizzle-orm';
import { headers } from 'next/headers';
import { z } from 'zod';

export const forgotPassword = action(
  z.object({
    email: z.string().email(),
  }),
  async ({ email }) => {
    const [user] = await db
      .select({ id: usersTable.id, name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user) {
      throw new SafeActionError('Email not registered.');
    }

    const [existingResetPasswordToken] = await db
      .select()
      .from(resetPasswordTokensTable)
      .where(
        and(
          eq(resetPasswordTokensTable.userId, user.id),
          gt(resetPasswordTokensTable.expiresAt, new Date()),
          eq(resetPasswordTokensTable.isValid, true)
        )
      );

    let resetPasswordTokenId = existingResetPasswordToken?.id;

    if (!resetPasswordTokenId) {
      const records = await db
        .insert(resetPasswordTokensTable)
        .values({
          userId: user.id,
          expiresAt: dayjs().add(2, 'hour').toDate(),
          createdBy: user.id,
        })
        .returning({ resetPasswordTokenId: resetPasswordTokensTable.id });

      resetPasswordTokenId = records[0].resetPasswordTokenId;
    }

    const headersList = headers();
    const appUrl = headersList.get('origin');
    const resetPasswordLink = `${appUrl}${AdminRoute.ResetPassword}/${resetPasswordTokenId}`;

    await sendgrid.send({
      from: makeVerifiedSender('no-reply'),
      to: email,
      subject: 'Reset Your 185 Detailers Den Password',
      html: `
        <body style="font-family: Arial, sans-serif;">
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your password. To proceed, please click the link below:</p>
        <p><a href="${resetPasswordLink}" style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Reset Your Password</a></p>

        <br />
        <p>This link will expire in 2 hours, so be sure to use it promptly.</p>
        <p>For security reasons, please do not share this link with anyone. It is unique to you and will allow others to reset your password.</p>
        <p>If you didn't request this password reset, you can safely ignore this email. Your account remains secure.</p>

        <br />
        <p>Thank you,</p>
        <p>185 Detailers-Den</p>
        
        </body>
    `,
    });
  }
);
