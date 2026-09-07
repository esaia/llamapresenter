'use client';

import { useEffect, useState } from 'react';

import type { SignalTransport } from '@/lib/live/protocol';
import { loadLocalFile, loadReceivedFile, saveReceivedFile } from '@/lib/media/localMedia';
import { requestAsset } from '@/lib/media/peerAssets';
import type { LocalFileMeta } from '@/lib/types';

/**
 * One file, from wherever this machine can get it.
 *
 * Three places to look, cheapest first: this browser may own the file (the
 * console's own projector tab does), it may have been sent one before, or it
 * has to be pulled from the console over WebRTC. A received copy is cached, so
 * a reload — or a console that has since been shut — does not blank the screen.
 */
const resolveFile = async (id: string, transport: SignalTransport | null): Promise<Blob | null> => {
  const own = await loadLocalFile(id).catch(() => null);

  if (own?.file) return own.file;

  const cached = await loadReceivedFile(id).catch(() => null);

  if (cached?.file) return cached.file;

  if (!transport) return null;

  try {
    const received = await requestAsset(id, transport);

    await saveReceivedFile(received as never).catch(() => {});

    return received.file;
  } catch {
    // Nothing to draw. An empty picture reads as one arriving late rather than
    // as a broken image.
    return null;
  }
};

/** Resolve the operator's own background to something this machine can draw. */
export const useLocalBackground = (meta: LocalFileMeta | null, transport: SignalTransport | null) => {
  const [url, setUrl] = useState('');
  const id = meta?.id ?? null;

  useEffect(() => {
    if (!id) return;

    let objectUrl = '';
    let cancelled = false;

    void resolveFile(id, transport).then(file => {
      if (cancelled || !file) return;

      objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setUrl('');
    };
  }, [id, transport]);

  return id ? url : '';
};

/**
 * The same, for the pictures a custom template names — by file id, so the
 * renderer can look one up without knowing where it came from.
 *
 * They arrive one at a time rather than all together: a template with a logo
 * and a photograph should show the logo while the photograph is still coming
 * over the wire, which on a slow connection is the difference between a slide
 * appearing and a slide appearing late.
 */
export const useLocalFiles = (metas: LocalFileMeta[], transport: SignalTransport | null) => {
  const [urls, setUrls] = useState<Record<string, string>>({});

  // The identity of the set, not the array: a payload rebuilds the metas every
  // time it lands, and re-fetching every picture on each verse change would
  // put a WebRTC round trip in front of the slide.
  const key = [...new Set(metas.map(meta => meta.id))].sort().join(',');

  useEffect(() => {
    // Nothing to fetch, and nothing to clear either: the previous run's
    // cleanup has already emptied the map and revoked what it made.
    if (!key) return;

    const ids = key.split(',');

    let cancelled = false;
    const made: string[] = [];

    void Promise.all(
      ids.map(async id => {
        const file = await resolveFile(id, transport);

        if (cancelled || !file) return;

        const url = URL.createObjectURL(file);

        made.push(url);
        setUrls(current => ({ ...current, [id]: url }));
      }),
    );

    return () => {
      cancelled = true;
      made.forEach(URL.revokeObjectURL);
      setUrls({});
    };
  }, [key, transport]);

  return urls;
};
