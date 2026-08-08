'use client';

import { useEffect } from 'react';
import { saveWatchHistory } from './ContinueWatching';

export function WatchTracker(props: { animeSlug: string; animeTitle: string; poster: string | null; episodeSlug: string; episodeTitle: string }) {
  const { animeSlug, animeTitle, poster, episodeSlug, episodeTitle } = props;

  useEffect(() => {
    saveWatchHistory({ animeSlug, animeTitle, poster, episodeSlug, episodeTitle, watchedAt: Date.now() });
  }, [animeSlug, animeTitle, poster, episodeSlug, episodeTitle]);

  return null;
}
