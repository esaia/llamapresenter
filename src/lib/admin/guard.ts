import type { User } from '@supabase/supabase-js';

import { admin } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/server';

/**
 * The signed-in operator, if and only if `profiles.is_admin` says so — read
 * through the service-role client, never through the caller's own session,
 * so nothing about the answer can be forged from the browser.
 *
 * Returns null for "not an admin" (including "not signed in"), leaving the
 * page or route to decide what that means — a redirect for the former, a 403
 * for the latter.
 */
export const getAdminUser = async (): Promise<User | null> => {
  const user = await getUser();

  if (!user) return null;

  const { data } = await admin().from('profiles').select('is_admin').eq('id', user.id).maybeSingle();

  return data?.is_admin ? user : null;
};
