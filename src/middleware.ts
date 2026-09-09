import type { NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

export const middleware = (request: NextRequest) => updateSession(request);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts|images|videos|.*\\.(?:svg|png|jpe?g|webp|woff2?|ttf|mp4|webm)$).*)'],
};
