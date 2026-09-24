// template.ts
// Pure, framework-agnostic helpers for {{variable}} templates.

/** Any JSON-like object whose keys become autocomplete suggestions. */
export type SuggestionNode = { [key: string]: any };

/** The strings that open and close a variable, e.g. `{{` and `}}`. */
export interface Delimiters {
  open: string;
  close: string;
}

export const DEFAULT_DELIMITERS: Delimiters = { open: '{{', close: '}}' };

/** A variable found in a template string. */
export interface TemplateVariable {
  /** Normalized dot path, e.g. `user.roles.0` */
  path: string;
  /** The exact source text, e.g. `{{ user.roles[0] }}` */
  raw: string;
  /** Start offset of `raw` in the template */
  from: number;
  /** End offset of `raw` in the template */
  to: number;
}

type Prev = [never, 0, 1, 2, 3, 4, 5, 6];

/**
 * Every valid dot path into `T`, for type-checking variable names.
 * @example const p: TemplatePath<typeof data> = 'user.address.city';
 */
export type TemplatePath<T, Depth extends number = 6> = [Depth] extends [never]
  ? never
  : T extends readonly (infer U)[]
    ? `${number}` | (U extends object ? `${number}.${TemplatePath<U, Prev[Depth]>}` : never)
    : T extends object
      ? {
          [K in keyof T & (string | number)]:
            | `${K}`
            | (T[K] extends object ? `${K}.${TemplatePath<T[K], Prev[Depth]>}` : never);
        }[keyof T & (string | number)]
      : never;

/** Characters allowed in a single path segment. */
const SEGMENT = '[\\w$-]+';
const PATH_RE = new RegExp(`^${SEGMENT}(?:\\.${SEGMENT})*$`);

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const variableRegExp = ({ open, close }: Delimiters) =>
  close === ''
    ? // No closing delimiter (e.g. `@user.name`): the path itself ends the variable
      new RegExp(`${escapeRegExp(open)}(${SEGMENT}(?:\\.${SEGMENT})*)`, 'g')
    : new RegExp(
    `${escapeRegExp(open)}\\s*((?:(?!${escapeRegExp(open)})[^\\n])*?)\\s*${escapeRegExp(close)}`,
    'g'
  );

/** `items[0].name` → `items.0.name` */
export const normalizePath = (path: string): string =>
  path.trim().replace(/\[\s*(\d+)\s*\]/g, '.$1').replace(/^\./, '');

export const isValidPath = (path: string): boolean => PATH_RE.test(path);

const isBranch = (value: unknown): value is object =>
  typeof value === 'object' && value !== null;

/** Looks up a dot path. `found` distinguishes a missing key from an `undefined` value. */
export const getValueAtPath = (
  data: unknown,
  path: string | string[]
): { found: boolean; value: unknown } => {
  const keys = typeof path === 'string' ? normalizePath(path).split('.') : path;
  let current: any = data;
  for (const key of keys) {
    if (key === '') continue;
    if (isBranch(current) && Object.prototype.hasOwnProperty.call(current, key)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return { found: false, value: undefined };
    }
  }
  return { found: true, value: current };
};

/** Finds every well-formed variable in a template. */
export const parseTemplate = (
  template: string,
  delimiters: Delimiters = DEFAULT_DELIMITERS
): TemplateVariable[] => {
  const result: TemplateVariable[] = [];
  if (!template) return result;
  for (const match of template.matchAll(variableRegExp(delimiters))) {
    const path = normalizePath(match[1]);
    if (!isValidPath(path)) continue;
    result.push({ path, raw: match[0], from: match.index!, to: match.index! + match[0].length });
  }
  return result;
};

export interface ResolveOptions {
  delimiters?: Delimiters;
  /**
   * What to output for a path that doesn't exist in the data.
   * `'keep'` leaves the variable as written, `'empty'` removes it,
   * or pass a function to decide per variable.
   * @default 'keep'
   */
  missing?: 'keep' | 'empty' | ((variable: TemplateVariable) => string);
  /** Converts a found value to text. Defaults to `String()` for primitives and JSON for objects. */
  format?: (value: unknown, variable: TemplateVariable) => string;
}

const defaultFormat = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (isBranch(value)) return JSON.stringify(value);
  return String(value);
};

/**
 * Replaces every variable in `template` with its value from `data`.
 * @example resolveTemplate('Hi {{user.name}}', { user: { name: 'Ada' } }) // 'Hi Ada'
 */
export const resolveTemplate = (
  template: string,
  data: SuggestionNode,
  { delimiters = DEFAULT_DELIMITERS, missing = 'keep', format = defaultFormat }: ResolveOptions = {}
): string => {
  const variables = parseTemplate(template, delimiters);
  let out = '';
  let last = 0;
  for (const variable of variables) {
    out += template.slice(last, variable.from);
    const { found, value } = getValueAtPath(data, variable.path);
    if (found) out += format(value, variable);
    else if (missing === 'keep') out += variable.raw;
    else if (missing !== 'empty') out += missing(variable);
    last = variable.to;
  }
  return out + template.slice(last);
};

/** Reports variables that don't exist in `data`. */
export const validateTemplate = (
  template: string,
  data: SuggestionNode,
  { delimiters = DEFAULT_DELIMITERS }: { delimiters?: Delimiters } = {}
): { valid: boolean; unknown: TemplateVariable[] } => {
  const unknown = parseTemplate(template, delimiters).filter(
    (v) => !getValueAtPath(data, v.path).found
  );
  return { valid: unknown.length === 0, unknown };
};

/** One autocomplete option. */
export interface SuggestionItem {
  /** The key or array index being suggested */
  key: string;
  /** The full dot path including this key */
  path: string;
  value: unknown;
  /** True when the value is an object or array you can drill into */
  isBranch: boolean;
}

/** What to complete at a cursor position, with offsets relative to the given text. */
export interface CompletionMatch {
  /** Start of the partially typed segment */
  from: number;
  /** End of the segment (includes word characters after the cursor) */
  to: number;
  /** The segment typed so far */
  query: string;
  parentPath: string[];
  items: SuggestionItem[];
  /** True if the closing delimiter already follows `to` */
  hasClose: boolean;
}

const PARTIAL_RE = /^\s*((?:[\w$-]+\.)*)([\w$-]*)$/;

/**
 * Works out which suggestions to show for the cursor at `cursor` in `text`.
 * Returns null when the cursor isn't inside an open variable.
 */
export const getCompletionMatch = (
  text: string,
  cursor: number,
  data: SuggestionNode,
  delimiters: Delimiters = DEFAULT_DELIMITERS
): CompletionMatch | null => {
  const lineStart = text.lastIndexOf('\n', cursor - 1) + 1;
  const before = text.slice(lineStart, cursor);
  const open = before.lastIndexOf(delimiters.open);
  if (open === -1) return null;

  const inner = before.slice(open + delimiters.open.length);
  // Already closed before the cursor, so we're outside a variable
  if (delimiters.close && inner.includes(delimiters.close)) return null;

  const m = PARTIAL_RE.exec(inner);
  if (!m) return null;

  const parentPath = m[1] ? m[1].slice(0, -1).split('.') : [];
  const query = m[2];
  const { found, value: node } = getValueAtPath(data, parentPath);
  if (!found || !isBranch(node)) return null;

  const afterWord = /^[\w$-]*/.exec(text.slice(cursor))![0].length;
  const to = cursor + afterWord;
  const prefix = parentPath.length ? parentPath.join('.') + '.' : '';
  const keys = Array.isArray(node) ? node.map((_, i) => String(i)) : Object.keys(node);

  return {
    from: cursor - query.length,
    to,
    query,
    parentPath,
    hasClose: text.startsWith(delimiters.close, to),
    items: keys.map((key) => {
      const value = (node as any)[key];
      return { key, path: prefix + key, value, isBranch: isBranch(value) };
    }),
  };
};

/** Short, single-line preview of a value for the suggestion list. */
export const previewValue = (value: unknown, max = 28): string => {
  if (Array.isArray(value)) return `[${value.length} ${value.length === 1 ? 'item' : 'items'}]`;
  if (isBranch(value)) {
    const n = Object.keys(value).length;
    return `{${n} ${n === 1 ? 'key' : 'keys'}}`;
  }
  const text = typeof value === 'string' ? JSON.stringify(value) : String(value);
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
};

/** Filters and ranks items for a query: prefix matches first, then substring matches. */
export const filterSuggestions = (items: SuggestionItem[], query: string): SuggestionItem[] => {
  if (!query) return items;
  const q = query.toLowerCase();
  const prefix: SuggestionItem[] = [];
  const contains: SuggestionItem[] = [];
  for (const item of items) {
    const k = item.key.toLowerCase();
    if (k.startsWith(q)) prefix.push(item);
    else if (k.includes(q)) contains.push(item);
  }
  return [...prefix, ...contains];
};

// ---------------------------------------------------------------------------
// @mentions: stored as `@[Label](id)`, the same format react-mentions uses

/** A person (or anything else) that can be mentioned. */
export interface MentionItem {
  /** Stable id, stored in the text */
  id: string;
  /** Display name, stored in the text and shown in the chip */
  label: string;
  /** Image URL for the avatar */
  avatar?: string;
  /** Secondary line in the list, e.g. an email or role */
  description?: string;
}

/** A mention found in text. */
export interface ParsedMention {
  trigger: string;
  label: string;
  id: string;
  /** The stored text, e.g. `@[Ada Lovelace](u_42)` */
  raw: string;
  from: number;
  to: number;
}

/** The stored text for a mention: `@[Ada Lovelace](u_42)`. */
export const formatMention = (item: Pick<MentionItem, 'id' | 'label'>, trigger = '@'): string =>
  `${trigger}[${item.label.replace(/[[\]\n]/g, '')}](${item.id.replace(/[()\s]/g, '')})`;

const mentionRegExp = (triggers: string[]) =>
  new RegExp(`(${triggers.map(escapeRegExp).join('|')})\\[([^\\]\\n]+)\\]\\(([^)\\s]+)\\)`, 'g');

/** Finds every stored mention. */
export const parseMentions = (text: string, triggers: string[] = ['@']): ParsedMention[] => {
  if (!text || triggers.length === 0) return [];
  return [...text.matchAll(mentionRegExp(triggers))].map((m) => ({
    trigger: m[1],
    label: m[2],
    id: m[3],
    raw: m[0],
    from: m.index!,
    to: m.index! + m[0].length,
  }));
};

/**
 * Replaces stored mentions, e.g. to send plain text to an LLM or render HTML.
 * Defaults to `@Label`.
 * @example replaceMentions('Ask @[Ada](u_42)', (m) => `<@${m.id}>`) // 'Ask <@u_42>'
 */
export const replaceMentions = (
  text: string,
  replacer: (mention: ParsedMention) => string = (m) => m.trigger + m.label,
  triggers: string[] = ['@']
): string => {
  let out = '';
  let last = 0;
  for (const m of parseMentions(text, triggers)) {
    out += text.slice(last, m.from) + replacer(m);
    last = m.to;
  }
  return out + text.slice(last);
};

/** The partly typed mention at the cursor, with offsets relative to `text`. */
export interface MentionMatch {
  trigger: string;
  /** Offset of the trigger character */
  from: number;
  /** End of the query (includes word characters after the cursor) */
  to: number;
  query: string;
}

const QUERY_RE = /^[\p{L}\p{N}_.'-]*$/u;
const WORD_AFTER_RE = /^[\p{L}\p{N}_.'-]*/u;

/**
 * Finds a mention being typed at `cursor`, e.g. `Ask @ad|`.
 * The trigger must start the line or follow whitespace or `(`, so emails don't count.
 */
export const getMentionMatch = (
  text: string,
  cursor: number,
  trigger = '@',
  maxQuery = 40
): MentionMatch | null => {
  const lineStart = text.lastIndexOf('\n', cursor - 1) + 1;
  const before = text.slice(lineStart, cursor);
  const at = before.lastIndexOf(trigger);
  if (at === -1) return null;
  const prev = before[at - 1];
  if (at > 0 && !/[\s(]/.test(prev)) return null;
  const query = before.slice(at + trigger.length);
  if (query.length > maxQuery || !QUERY_RE.test(query)) return null;
  const after = WORD_AFTER_RE.exec(text.slice(cursor))![0].length;
  return { trigger, from: lineStart + at, to: cursor + after, query };
};
