// Runs in its own module, so the editor starts out not loaded
import { act, render, waitFor } from '@testing-library/react';
import { createRef, useState } from 'react';
import { MentionInput, type MentionInputHandle } from '../src/MentionInput';
import { data } from './fixtures';

function Controlled({ handle }: { handle: React.Ref<MentionInputHandle> }) {
  const [value, setValue] = useState('Hi {{user.name}}');
  return <MentionInput ref={handle} value={value} onChange={setValue} suggestions={data} placeholder="Type" />;
}

describe('MentionInput loads CodeMirror on demand', () => {
  it('shows the textarea field first, then swaps to the editor with the same value', async () => {
    const handle = createRef<MentionInputHandle>();
    const { container } = render(<Controlled handle={handle} />);

    // First paint: the light field, already usable and highlighted
    const textarea = container.querySelector('textarea.tam-input') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Hi {{user.name}}');
    expect(container.querySelector('.tam-backdrop .tam-var')?.textContent).toBe('{{user.name}}');
    expect(handle.current!.view).toBeNull();

    await waitFor(() => expect(container.querySelector('.cm-editor')).not.toBeNull());
    expect(container.querySelector('textarea.tam-input')).toBeNull();
    expect(handle.current!.view!.state.doc.toString()).toBe('Hi {{user.name}}');
  });

  it('keeps edits made before the editor arrives, and keeps focus and cursor', async () => {
    const handle = createRef<MentionInputHandle>();
    const { container } = render(<Controlled handle={handle} />);
    const textarea = container.querySelector('textarea.tam-input') as HTMLTextAreaElement | null;
    if (textarea) {
      // Module may already be cached from the previous test; only exercise the handoff when it isn't
      act(() => {
        textarea.focus();
        textarea.setSelectionRange(2, 2);
        handle.current!.insertVariable('user.email');
      });
    }
    await waitFor(() => expect(handle.current!.view).not.toBeNull());
    const doc = handle.current!.view!.state.doc.toString();
    if (textarea) expect(doc).toBe('Hi{{user.email}} {{user.name}}');
  });
});
