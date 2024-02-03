/* eslint-disable react/jsx-no-useless-fragment */

'use client';

import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';

/**
 * We use 'use client' here since we need to load the dayjs plugins on the client side.
 * You can add any other instantiations here that are required on the client and won't
 * work if rendered from the server.
 */
dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
  weekStart: 1,
});

const RootLayout = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export default RootLayout;
