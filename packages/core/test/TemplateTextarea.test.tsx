import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { TemplateTextarea } from '../src/TemplateTextarea';
import type { MentionSource } from '../src/mentions';
import { data } from './fixtures';

const people = [
  { id: 'u_1', label: 'Ada Lovelace', description: 'Billing' },
  { id: 'u_2', label: 'Alan Turing', description: 'Security' },
];

function Field(props: { initial: string; multiline?: boolean; mentions?: MentionSource; onSubmit?: (v: string) => void }) {
  const [value, setValue] = useState(props.initial);
  return (
    <>
      <TemplateTextarea
        value={value}
        onChange={setValue}
        suggestions={data}
        multiline={props.multiline}
        mentions={props.mentions}
        onSubmit={props.onSubmit}
        aria-label="field"
      />
      <output data-testid="value">{value}</output>
    </>
  );
}

const field = () => screen.getByLabelText('field') as HTMLTextAreaElement;
const type = (value: string) => fireEvent.change(field(), { target: { value } });

describe('<TemplateTextarea />', () => {
  it('draws the same text in the backdrop, with variables and typos marked', () => {
    const { container } = render(<Field initial="Hi {{user.name}} {{user.nmae}}" />);
    const backdrop = container.querySelector('.tam-backdrop')!;
    expect(backdrop.textContent).toBe('Hi {{user.name}} {{user.nmae}}');
    const vars = backdrop.querySelectorAll('.tam-var');
    expect(vars.length).toBe(2);
    expect(vars[1].classList.contains('tam-var-invalid')).toBe(true);
  });

  it('completes variables', () => {
    render(<Field initial="" />);
    type('{{user.na');
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(field().value).toBe('{{user.name}}');
  });

  it('single-line: Enter submits and pasted newlines become spaces', () => {
    const onSubmit = vi.fn();
    render(<Field initial="a" onSubmit={onSubmit} />);
    type('a\nb');
    expect(field().value).toBe('a b');
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('a b');
  });

  it('multiline keeps newlines', () => {
    render(<Field initial="" multiline />);
    type('a\nb');
    expect(field().value).toBe('a\nb');
  });

  it('mentions: Searching…, then results, then the stored form and a chip; Backspace removes it whole', async () => {
    const search = vi.fn(async (q: string) => people.filter((p) => p.label.toLowerCase().startsWith(q.toLowerCase())));
    const source: MentionSource = { search, debounce: 5 };
    const { container } = render(<Field initial="" mentions={source} />);

    field().focus();
    type('Ask @a');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Searching…']);
    // Results arrive and replace the status row
    await waitFor(() =>
      expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
        'AAda LovelaceBilling',
        'AAlan TuringSecurity',
      ])
    );
    expect(search).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(field(), { key: 'ArrowDown' });
    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(field().value).toBe('Ask @[Alan Turing](u_2) ');
    expect(container.querySelector('.tam-mention-raw')?.textContent).toBe('@[Alan Turing](u_2)');

    // Backspace just after the mention (before the space is removed first)
    field().setSelectionRange(23, 23);
    fireEvent.keyDown(field(), { key: 'Backspace' });
    expect(screen.getByTestId('value').textContent).toBe('Ask  ');
  });

  it('shows No matches', async () => {
    render(<Field initial="" mentions={{ search: () => [], debounce: 0 }} />);
    field().focus();
    type('@zz');
    await waitFor(() => expect(screen.getByRole('option').textContent).toBe('No matches'));
    expect(screen.getByRole('option').getAttribute('aria-disabled')).toBe('true');
  });
});
