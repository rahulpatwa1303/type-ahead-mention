// codemirror.ts
// CodeMirror 6 extensions: variable completion, highlighting, single-line mode.

import {
  autocompletion,
  startCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete';
import { EditorState, Facet, RangeSetBuilder, type Extension } from '@codemirror/state';
import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view';
import {
  DEFAULT_DELIMITERS,
  getCompletionMatch,
  getValueAtPath,
  parseTemplate,
  previewValue,
  type Delimiters,
  type SuggestionItem,
  type SuggestionNode,
} from './template';

export interface TemplateConfig {
  data: SuggestionNode;
  delimiters: Delimiters;
  /** Show a value preview next to each suggestion */
  showValues: boolean;
  /** Mark variables in the text */
  highlight: boolean;
  /** Mark variables whose path isn't in `data` */
  validate: boolean;
}

const defaultConfig: TemplateConfig = {
  data: {},
  delimiters: DEFAULT_DELIMITERS,
  showValues: true,
  highlight: true,
  validate: true,
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

const varMark = Decoration.mark({ class: 'tam-var' });

function buildDecorations(view: EditorView): DecorationSet {
  const { data, delimiters, highlight, validate } = view.state.facet(templateConfig);
  const builder = new RangeSetBuilder<Decoration>();
  if (!highlight) return builder.finish();
  const hasData = Object.keys(data).length > 0;

  for (const { from, to } of view.visibleRanges) {
    const startLine = view.state.doc.lineAt(from);
    const endLine = view.state.doc.lineAt(to);
    for (let n = startLine.number; n <= endLine.number; n++) {
      const line = view.state.doc.line(n);
      for (const variable of parseTemplate(line.text, delimiters)) {
        const invalid = validate && hasData && !getValueAtPath(data, variable.path).found;
        builder.add(
          line.from + variable.from,
          line.from + variable.to,
          invalid
            ? Decoration.mark({
                class: 'tam-var tam-var-invalid',
                attributes: { title: `Unknown variable: ${variable.path}` },
              })
            : varMark
        );
      }
    }
  }
  return builder.finish();
}

/** Marks variables as chips, and unknown ones with a wavy underline. */
export const templateHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }
    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.viewportChanged ||
        update.state.facet(templateConfig) !== update.startState.facet(templateConfig)
      ) {
        this.decorations = buildDecorations(update.view);
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
    override: [templateCompletionSource],
    icons: false,
    activateOnTyping: true,
    closeOnBlur: true,
    optionClass: () => 'tam-option',
  }),
  templateHighlighter,
];
