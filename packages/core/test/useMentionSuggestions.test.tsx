import { act, fireEvent, render, screen } from '@testing-library/react';
import { useMentionSuggestions } from '../src/useMentionSuggestions';
import { useMentionResolver } from '../src/useMentionResolver';
import { data } from './fixtures';

function Field({ initial = '' }: { initial?: string }) {
  const { getInputProps, SuggestionPopper, value } = useMentionSuggestions({ data, defaultValue: initial });
  const resolved = useMentionResolver(value, data);
  return (
    <>
      <textarea data-testid="field" {...getInputProps<HTMLTextAreaElement>()} />
      {SuggestionPopper}
      <output data-testid="resolved">{resolved}</output>
    </>
  );
}

// fireEvent.change sets the value through React's tracker; jsdom puts the cursor at the end
const type = (el: HTMLTextAreaElement, value: string) => {
  fireEvent.change(el, { target: { value } });
};

describe('useMentionSuggestions', () => {
  it('opens a filtered listbox with value previews', () => {
    render(<Field />);
    const field = screen.getByTestId('field') as HTMLTextAreaElement;
    type(field, 'Hi {{user.na');
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual(['name"Ada Lovelace"']);
    expect(field.getAttribute('aria-expanded')).toBe('true');
    expect(field.getAttribute('aria-activedescendant')).toBe(options[0].id);
  });

  it('keeps the parent path when selecting (regression)', () => {
    render(<Field />);
    const field = screen.getByTestId('field') as HTMLTextAreaElement;
    type(field, 'Hi {{user.na');
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(field.value).toBe('Hi {{user.name}}');
    expect(screen.getByTestId('resolved').textContent).toBe('Hi Ada Lovelace');
  });

  it('drills into objects and navigates with arrows', () => {
    render(<Field />);
    const field = screen.getByTestId('field') as HTMLTextAreaElement;
    type(field, '{{');
    fireEvent.keyDown(field, { key: 'Enter' }); // user
    expect(field.value).toBe('{{user.');
    // Reopened on the next level
    expect(screen.getAllByRole('option')[0].textContent).toContain('name');
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    fireEvent.keyDown(field, { key: 'Tab' }); // email
    expect(field.value).toBe('{{user.email}}');
  });

  it('repositions the list when the page scrolls', () => {
    render(<Field />);
    const field = screen.getByTestId('field') as HTMLTextAreaElement;
    type(field, '{{us');
    const list = screen.getByRole('listbox');
    const before = list.style.top;
    field.getBoundingClientRect = () =>
      ({ top: -200, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: -200 }) as DOMRect;
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.getByRole('listbox').style.top).not.toBe(before);
  });

  it('closes on Escape', () => {
    render(<Field />);
    const field = screen.getByTestId('field') as HTMLTextAreaElement;
    type(field, '{{us');
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('gives each instance its own list', () => {
    render(
      <>
        <Field />
        <Field />
      </>
    );
    const [a, b] = screen.getAllByTestId('field') as HTMLTextAreaElement[];
    expect(a.getAttribute('aria-controls')).not.toBe(b.getAttribute('aria-controls'));
  });

  it('accepts the v2 positional signature', () => {
    function Legacy() {
      const { value } = useMentionSuggestions('hello', data);
      return <span>{value}</span>;
    }
    render(<Legacy />);
    expect(screen.getByText('hello')).toBeTruthy();
  });
});
