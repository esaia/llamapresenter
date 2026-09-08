import { limitOf, roomFor, roomForList, type LimitKey } from './limits';
import type { PlanId } from './plans';

/**
 * Whether the ceilings are live.
 *
 * Kept as a switch because the console and the database have to start biting on
 * the same morning: the SQL side reads `public.gates_enforced()`, which is set
 * from this same decision. Off, every operator is treated as Pro — which is
 * what shipped while the tiers were being settled, and what a self-hosted
 * install wants.
 */
export const gatesEnforced = process.env.NEXT_PUBLIC_ENFORCE_GATES === '1';

export const planOf = (plan: string | null | undefined): PlanId => (plan === 'pro' ? 'pro' : 'free');

/** The plan we treat someone as being on, which is Pro for everyone while gates are off. */
export const effectivePlan = (plan: string | null | undefined): PlanId =>
  gatesEnforced ? planOf(plan) : 'pro';

/** Whether `adding` more of something still fits. The console's half of the rule. */
export const allows = (plan: string | null | undefined, key: LimitKey, current: number, adding = 1): boolean =>
  roomFor(effectivePlan(plan), key, current, adding);

/** The ceiling in force, or `null` for none. */
export const ceiling = (plan: string | null | undefined, key: LimitKey): number | null =>
  limitOf(effectivePlan(plan), key);

/**
 * Whether a list may become `wants` long, given it was `had` long. The console's
 * half of the rule that lets someone already over a ceiling shrink back under it.
 */
export const allowsList = (
  plan: string | null | undefined,
  key: LimitKey,
  wants: number,
  had: number,
): boolean => roomForList(effectivePlan(plan), key, wants, had);
