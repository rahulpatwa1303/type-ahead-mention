// mentions.ts
// Debounced, cached, abortable @mention search, shared by the editor and the
// plain-textarea hook. No CodeMirror here.

import type { MentionItem } from './template';

/** Where @mention suggestions come from. Keep the object stable (module scope or useMemo) so results stay cached. */
export interface MentionSource {
  /** @default '@' */
  trigger?: string;
  /** Return matching items for the typed query. May be async; `signal` aborts when the query changes. */
  search: (query: string, options: { signal: AbortSignal }) => MentionItem[] | Promise<MentionItem[]>;
  /**
   * Milliseconds to wait after the last keystroke before searching.
   * @default 150
   */
  debounce?: number;
  /** Look up an item by id, so chips in saved text can show avatars */
  getItem?: (id: string) => MentionItem | undefined;
}

interface SourceCache {
  results: Map<string, MentionItem[]>;
  items: Map<string, MentionItem>;
  pending: string | null;
  controller: AbortController | null;
}

const caches = new WeakMap<MentionSource, SourceCache>();

const cacheFor = (source: MentionSource): SourceCache => {
  let cache = caches.get(source);
  if (!cache) {
    cache = { results: new Map(), items: new Map(), pending: null, controller: null };
    caches.set(source, cache);
  }
  return cache;
};

export const toSources = (mentions: MentionSource | MentionSource[] | undefined): MentionSource[] =>
  !mentions ? [] : Array.isArray(mentions) ? mentions : [mentions];

/**
 * Returns cached results for `query`, or `null` while a search runs.
 * When a search finishes, `onResult` is called so the caller can show it.
 */
export const searchMentions = (
  source: MentionSource,
  query: string,
  onResult: () => void
): MentionItem[] | null => {
  const cache = cacheFor(source);
  const cached = cache.results.get(query);
  if (cached) return cached;
  if (cache.pending === query) return null;

  cache.pending = query;
  cache.controller?.abort();
  const controller = new AbortController();
  cache.controller = controller;

  setTimeout(async () => {
    if (controller.signal.aborted) return;
    try {
      const items = await source.search(query, { signal: controller.signal });
      if (controller.signal.aborted) return;
      cache.results.set(query, items);
      for (const item of items) cache.items.set(item.id, item);
      if (cache.results.size > 100) cache.results.delete(cache.results.keys().next().value!);
    } catch {
      if (controller.signal.aborted) return;
      cache.results.set(query, []);
    }
    if (cache.pending === query) cache.pending = null;
    onResult();
  }, source.debounce ?? 150);

  return null;
};

/** Finds a known item by id across sources: from past results, then `getItem`. */
export const lookupMention = (sources: MentionSource[], id: string): MentionItem | undefined => {
  for (const source of sources) {
    const item = cacheFor(source).items.get(id) ?? source.getItem?.(id);
    if (item) return item;
  }
  return undefined;
};
