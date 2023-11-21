import { auth } from 'src/utils/lucia';

import * as context from 'next/headers';
import { cache } from 'react';

export const getPageSession = cache(() => {
  const authRequest = auth.handleRequest('GET', context);
  return authRequest.validate();
});
