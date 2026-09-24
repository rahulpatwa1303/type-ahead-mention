import { CompletionContext, type Completion } from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { singleLine, templateCompletionSource, templateConfig, templateVariables } from '../src/codemirror';
import { data } from './fixtures';

const complete = (doc: string) => {
  const pos = doc.indexOf('|');
  const state = EditorState.create({
    doc: doc.replace('|', ''),
    extensions: templateConfig.of({ data }),
  });
  return { state, result: templateCompletionSource(new CompletionContext(state, pos, false)) };
};

const applyOption = (doc: string, label: string) => {
  const pos = doc.indexOf('|');
  const view = new EditorView({
    state: EditorState.create({
      doc: doc.replace('|', ''),
      selection: { anchor: pos },
      extensions: templateVariables({ data }),
    }),
  });
  const result = templateCompletionSource(new CompletionContext(view.state, pos, false))!;
  const option = result.options.find((o) => o.label === label)!;
  (option.apply as Exclude<Completion['apply'], string | undefined>)(view, option, result.from, result.to ?? pos);
  const out = { doc: view.state.doc.toString(), cursor: view.state.selection.main.head };
  view.destroy();
  return out;
};

describe('templateCompletionSource', () => {
  it('uses document positions on later lines (multiline regression)', () => {
    const { state, result } = complete('first line\nsecond {{us|');
    expect(result).not.toBeNull();
    expect(state.sliceDoc(result!.from - 2, result!.from)).toBe('{{');
    expect(result!.from).toBe('first line\nsecond {{'.length);
  });

  it('adds value previews and keeps data order', () => {
    const { result } = complete('{{user.|');
    expect(result!.options.map((o) => [o.label, o.detail])).toEqual([
      ['name', '"Ada Lovelace"'],
      ['email', '"ada@example.com"'],
      ['address', '{2 keys}'],
      ['roles', '[2 items]'],
    ]);
    const boosts = result!.options.map((o) => o.boost!);
    expect([...boosts].sort((a, b) => b - a)).toEqual(boosts);
  });

  it('returns null outside a variable', () => {
    expect(complete('plain |').result).toBeNull();
  });
});

describe('applying a suggestion', () => {
  it('closes the variable for a leaf', () => {
    expect(applyOption('Hi {{user.na|', 'name')).toEqual({ doc: 'Hi {{user.name}}', cursor: 16 });
  });

  it('does not double the closing delimiter', () => {
    expect(applyOption('{{user.na|}} ok', 'name')).toEqual({ doc: '{{user.name}} ok', cursor: 13 });
  });

  it('replaces the rest of the word when the cursor is mid-word', () => {
    expect(applyOption('{{user.em|xyz}}', 'email').doc).toBe('{{user.email}}');
  });

  it('adds a dot for objects and arrays', () => {
    expect(applyOption('{{us|', 'user')).toEqual({ doc: '{{user.', cursor: 7 });
  });

  it('works on the third line of a document', () => {
    expect(applyOption('a\nb\nc {{order.to|', 'total').doc).toBe('a\nb\nc {{order.total}}');
  });
});

describe('singleLine', () => {
  it('turns pasted newlines into spaces', () => {
    const state = EditorState.create({ doc: 'ab', extensions: singleLine() });
    const next = state.update({ changes: { from: 1, insert: 'x\ny\r\nz' } }).state;
    expect(next.doc.toString()).toBe('ax y zb');
    expect(next.doc.lines).toBe(1);
  });
});
