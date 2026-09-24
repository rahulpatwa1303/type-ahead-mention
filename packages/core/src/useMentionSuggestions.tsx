// useMentionSuggestions.tsx
// Variable and @mention autocomplete for a plain <input> or <textarea>.
// No CodeMirror.

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { getCaretRect } from './caret';
import { searchMentions, toSources, type MentionSource } from './mentions';
import { SuggestionPopper, type PopupOption } from './SuggestionPopper';
import { injectStyles } from './styles';
import {
  DEFAULT_DELIMITERS,
  filterSuggestions,
  formatMention,
  getCompletionMatch,
  getMentionMatch,
  parseMentions,
  previewValue,
  type CompletionMatch,
  type Delimiters,
  type MentionItem,
  type SuggestionItem,
  type SuggestionNode,
} from './template';

type Field = HTMLInputElement | HTMLTextAreaElement;

export interface UseMentionSuggestionsOptions {
  /** Data whose keys are suggested */
  data: SuggestionNode;
  /** Controlled value. Omit it to let the hook manage the value. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  delimiters?: Delimiters;
  showValues?: boolean;
  /** Suggest people after `@`, stored as `@[Label](id)` */
  mentions?: MentionSource | MentionSource[];
  colorScheme?: 'light' | 'dark' | 'auto';
}

type OpenState = { position: { top: number; left: number } } & (
  | { kind: 'variable'; match: CompletionMatch; items: SuggestionItem[] }
  | { kind: 'mention'; trigger: string; from: number; to: number; items: MentionItem[] | null }
);

const optionsFor = (open: OpenState | null, showValues: boolean): PopupOption[] => {
  if (!open) return [];
  if (open.kind === 'variable') {
    return open.items.map((item) => ({
      id: item.path,
      label: item.key,
      detail: showValues ? previewValue(item.value) : undefined,
      branch: item.isBranch,
    }));
  }
  if (open.items === null) return [{ id: 'status', label: 'Searching…', status: true }];
  if (open.items.length === 0) return [{ id: 'status', label: 'No matches', status: true }];
  return open.items.map((item) => ({
    id: item.id,
    label: item.label,
    detail: item.description,
    avatar: item.avatar,
    person: true,
  }));
};

/**
 * @example
 * const { getInputProps, SuggestionPopper } = useMentionSuggestions({ data });
 * return <><textarea {...getInputProps()} />{SuggestionPopper}</>;
 */
export function useMentionSuggestions(options: UseMentionSuggestionsOptions): ReturnType<typeof useImpl>;
/** @deprecated Pass an options object: `useMentionSuggestions({ defaultValue, data })` */
export function useMentionSuggestions(
  initialValue: string,
  data: SuggestionNode
): ReturnType<typeof useImpl>;
export function useMentionSuggestions(
  a: UseMentionSuggestionsOptions | string,
  b?: SuggestionNode
) {
  return useImpl(typeof a === 'string' ? { defaultValue: a, data: b ?? {} } : a);
}

function useImpl({
  data,
  value: controlled,
  defaultValue = '',
  onChange,
  delimiters = DEFAULT_DELIMITERS,
  showValues = true,
  mentions,
  colorScheme = 'light',
}: UseMentionSuggestionsOptions) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled ?? internal;
  const [open, setOpen] = useState<OpenState | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<Field | null>(null);
  const pendingCursor = useRef<number | null>(null);
  const listId = `tam-${useId().replace(/:/g, '')}`;
  const sources = toSources(mentions);
  const triggers = sources.map((s) => s.trigger ?? '@');

  useEffect(() => injectStyles(), []);

  const setValue = useCallback(
    (next: string) => {
      if (controlled === undefined) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange]
  );

  const positionAt = (el: Field, offset: number) => {
    const caret = getCaretRect(el, offset);
    return { top: caret.top + caret.height + 4, left: caret.left };
  };

  const refreshRef = useRef<(el: Field) => void>(() => {});
  const refresh = (el: Field) => {
    const cursor = el.selectionStart;
    if (cursor === null || cursor !== el.selectionEnd) return setOpen(null);

    const match = getCompletionMatch(el.value, cursor, data, delimiters);
    if (match) {
      const items = filterSuggestions(match.items, match.query);
      if (items.length === 0) return setOpen(null);
      setOpen({ kind: 'variable', match, items, position: positionAt(el, match.from) });
      setActiveIndex(0);
      return;
    }

    for (const source of sources) {
      const trigger = source.trigger ?? '@';
      const m = getMentionMatch(el.value, cursor, trigger);
      if (!m) continue;
      const items = searchMentions(source, m.query, () => {
        // Results arrived; show them if the field still has focus
        if (inputRef.current && inputRef.current.ownerDocument.activeElement === inputRef.current) {
          refreshRef.current(inputRef.current);
        }
      });
      setOpen((prev) => ({
        kind: 'mention',
        trigger,
        from: m.from,
        to: m.to,
        items,
        position: prev?.kind === 'mention' && prev.from === m.from ? prev.position : positionAt(el, m.from),
      }));
      setActiveIndex(0);
      return;
    }
    setOpen(null);
  };
  refreshRef.current = refresh;

  // The list is position: fixed, so follow the caret when anything scrolls or resizes
  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => {
      const el = inputRef.current;
      if (!el) return;
      setOpen((current) => {
        if (!current) return current;
        const at = current.kind === 'variable' ? current.match.from : current.from;
        return { ...current, position: positionAt(el, at) };
      });
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [isOpen]);

  // Put the cursor where a selection wanted it, then reopen for nested keys
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (el && pendingCursor.current !== null) {
      el.setSelectionRange(pendingCursor.current, pendingCursor.current);
      pendingCursor.current = null;
      refreshRef.current(el);
    }
  }, [value]);

  const replace = (from: number, to: number, insert: string, cursor: number) => {
    pendingCursor.current = cursor;
    setOpen(null);
    setValue(value.slice(0, from) + insert + value.slice(to));
    inputRef.current?.focus();
  };

  const select = (index: number) => {
    if (!open) return;
    if (open.kind === 'variable') {
      const item = open.items[index];
      if (!item) return;
      const { match } = open;
      const insert = item.key + (item.isBranch ? '.' : match.hasClose ? '' : delimiters.close);
      replace(
        match.from,
        match.to,
        insert,
        match.from + item.key.length + (item.isBranch ? 1 : delimiters.close.length)
      );
    } else {
      const item = open.items?.[index];
      if (!item) return;
      const insert = formatMention(item, open.trigger) + ' ';
      replace(open.from, open.to, insert, open.from + insert.length);
    }
  };

  const close = useCallback(() => setOpen(null), []);

  const options = optionsFor(open, showValues);
  const selectable = options.length > 0 && !options[0].status;

  // Mentions behave as one unit: Backspace/Delete remove them whole
  const deleteMention = (el: Field, key: 'Backspace' | 'Delete') => {
    if (triggers.length === 0) return false;
    const { selectionStart: start, selectionEnd: end } = el;
    if (start === null || start !== end) return false;
    const hit = parseMentions(el.value, triggers).find((m) =>
      key === 'Backspace' ? start > m.from && start <= m.to : start >= m.from && start < m.to
    );
    if (!hit) return false;
    replace(hit.from, hit.to, '', hit.from);
    return true;
  };

  // A caret placed inside a mention jumps to its nearest edge
  const snapOutOfMention = (el: Field) => {
    if (triggers.length === 0) return;
    const { selectionStart: start, selectionEnd: end } = el;
    if (start === null || start !== end) return;
    const hit = parseMentions(el.value, triggers).find((m) => start > m.from && start < m.to);
    if (!hit) return;
    const edge = start - hit.from < hit.to - start ? hit.from : hit.to;
    el.setSelectionRange(edge, edge);
  };

  const onKeyDown = (e: KeyboardEvent<Field>) => {
    if (open && options.length > 0) {
      if (e.key === 'ArrowDown' && selectable) {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
        return;
      }
      if (e.key === 'ArrowUp' && selectable) {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        if (selectable) {
          e.preventDefault();
          select(activeIndex);
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          return;
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
    }
    if ((e.key === 'Backspace' || e.key === 'Delete') && deleteMention(e.currentTarget, e.key)) {
      e.preventDefault();
    }
  };

  const getInputProps = <T extends Field = Field>() => ({
    value,
    ref: (el: T | null) => {
      inputRef.current = el;
    },
    onChange: (e: React.ChangeEvent<T>) => {
      setValue(e.target.value);
      refresh(e.target);
    },
    onKeyDown,
    onKeyUp: (e: KeyboardEvent<T>) => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        snapOutOfMention(e.currentTarget);
        refresh(e.currentTarget);
      }
    },
    onClick: (e: React.MouseEvent<T>) => {
      snapOutOfMention(e.currentTarget);
      refresh(e.currentTarget);
    },
    onBlur: close,
    role: 'combobox' as const,
    'aria-autocomplete': 'list' as const,
    'aria-expanded': open !== null,
    'aria-controls': listId,
    'aria-activedescendant': open && selectable ? `${listId}-${activeIndex}` : undefined,
  });

  return {
    value,
    setValue,
    getInputProps,
    /** The rows currently shown, or an empty array when closed */
    options,
    /** Variable suggestions currently shown (empty for mentions) */
    suggestions: open?.kind === 'variable' ? open.items : [],
    activeIndex,
    isOpen: open !== null,
    select,
    close,
    /** Render this next to the input */
    SuggestionPopper: (
      <SuggestionPopper
        id={listId}
        options={options}
        activeIndex={activeIndex}
        onSelect={select}
        position={open?.position ?? null}
        colorScheme={colorScheme}
      />
    ),
  };
}
