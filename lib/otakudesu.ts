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

export interface AnimeDetailInfo {
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
}

export interface AnimeDetailData {
  title: string;
  thumb: string | null;
  sinopsis: string | null;
  info: AnimeDetailInfo;
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

export interface AnimeListPageData {
  page: number;
  items: AnimeCardData[];
  hasNext: boolean;
}

export interface AnimeSearchData {
  query: string;
  items: AnimeCardData[];
}

export interface HomeData {
  ongoing: AnimeListPageData;
  completed: AnimeListPageData;
}

type ApiEnvelope<T> = {
  creator?: string;
  status?: boolean;
  result?: T;
  message?: string;
};

type RawAnimeListItem = {
  title?: unknown;
  thumb?: unknown;
  endpoint?: unknown;
  link?: unknown;
  status?: unknown;
  totalEpisode?: unknown;
  rating?: unknown;
  updatedOn?: unknown;
  genres?: unknown;
};

type RawAnimeListResult = {
  page?: unknown;
  anime?: unknown;
};

type RawAnimeSearchResult = {
  query?: unknown;
  results?: unknown;
};

type RawEpisode = {
  title?: unknown;
  link?: unknown;
  date?: unknown;
};

type RawAnimeDetailResult = {
  title?: unknown;
  thumb?: unknown;
  sinopsis?: unknown;
  detail?: unknown;
  episodes?: unknown;
  batchLink?: unknown;
  totalEpisodes?: unknown;
  url?: unknown;
};

type RawAnimeStreamResult = {
  title?: unknown;
  streamLink?: unknown;
  downloadLinks?: unknown;
  url?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}

function asNullableString(value: unknown): string | null {
  const text = asString(value).trim();
  return text ? text : null;
}

function asNumber(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toRawListItem(value: unknown): RawAnimeListItem {
  return isRecord(value) ? value : {};
}

function toRawEpisode(value: unknown): RawEpisode {
  return isRecord(value) ? value : {};
}

function normalizeDetailInfo(value: unknown): AnimeDetailInfo {
  if (!isRecord(value)) return {};
  const info: AnimeDetailInfo = {};
  const fields: Array<keyof AnimeDetailInfo> = [
    'judul', 'japanese', 'skor', 'produser', 'tipe', 'status',
    'total_episode', 'durasi', 'tanggal_rilis', 'studio', 'genre',
  ];
  for (const field of fields) {
    const text = asNullableString(value[field]);
    if (text) info[field] = text;
  }
  return info;
}

function normalizeDownloadLinks(value: unknown): Record<string, StreamDownloadLink[]> {
  if (!isRecord(value)) return {};
  const output: Record<string, StreamDownloadLink[]> = {};

  for (const [quality, rawLinks] of Object.entries(value)) {
    if (!Array.isArray(rawLinks)) continue;
    const links: StreamDownloadLink[] = [];

    for (const rawLink of rawLinks) {
      if (!isRecord(rawLink)) continue;
      const provider = asNullableString(rawLink.provider);
      const url = asNullableString(rawLink.url);
      if (provider && url) links.push({ provider, url });
    }

    if (links.length) output[quality] = links;
  }

  return output;
}

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

  if (!response.ok || json.status === false || json.result === undefined || json.result === null) {
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

function endpointForApi(value: string): string {
  let decoded = value.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    decoded = value.trim();
  }

  if (/^https?:\/\//i.test(decoded) || decoded.includes('/episode/')) {
    const fromLink = endpointFromLink(decoded);
    if (fromLink) return fromLink;
  }

  return decoded
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean)
    .at(-1) || '';
}

export function episodeNumberFromTitle(title?: string | null): number | null {
  if (!title) return null;
  const match = title.match(/episode\s+(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : null;
}

function normalizeListItem(value: unknown): AnimeCardData {
  const item = toRawListItem(value);
  const link = asNullableString(item.link);
  const slug = asNullableString(item.endpoint) || endpointFromLink(link);
  const rawStatus = asString(item.status);
  const ratingFromStatus = rawStatus.match(/rating\s*:\s*([0-9.]+)/i)?.[1] || null;
  const rawRating = asNullableString(item.rating);
  const rating = rawRating && rawRating !== '?' ? rawRating : ratingFromStatus;
  const status = /rating\s*:/i.test(rawStatus) ? null : (rawStatus || null);
  const genres = Array.isArray(item.genres)
    ? item.genres.map((genre) => asString(genre)).filter(Boolean)
    : [];

  return {
    title: asString(item.title, 'Tanpa judul'),
    thumb: asNullableString(item.thumb),
    slug,
    status,
    episode: asNullableString(item.totalEpisode),
    rating,
    updatedOn: asNullableString(item.updatedOn),
    genres,
  };
}

export async function getOngoing(page = 1): Promise<AnimeListPageData> {
  const result = await fetchApi<RawAnimeListResult>(`/otakudesu-ongoing?page=${Math.max(1, page)}`, { revalidate: 60 });
  const items: AnimeCardData[] = Array.isArray(result.anime) ? result.anime.map(normalizeListItem) : [];
  return {
    page: asNumber(result.page, page),
    items,
    hasNext: items.length >= 25,
  };
}

export async function getCompleted(page = 1): Promise<AnimeListPageData> {
  const result = await fetchApi<RawAnimeListResult>(`/otakudesu-completed?page=${Math.max(1, page)}`, { revalidate: 300 });
  const items: AnimeCardData[] = Array.isArray(result.anime) ? result.anime.map(normalizeListItem) : [];
  return {
    page: asNumber(result.page, page),
    items,
    hasNext: items.length >= 25,
  };
}

export async function searchAnime(query: string): Promise<AnimeSearchData> {
  const q = query.trim();
  if (!q) return { query: '', items: [] };
  const result = await fetchApi<RawAnimeSearchResult>(`/otakudesu?q=${encodeURIComponent(q)}`, { revalidate: 120 });
  const items: AnimeCardData[] = Array.isArray(result.results) ? result.results.map(normalizeListItem) : [];
  return {
    query: asString(result.query, q),
    items,
  };
}

export async function getAnimeDetail(slug: string): Promise<AnimeDetailData> {
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    decodedSlug = slug;
  }
  const cleanSlug = decodedSlug.replace(/^\/+|\/+$/g, '');
  const animeUrl = `https://otakudesu.blog/anime/${encodeURIComponent(cleanSlug)}/`;
  const result = await fetchApi<RawAnimeDetailResult>(`/otakudesu-get?url=${encodeURIComponent(animeUrl)}`, { revalidate: 120 });
  const rawEpisodes = Array.isArray(result.episodes) ? result.episodes : [];
  const episodes: EpisodeItem[] = rawEpisodes.map((value) => {
    const episode = toRawEpisode(value);
    const title = asString(episode.title, 'Episode');
    const link = asString(episode.link);
    return {
      title,
      link,
      date: asNullableString(episode.date),
      slug: endpointFromLink(link),
      number: episodeNumberFromTitle(title),
    };
  });

  episodes.sort((a, b) => {
    if (a.number !== null && b.number !== null) return a.number - b.number;
    return a.title.localeCompare(b.title);
  });

  const info = normalizeDetailInfo(result.detail);

  return {
    title: asString(result.title, info.judul || 'Tanpa judul'),
    thumb: asNullableString(result.thumb),
    sinopsis: asNullableString(result.sinopsis),
    info,
    episodes,
    batchLink: asNullableString(result.batchLink),
    totalEpisodes: asNumber(result.totalEpisodes, episodes.length),
    url: asNullableString(result.url),
    slug,
  };
}

export async function getAnimeStream(endpoint: string): Promise<AnimeStreamData> {
  const clean = endpointForApi(endpoint);
  const result = await fetchApi<RawAnimeStreamResult>(`/otakudesu-stream?endpoint=${encodeURIComponent(clean)}`, { noStore: true });
  return {
    title: asString(result.title, 'Episode'),
    streamLink: asNullableString(result.streamLink),
    downloadLinks: normalizeDownloadLinks(result.downloadLinks),
    url: asNullableString(result.url),
  };
}

export async function getHomeData(): Promise<HomeData> {
  const [ongoing, completed] = await Promise.all([getOngoing(1), getCompleted(1)]);
  return { ongoing, completed };
}

export function apiBaseForDisplay(): string {
  return API_BASE;
}
