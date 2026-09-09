import { describe, expect, it } from 'vitest';

import {
  FOUNDING_SPOTS,
  FOUNDING_TIERS,
  marks,
  soldOut,
  spotsInTier,
  spotsLeftInTier,
  tierForSeat,
  tierNow,
} from './founding';

/**
 * The rungs are where the money is. Seat 10 pays $9 and seat 11 pays $14, and
 * a fence-post error either gives a church a price we did not offer or takes
 * one back that we did.
 */
describe('the ladder', () => {
  it('holds fifteen spots below the standard price', () => {
    expect(FOUNDING_SPOTS).toBe(15);
  });

  it('ends on a rung that never fills', () => {
    expect(FOUNDING_TIERS[FOUNDING_TIERS.length - 1].lastSeat).toBeNull();
  });

  it('prices a seat by which rung it lands on', () => {
    expect(tierForSeat(1).price).toBe('$9');
    expect(tierForSeat(10).price).toBe('$9');
    expect(tierForSeat(11).price).toBe('$14');
    expect(tierForSeat(15).price).toBe('$14');
    expect(tierForSeat(16).price).toBe('$19');
    expect(tierForSeat(4000).price).toBe('$19');
  });

  it('quotes the next church the rung after the spots already gone', () => {
    expect(tierNow(0).price).toBe('$9');
    expect(tierNow(9).price).toBe('$9');
    expect(tierNow(10).price).toBe('$14');
    expect(tierNow(14).price).toBe('$14');
    expect(tierNow(15).price).toBe('$19');
  });
});

describe('what the page counts down', () => {
  it('counts down the rung being sold, not the whole ladder', () => {
    expect(spotsLeftInTier(0)).toBe(10);
    expect(spotsLeftInTier(7)).toBe(3);
    // The tenth spot going does not leave "0 left" on screen: it moves the
    // count on to the five at $14.
    expect(spotsLeftInTier(10)).toBe(5);
    expect(spotsLeftInTier(14)).toBe(1);
  });

  it('knows how big the rung being sold is', () => {
    expect(spotsInTier(0)).toBe(10);
    expect(spotsInTier(9)).toBe(10);
    // The tenth going takes the count on to the five at $14.
    expect(spotsInTier(10)).toBe(5);
    expect(spotsInTier(14)).toBe(5);
    expect(spotsInTier(15)).toBeNull();
  });

  it('stops counting once the ladder is spent', () => {
    expect(spotsLeftInTier(15)).toBeNull();
    expect(soldOut(14)).toBe(false);
    expect(soldOut(15)).toBe(true);
    expect(soldOut(200)).toBe(true);
  });
});

describe('the row of marks', () => {
  it('draws one mark per founding spot', () => {
    expect(marks(0)).toHaveLength(FOUNDING_SPOTS);
  });

  it('puts the yellow mark on the spot the reader would take', () => {
    const row = marks(7);

    expect(row.slice(0, 7).every(state => state === 'taken')).toBe(true);
    expect(row[7]).toBe('next');
    expect(row.slice(8).every(state => state === 'open')).toBe(true);
  });

  it('leaves no next mark once every spot is gone', () => {
    expect(marks(15).every(state => state === 'taken')).toBe(true);
  });
});
