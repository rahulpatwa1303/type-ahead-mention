import { CompletionContext, type Completion } from '@codemirror/autocomplete';
import { EditorState, EditorSelection } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import { mentionCompletionSource, templateVariables, type MentionSource } from '../src/codemirror';
import { MentionInput, preloadEditor, type MentionInputHandle } from '../src/MentionInput';
import { formatMention, getMentionMatch, parseMentions, replaceMentions } from '../src/template';

const people = [
  { id: 'u_1', label: 'Ada Lovelace', description: 'ada@example.com', avatar: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' },
  { id: 'u_2', label: 'Grace Hopper', description: 'grace@example.com' },
];

describe('mention helpers', () => {
  it('formats and parses the stored form', () => {
    expect(formatMention(people[0])).toBe('@[Ada Lovelace](u_1)');
    expect(formatMention({ id: 'a b', label: 'x]y' }, '#')).toBe('#[xy](ab)');
    expect(parseMentions('Ask @[Ada Lovelace](u_1) and #[ops](c_9)', ['@', '#'])).toEqual([
      { trigger: '@', label: 'Ada Lovelace', id: 'u_1', raw: '@[Ada Lovelace](u_1)', from: 4, to: 24 },
      { trigger: '#', label: 'ops', id: 'c_9', raw: '#[ops](c_9)', from: 29, to: 40 },
    ]);
  });

  it('replaces mentions', () => {
    expect(replaceMentions('Ask @[Ada](u_1).')).toBe('Ask @Ada.');
    expect(replaceMentions('Ask @[Ada](u_1).', (m) => `<@${m.id}>`)).toBe('Ask <@u_1>.');
  });

  it('matches a mention being typed but not emails or stored mentions', () => {
    expect(getMentionMatch('Ask @ad', 7)).toEqual({ trigger: '@', from: 4, to: 7, query: 'ad' });
    expect(getMentionMatch('(@ad', 4)?.query).toBe('ad');
    expect(getMentionMatch('mail ada@example', 16)).toBeNull();
    expect(getMentionMatch('@[Ada](u_1)', 11)).toBeNull();
    expect(getMentionMatch('@ada lovelace', 13)).toBeNull();
    expect(getMentionMatch('Ask @Zoë', 8)?.query).toBe('Zoë');
  });
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function setup(doc: string, source: MentionSource) {
  const view = new EditorView({
    state: EditorState.create({
      doc,
      selection: EditorSelection.cursor(doc.length),
      extensions: templateVariables({ mentions: [source] }),
    }),
  });
  const query = () => mentionCompletionSource(new CompletionContext(view.state, view.state.doc.length, false));
  return { view, query };
}

describe('mentionCompletionSource', () => {
  it('shows Searching…, then cached async results, then applies the stored form', async () => {
    const search = vi.fn(async (q: string) => people.filter((p) => p.label.toLowerCase().includes(q.toLowerCase())));
    const { view, query } = setup('Ask @gr', { search, debounce: 5 });

    expect(query()!.options.map((o) => o.label)).toEqual(['Searching…']);
    await sleep(30);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search.mock.calls[0][0]).toBe('gr');

    const result = query()!;
    expect(result.filter).toBe(false);
    expect(result.options.map((o) => [o.label, o.detail])).toEqual([['Grace Hopper', 'grace@example.com']]);

    const option = result.options[0];
    (option.apply as Exclude<Completion['apply'], string | undefined>)(view, option, result.from, result.to!);
    expect(view.state.doc.toString()).toBe('Ask @[Grace Hopper](u_2) ');
    view.destroy();
  });

  it('shows No matches', async () => {
    const { view, query } = setup('@zz', { search: () => [], debounce: 0 });
    query();
    await sleep(10);
    expect(query()!.options[0].label).toBe('No matches');
    view.destroy();
  });

  it('debounces: only the last query is searched', async () => {
    const search = vi.fn((_query: string) => people);
    const source = { search, debounce: 15 };
    const { view, query } = setup('@a', source);
    query();
    view.dispatch({ changes: { from: 2, insert: 'd' }, selection: { anchor: 3 } });
    query();
    await sleep(40);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search.mock.calls[0][0]).toBe('ad');
    view.destroy();
  });
});

describe('mention chips', () => {
  beforeAll(() => preloadEditor());

  it('renders stored mentions as atomic chips with avatars', async () => {
    const source: MentionSource = { search: () => people, getItem: (id) => people.find((p) => p.id === id) };
    const handle = createRef<MentionInputHandle>();
    const { container } = render(
      <MentionInput
        ref={handle}
        value="Ask @[Ada Lovelace](u_1) now"
        onChange={() => {}}
        suggestions={{}}
        mentions={source}
      />
    );
    const chip = container.querySelector('.tam-mention')!;
    expect(chip.textContent).toBe('@Ada Lovelace');
    expect(chip.querySelector('img.tam-avatar')).not.toBeNull();

    // Cursor movement treats the chip as one unit
    const view = handle.current!.view!;
    const atomic = view.state.facet(EditorView.atomicRanges).map((f) => f(view));
    let found = false;
    for (const set of atomic) set.between(0, view.state.doc.length, (from, to) => {
      if (from === 4 && to === 24) found = true;
    });
    expect(found).toBe(true);
  });
});
