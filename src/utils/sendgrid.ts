import 'server-only';
import { serverEnv } from 'src/env/server';

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(serverEnv.SENDGRID_API_KEY);

export const sendgrid = sgMail;

export const makeVerifiedSender = (name: string) => `${name}@185dd.pro`;
