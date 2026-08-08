const API_BASE = (process.env.ZNN_API_BASE || 'https://api.znn.my.id').replace(/\/+$/, '');

export interface AnimeCardData {
  title: string;
  thumb: string | null;
  slug: string;
  status?: string | null;
  episode?: string | null;
  rating?: string | null;
  updatedOn?: string | null;
  genres?: string[];
}

export interface EpisodeItem {
  title: string;
  link: string;
  date?: string | null;
  slug: string;
  number: number | null;
}

export interface AnimeDetailData {
  title: string;
  thumb: string | null;
  sinopsis: string | null;
  info: {
    judul?: string;
    japanese?: string;
    skor?: string;
    produser?: string;
    tipe?: string;
    status?: string;
    total_episode?: string;
    durasi?: string;
    tanggal_rilis?: string;
    studio?: string;
    genre?: string;
  };
  episodes: EpisodeItem[];
  batchLink?: string | null;
  totalEpisodes: number;
  url?: string | null;
  slug: string;
}

export interface StreamDownloadLink {
  provider: string;
  url: string;
}

export interface AnimeStreamData {
  title: string;
  streamLink: string | null;
  downloadLinks: Record<string, StreamDownloadLink[]>;
  url?: string | null;
}

type ApiEnvelope<T> = {
  creator?: string;
  status?: boolean;
  result?: T;
  message?: string;
};

async function fetchApi<T>(path: string, options?: { revalidate?: number; noStore?: boolean }): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const init: RequestInit & { next?: { revalidate?: number } } = {
    headers: { accept: 'application/json' },
  };

  if (options?.noStore) {
    init.cache = 'no-store';
  } else {
    init.next = { revalidate: options?.revalidate ?? 120 };
  }

  const response = await fetch(url, init);
  const text = await response.text();

  let json: ApiEnvelope<T>;
  try {
    json = JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    throw new Error(`API mengembalikan respons yang tidak valid (${response.status}).`);
  }

  if (!response.ok || json.status === false || !json.result) {
    throw new Error(json.message || `API gagal (${response.status}).`);
  }

  return json.result;
}

export function endpointFromLink(link?: string | null): string {
  if (!link) return '';
  try {
    const url = new URL(link);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts.at(-1) || '';
  } catch {
    const parts = String(link).split('?')[0].split('/').filter(Boolean);
    return parts.at(-1) || '';
  }
}

function endpointForApi(slug: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(slug));
  } catch {
    return encodeURIComponent(slug);
  }
}

export function episodeNumberFromTitle(title?: string | null): number | null {
  if (!title) return null;
  const match = title.match(/episode\s+(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : null;
}

function normalizeListItem(item: any): AnimeCardData {
  const slug = item.endpoint || endpointFromLink(item.link);
  const rawStatus = item.status ? String(item.status) : '';
  const ratingFromStatus = rawStatus.match(/rating\s*:\s*([0-9.]+)/i)?.[1] || null;
  const rating = item.rating && item.rating !== '?' ? String(item.rating) : ratingFromStatus;
  const status = /rating\s*:/i.test(rawStatus) ? null : (rawStatus || null);
  return {
    title: String(item.title || 'Tanpa judul'),
    thumb: item.thumb ? String(item.thumb) : null,
    slug,
    status,
    episode: item.totalEpisode ? String(item.totalEpisode) : null,
    rating,
    updatedOn: item.updatedOn ? String(item.updatedOn) : null,
    genres: Array.isArray(item.genres) ? item.genres.map(String) : [],
  };
}

export async function getOngoing(page = 1) {
  const result = await fetchApi<any>(`/otakudesu-ongoing?page=${Math.max(1, page)}`, { revalidate: 60 });
  const items = Array.isArray(result.anime) ? result.anime.map(normalizeListItem) : [];
  return {
    page: Number(result.page || page),
    items,
    hasNext: items.length >= 25,
  };
}

export async function getCompleted(page = 1) {
  const result = await fetchApi<any>(`/otakudesu-completed?page=${Math.max(1, page)}`, { revalidate: 300 });
  const items = Array.isArray(result.anime) ? result.anime.map(normalizeListItem) : [];
  return {
    page: Number(result.page || page),
    items,
    hasNext: items.length >= 25,
  };
}

export async function searchAnime(query: string) {
  const q = query.trim();
  if (!q) return { query: '', items: [] as AnimeCardData[] };
  const result = await fetchApi<any>(`/otakudesu?q=${encodeURIComponent(q)}`, { revalidate: 120 });
  const raw = Array.isArray(result.results) ? result.results : [];
  return {
    query: String(result.query || q),
    items: raw.map(normalizeListItem),
  };
}

export async function getAnimeDetail(slug: string): Promise<AnimeDetailData> {
  const cleanSlug = endpointForApi(slug);
  const result = await fetchApi<any>(`/otakudesu-get?url=${encodeURIComponent(cleanSlug)}`, { revalidate: 120 });
  const rawEpisodes = Array.isArray(result.episodes) ? result.episodes : [];
  const episodes = rawEpisodes.map((ep: any) => ({
    title: String(ep.title || 'Episode'),
    link: String(ep.link || ''),
    date: ep.date ? String(ep.date) : null,
    slug: endpointFromLink(ep.link),
    number: episodeNumberFromTitle(ep.title),
  })) as EpisodeItem[];

  episodes.sort((a, b) => {
    if (a.number !== null && b.number !== null) return a.number - b.number;
    return a.title.localeCompare(b.title);
  });

  return {
    title: String(result.title || result.detail?.judul || 'Tanpa judul'),
    thumb: result.thumb ? String(result.thumb) : null,
    sinopsis: result.sinopsis ? String(result.sinopsis) : null,
    info: result.detail || {},
    episodes,
    batchLink: result.batchLink ?? null,
    totalEpisodes: Number(result.totalEpisodes || episodes.length || 0),
    url: result.url ? String(result.url) : null,
    slug,
  };
}

export async function getAnimeStream(endpoint: string): Promise<AnimeStreamData> {
  const clean = endpointForApi(endpoint);
  const result = await fetchApi<any>(`/otakudesu-stream?endpoint=${encodeURIComponent(clean)}`, { noStore: true });
  return {
    title: String(result.title || 'Episode'),
    streamLink: result.streamLink ? String(result.streamLink) : null,
    downloadLinks: result.downloadLinks && typeof result.downloadLinks === 'object' ? result.downloadLinks : {},
    url: result.url ? String(result.url) : null,
  };
}

export async function getHomeData() {
  const [ongoing, completed] = await Promise.all([getOngoing(1), getCompleted(1)]);
  return { ongoing, completed };
}

export function apiBaseForDisplay() {
  return API_BASE;
}
