'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Cadence } from '@/lib/billing/founding';

/**
 * Monthly or yearly, held once for a whole page.
 *
 * The switch and the things it prices are not neighbours: on /pricing the
 * founding ladder is in the hero and the cards are most of a screen below it,
 * and on the home page they are two columns of the same band. All three have
 * to say the same thing the moment one of them is pressed, so the choice lives
 * above them rather than inside the cards.
 *
 * A context rather than props threaded through the page because the page is a
 * server component: its sections stay server-rendered and arrive here as
 * `children`, and only the three pieces that actually read the choice are
 * client components.
 *
 * The default is monthly and its setter does nothing, so a surface with no
 * provider — the console's account panel draws the same ladder — gets the
 * monthly prices rather than a crash.
 */
type CadenceState = readonly [Cadence, (cadence: Cadence) => void];

const CadenceContext = createContext<CadenceState>(['monthly', () => {}]);

export const useCadence = () => useContext(CadenceContext);

export const CadenceProvider = ({ children }: { children: ReactNode }) => {
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const value = useMemo(() => [cadence, setCadence] as const, [cadence]);

  return <CadenceContext.Provider value={value}>{children}</CadenceContext.Provider>;
};
