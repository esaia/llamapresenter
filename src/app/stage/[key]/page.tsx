import { notFound } from 'next/navigation';

import { StageOutput, type StageInitial } from '@/components/projector/StageOutput';
import { asBlackout } from '@/lib/live/blackout';
import { watermarkFor } from '@/lib/billing/watermark';
import { admin } from '@/lib/supabase/admin';
import { asTimerState } from '@/lib/timer/model';
import { emptyShowData, isLang, type ProjectorStyle, type ShowData } from '@/lib/types';

export const metadata = { title: 'Stage', robots: { index: false } };

/**
 * The stage display, addressed by the same session key as the projector.
 *
 * Rendered from the stored row so a monitor switched on mid-service already
 * shows the slide, what is coming and the run in progress, rather than a black
 * screen until the operator next touches something.
 */
export default async function StagePage({ params }: PageProps<'/stage/[key]'>) {
  const { key } = await params;

  const db = admin();
  const { data: session } = await db.from('sessions').select('id, user_id').eq('output_key', key).maybeSingle();

  if (!session) notFound();

  const { data: state } = await db
    .from('session_state')
    .select('show_data, next_show_data, projector, stage_lang, timer, blackout')
    .eq('session_id', session.id)
    .maybeSingle();

  const initial: StageInitial = {
    showData: (state?.show_data as ShowData) ?? emptyShowData(),
    next: (state?.next_show_data as ShowData) ?? emptyShowData(),
    projector: (state?.projector as Partial<ProjectorStyle>) ?? {},
    stageLang: isLang(state?.stage_lang) ? state.stage_lang : undefined,
    timer: asTimerState(state?.timer),
    // A monitor switched back on while the stage is black stays black.
    black: asBlackout(state?.blackout).stage,
  };

  return <StageOutput outputKey={key} initial={initial} watermark={await watermarkFor(session.user_id)} />;
}
