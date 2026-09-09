import { effectivePlan } from '@/lib/billing/entitlements';
import { admin } from '@/lib/supabase/admin';

/**
 * Whether the screens of this session carry our mark.
 *
 * Resolved on the server, from the session's owner, and handed to the output
 * as a prop it is rendered with. Deliberately not carried in the slide payload
 * the way the style is: the payload is built in the operator's own browser, and
 * a mark the operator publishes is a mark the operator can decline to publish.
 * The plan is the one thing on an output page that is not theirs to say.
 *
 * It is settled once, when the page is served, and never moves for the life of
 * that page. An upgrade in the middle of a service is a reload away, which is
 * a better trade than every output re-asking who is paying on every slide.
 *
 * It follows the same switch every other ceiling does, so an install with the
 * gates off — which is what shipped while the tiers were being settled, and
 * what a self-hosted copy wants — has no mark on anything.
 */
export const watermarkFor = async (userId: string | null | undefined): Promise<boolean> => {
  if (!userId) return false;

  const { data } = await admin()
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .maybeSingle();

  return effectivePlan(data?.plan) === 'free';
};
