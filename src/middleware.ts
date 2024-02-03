import { verifyRequestOrigin } from 'lucia';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.method === 'GET') {
    return NextResponse.next();
  }

  // For CSRF protection
  const originHeader = request.headers.get('Origin');
  const hostHeader = request.headers.get('X-Forwarded-Host');
  if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
    return new NextResponse(null, {
      status: 403,
    });
  }

  return NextResponse.next();
}
