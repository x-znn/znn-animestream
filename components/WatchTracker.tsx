'use client';

import { useEffect } from 'react';
import { saveWatchHistory } from './ContinueWatching';

export function WatchTracker(props: { animeSlug: string; animeTitle: string; poster: string | null; episodeSlug: string; episodeTitle: string }) {
  useEffect(() => {
    saveWatchHistory({ ...props, watchedAt: Date.now() });
  }, [props.animeSlug, props.animeTitle, props.poster, props.episodeSlug, props.episodeTitle]);
  return null;
}
