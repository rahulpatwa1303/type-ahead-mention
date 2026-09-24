import { act, render } from '@testing-library/react';
import { createRef, useState } from 'react';
import { MentionInput, type MentionInputHandle } from '../src/MentionInput';
import { STYLE_ID } from '../src/styles';
import { data } from './fixtures';

function Controlled(props: { initial: string; onValue?: (v: string) => void; handle?: React.Ref<MentionInputHandle> }) {
  const [value, setValue] = useState(props.initial);
  return (
    <MentionInput
      ref={props.handle}
      value={value}
      onChange={(v) => {
        setValue(v);
        props.onValue?.(v);
      }}
      suggestions={data}
      placeholder="Type {{"
      aria-label="Template"
    />
  );
}

describe('<MentionInput />', () => {
  it('renders the value, a visible placeholder, and injects styles once', () => {
    const { container, rerender } = render(<Controlled initial="" />);
    expect(container.querySelector('.cm-placeholder')?.textContent).toBe('Type {{');
    expect(container.querySelector('.cm-content')?.getAttribute('aria-label')).toBe('Template');
    rerender(<Controlled initial="x" />);
    expect(document.querySelectorAll(`#${STYLE_ID}`).length).toBe(1);
  });

  it('highlights valid and unknown variables', () => {
    const { container } = render(<Controlled initial="{{user.name}} {{user.nmae}}" />);
    const vars = container.querySelectorAll('.tam-var');
    expect(vars.length).toBe(2);
    expect(vars[1].classList.contains('tam-var-invalid')).toBe(true);
    expect(vars[1].getAttribute('title')).toBe('Unknown variable: user.nmae');
  });

  it('calls onChange for user edits and supports insertVariable', () => {
    const handle = createRef<MentionInputHandle>();
    const onValue = vi.fn();
    render(<Controlled initial="Hi " onValue={onValue} handle={handle} />);
    act(() => {
      const view = handle.current!.view!;
      view.dispatch({ selection: { anchor: 3 } });
      handle.current!.insertVariable('user.name');
    });
    expect(onValue).toHaveBeenLastCalledWith('Hi {{user.name}}');
  });

  it('applies outside value changes without echoing onChange', () => {
    const onChange = vi.fn();
    const handle = createRef<MentionInputHandle>();
    const { rerender } = render(
      <MentionInput ref={handle} value="a" onChange={onChange} suggestions={data} />
    );
    rerender(<MentionInput ref={handle} value="b {{user.name}}" onChange={onChange} suggestions={data} />);
    expect(handle.current!.view!.state.doc.toString()).toBe('b {{user.name}}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps single-line mode on one line', () => {
    const handle = createRef<MentionInputHandle>();
    render(<Controlled initial="" handle={handle} />);
    act(() => {
      handle.current!.view!.dispatch({ changes: { from: 0, insert: 'a\nb' } });
    });
    expect(handle.current!.view!.state.doc.toString()).toBe('a b');
  });

  it('respects disabled', () => {
    const { container } = render(
      <MentionInput value="" onChange={() => {}} suggestions={data} disabled />
    );
    expect(container.querySelector('.cm-content')?.getAttribute('contenteditable')).toBe('false');
    expect(container.querySelector('.tam-root')?.getAttribute('data-disabled')).toBe('true');
  });
});
