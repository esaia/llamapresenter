import { NextResponse, type NextRequest } from 'next/server';

import { getAdminUser } from '@/lib/admin/guard';
import { admin } from '@/lib/supabase/admin';

/**
 * A direct plan write for one operator, made by an admin rather than Dodo.
 *
 * For comps and for fixing a subscription a webhook never landed on. It
 * leaves `provider_customer_id` alone, so a user set to Pro here who later
 * runs a real checkout is still found and owned by the webhook the same as
 * anyone else's row.
 */
export const POST = async (request: NextRequest) => {
  const adminUser = await getAdminUser();

  if (!adminUser) return NextResponse.json({ error: 'not authorised' }, { status: 403 });

  const body = (await request.json().catch(() => null)) as { userId?: string; plan?: string } | null;
  const userId = body?.userId;
  const plan = body?.plan;

  if (!userId || (plan !== 'free' && plan !== 'pro')) {
    return NextResponse.json({ error: 'userId and plan (free|pro) are required' }, { status: 400 });
  }

  // Every operator gets a subscriptions row at signup (handle_new_user), so
  // this is always an update, never an insert.
  const db = admin();
  const { error } = await db.from('subscriptions').update({ plan, status: 'active' }).eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
};
