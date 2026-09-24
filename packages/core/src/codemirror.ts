// codemirror.ts
// CodeMirror 6 extensions: variable completion, highlighting, single-line mode.

import {
  autocompletion,
  startCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete';
import { EditorState, Facet, RangeSet, RangeSetBuilder, type Extension } from '@codemirror/state';
import {
  Decoration,
  EditorView,
  ViewPlugin,
  WidgetType,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view';
import {
  DEFAULT_DELIMITERS,
  formatMention,
  getCompletionMatch,
  getMentionMatch,
  getValueAtPath,
  parseMentions,
  parseTemplate,
  previewValue,
  type Delimiters,
  type MentionItem,
  type SuggestionItem,
  type SuggestionNode,
} from './template';

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

export interface TemplateConfig {
  data: SuggestionNode;
  delimiters: Delimiters;
  /** Show a value preview next to each suggestion */
  showValues: boolean;
  /** Mark variables in the text */
  highlight: boolean;
  /** Mark variables whose path isn't in `data` */
  validate: boolean;
  /** @mention sources */
  mentions: MentionSource[];
}

const defaultConfig: TemplateConfig = {
  data: {},
  delimiters: DEFAULT_DELIMITERS,
  showValues: true,
  highlight: true,
  validate: true,
  mentions: [],
};

/** Holds the data and options the completion source and highlighter read. */
export const templateConfig = Facet.define<Partial<TemplateConfig>, TemplateConfig>({
  combine: (values) => Object.assign({}, defaultConfig, ...values),
});

const fullInfo = (item: SuggestionItem) => () => {
  const dom = document.createElement('div');
  dom.className = 'tam-info';
  const path = document.createElement('div');
  path.className = 'tam-info-path';
  path.textContent = item.path;
  const value = document.createElement('pre');
  value.className = 'tam-info-value';
  const json = JSON.stringify(item.value, null, 2) ?? String(item.value);
  value.textContent = json.length > 600 ? json.slice(0, 599) + '…' : json;
  dom.append(path, value);
  return dom;
};

/** Completion source that suggests keys from the configured data. */
export const templateCompletionSource = (context: CompletionContext): CompletionResult | null => {
  const { data, delimiters, showValues } = context.state.facet(templateConfig);
  const line = context.state.doc.lineAt(context.pos);
  const match = getCompletionMatch(line.text, context.pos - line.from, data, delimiters);
  if (!match || match.items.length === 0) return null;

  const from = line.from + match.from;
  const to = line.from + match.to;

  const options: Completion[] = match.items.map((item, index) => ({
    label: item.key,
    detail: showValues ? previewValue(item.value) : undefined,
    info: showValues ? fullInfo(item) : undefined,
    type: item.isBranch ? 'namespace' : 'variable',
    // Keep the data's order rather than alphabetical
    boost: -index / match.items.length,
    apply: (view, _completion, applyFrom, applyTo) => {
      if (item.isBranch) {
        const insert = item.key + '.';
        view.dispatch({
          changes: { from: applyFrom, to: applyTo, insert },
          selection: { anchor: applyFrom + insert.length },
          userEvent: 'input.complete',
        });
        // Open the next level straight away
        setTimeout(() => startCompletion(view), 0);
      } else {
        const insert = item.key + (match.hasClose ? '' : delimiters.close);
        view.dispatch({
          changes: { from: applyFrom, to: applyTo, insert },
          selection: { anchor: applyFrom + item.key.length + delimiters.close.length },
          userEvent: 'input.complete',
        });
      }
    },
  }));

  return {
    from,
    to: Math.max(to, context.pos),
    options,
    validFor: /^[\w$-]*$/,
  };
};

// --- @mentions ---------------------------------------------------------------

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

const lookupItem = (sources: MentionSource[], id: string): MentionItem | undefined => {
  for (const source of sources) {
    const item = cacheFor(source).items.get(id) ?? source.getItem?.(id);
    if (item) return item;
  }
  return undefined;
};

const statusResult = (from: number, label: string): CompletionResult => ({
  from,
  filter: false,
  options: [{ label, type: 'tam-status', apply: () => {} }],
});

/** Completion source for `@` mentions. Searches asynchronously and caches per query. */
export const mentionCompletionSource = (context: CompletionContext): CompletionResult | null => {
  const { mentions } = context.state.facet(templateConfig);
  if (mentions.length === 0) return null;
  const line = context.state.doc.lineAt(context.pos);

  for (const source of mentions) {
    const trigger = source.trigger ?? '@';
    const match = getMentionMatch(line.text, context.pos - line.from, trigger);
    if (!match) continue;
    const from = line.from + match.from;
    const to = line.from + match.to;
    const cache = cacheFor(source);
    const cached = cache.results.get(match.query);

    if (!cached) {
      if (cache.pending !== match.query) {
        cache.pending = match.query;
        cache.controller?.abort();
        const controller = new AbortController();
        cache.controller = controller;
        const query = match.query;
        const view = context.view;
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
          // Ask CodeMirror for the list again; this time it's cached
          if (view && view.hasFocus) startCompletion(view);
        }, source.debounce ?? 150);
      }
      return statusResult(from, 'Searching…');
    }

    if (cached.length === 0) return statusResult(from, 'No matches');

    return {
      from,
      to: Math.max(to, context.pos),
      filter: false,
      options: cached.map((item, index) => ({
        label: item.label,
        detail: item.description,
        type: 'tam-person',
        boost: -index / cached.length,
        avatar: item.avatar,
        apply: (view: EditorView, _c: Completion, applyFrom: number, applyTo: number) => {
          const insert = formatMention(item, trigger) + ' ';
          view.dispatch({
            changes: { from: applyFrom, to: applyTo, insert },
            selection: { anchor: applyFrom + insert.length },
            userEvent: 'input.complete',
          });
        },
      })),
    };
  }
  return null;
};

class MentionWidget extends WidgetType {
  constructor(
    readonly raw: string,
    readonly text: string,
    readonly avatar: string | undefined
  ) {
    super();
  }
  eq(other: MentionWidget) {
    return other.raw === this.raw && other.avatar === this.avatar;
  }
  toDOM() {
    const chip = document.createElement('span');
    chip.className = 'tam-mention';
    chip.setAttribute('data-mention', this.raw);
    if (this.avatar) {
      const img = document.createElement('img');
      img.className = 'tam-avatar';
      img.src = this.avatar;
      img.alt = '';
      chip.appendChild(img);
    }
    chip.appendChild(document.createTextNode(this.text));
    return chip;
  }
  ignoreEvent() {
    return false;
  }
}

const renderAvatar = (completion: Completion & { avatar?: string }) => {
  if (completion.type !== 'tam-person') return null;
  const box = document.createElement('span');
  box.className = 'tam-option-avatar';
  if (completion.avatar) {
    const img = document.createElement('img');
    img.src = completion.avatar;
    img.alt = '';
    box.appendChild(img);
  } else {
    box.textContent = completion.label.slice(0, 1).toUpperCase();
  }
  return box;
};

// --- highlighting ----------------------------------------------------------------

const varMark = Decoration.mark({ class: 'tam-var' });

function buildDecorations(view: EditorView): { decorations: DecorationSet; atoms: DecorationSet } {
  const { data, delimiters, highlight, validate, mentions } = view.state.facet(templateConfig);
  const builder = new RangeSetBuilder<Decoration>();
  const atoms = new RangeSetBuilder<Decoration>();
  const hasData = Object.keys(data).length > 0;
  const triggers = mentions.map((m) => m.trigger ?? '@');

  for (const { from, to } of view.visibleRanges) {
    const startLine = view.state.doc.lineAt(from);
    const endLine = view.state.doc.lineAt(to);
    for (let n = startLine.number; n <= endLine.number; n++) {
      const line = view.state.doc.line(n);
      const ranges: { from: number; to: number; deco: Decoration; atomic: boolean }[] = [];

      if (highlight) {
        for (const variable of parseTemplate(line.text, delimiters)) {
          const invalid = validate && hasData && !getValueAtPath(data, variable.path).found;
          ranges.push({
            from: variable.from,
            to: variable.to,
            atomic: false,
            deco: invalid
              ? Decoration.mark({
                  class: 'tam-var tam-var-invalid',
                  attributes: { title: `Unknown variable: ${variable.path}` },
                })
              : varMark,
          });
        }
      }
      for (const m of parseMentions(line.text, triggers)) {
        const item = lookupItem(mentions, m.id);
        ranges.push({
          from: m.from,
          to: m.to,
          atomic: true,
          deco: Decoration.replace({ widget: new MentionWidget(m.raw, m.trigger + m.label, item?.avatar) }),
        });
      }

      ranges.sort((a, b) => a.from - b.from);
      let last = -1;
      for (const r of ranges) {
        if (r.from < last) continue; // overlapping; keep the first
        builder.add(line.from + r.from, line.from + r.to, r.deco);
        if (r.atomic) atoms.add(line.from + r.from, line.from + r.to, r.deco);
        last = r.to;
      }
    }
  }
  return { decorations: builder.finish(), atoms: atoms.finish() };
}

/** Marks variables as chips, and unknown ones with a wavy underline. */
export const templateHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    atoms: DecorationSet;
    constructor(view: EditorView) {
      ({ decorations: this.decorations, atoms: this.atoms } = buildDecorations(view));
    }
    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.viewportChanged ||
        update.state.facet(templateConfig) !== update.startState.facet(templateConfig)
      ) {
        ({ decorations: this.decorations, atoms: this.atoms } = buildDecorations(update.view));
      }
    }
  },
  { decorations: (v) => v.decorations }
);

/** Replaces typed or pasted newlines with spaces. Line count stays at one. */
export const singleLine = (): Extension =>
  EditorState.transactionFilter.of((tr) => {
    if (!tr.docChanged || tr.newDoc.lines === 1) return tr;
    const changes: { from: number; to: number; insert: string }[] = [];
    tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
      changes.push({ from: fromA, to: toA, insert: inserted.toString().replace(/\r?\n/g, ' ') });
    });
    // `\r\n` → ' ' shortens the text, so clamp the selection to the new length
    const length =
      tr.startState.doc.length +
      changes.reduce((n, c) => n + c.insert.length - (c.to - c.from), 0);
    const head = Math.min(tr.newSelection.main.head, length);
    return {
      changes,
      selection: { anchor: head },
      effects: tr.effects,
      scrollIntoView: tr.scrollIntoView,
      userEvent: 'input',
    };
  });

/**
 * Everything needed for {{variable}} autocompletion in any CodeMirror 6 editor.
 * @example new EditorView({ extensions: [templateVariables({ data })] })
 */
export const templateVariables = (config: Partial<TemplateConfig> = {}): Extension => [
  templateConfig.of(config),
  autocompletion({
    override: [templateCompletionSource, mentionCompletionSource],
    icons: false,
    activateOnTyping: true,
    closeOnBlur: true,
    optionClass: (c) =>
      c.type === 'tam-status' ? 'tam-option tam-status' : c.type === 'tam-person' ? 'tam-option tam-person' : 'tam-option',
    addToOptions: [{ render: renderAvatar, position: 20 }],
  }),
  templateHighlighter,
  // Mention chips behave as one character: the cursor skips them, Backspace removes them whole
  EditorView.atomicRanges.of((view) => view.plugin(templateHighlighter)?.atoms ?? RangeSet.empty),
];
