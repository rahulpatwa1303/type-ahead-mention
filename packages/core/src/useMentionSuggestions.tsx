// useMentionSuggestions.tsx
// Variable autocomplete for a plain <input> or <textarea>, for when you
// don't want CodeMirror.

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
import { SuggestionPopper } from './SuggestionPopper';
import { injectStyles } from './styles';
import {
  DEFAULT_DELIMITERS,
  filterSuggestions,
  getCompletionMatch,
  type CompletionMatch,
  type Delimiters,
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
}

interface OpenState {
  match: CompletionMatch;
  items: SuggestionItem[];
  position: { top: number; left: number };
}

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
}: UseMentionSuggestionsOptions) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled ?? internal;
  const [open, setOpen] = useState<OpenState | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<Field | null>(null);
  const pendingCursor = useRef<number | null>(null);
  const listId = `tam-${useId().replace(/:/g, '')}`;

  useEffect(() => injectStyles(), []);

  const setValue = useCallback(
    (next: string) => {
      if (controlled === undefined) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange]
  );

  const refresh = useCallback(
    (el: Field) => {
      const cursor = el.selectionStart;
      if (cursor === null || cursor !== el.selectionEnd) return setOpen(null);
      const match = getCompletionMatch(el.value, cursor, data, delimiters);
      const items = match ? filterSuggestions(match.items, match.query) : [];
      if (!match || items.length === 0) return setOpen(null);
      const caret = getCaretRect(el, match.from);
      setOpen({ match, items, position: { top: caret.top + caret.height + 4, left: caret.left } });
      setActiveIndex(0);
    },
    [data, delimiters]
  );

  // The list is position: fixed, so follow the caret when anything scrolls or resizes
  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => {
      const el = inputRef.current;
      if (!el) return;
      setOpen((current) => {
        if (!current) return current;
        const caret = getCaretRect(el, current.match.from);
        return { ...current, position: { top: caret.top + caret.height + 4, left: caret.left } };
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
      refresh(el);
    }
  }, [value, refresh]);

  const select = useCallback(
    (item: SuggestionItem) => {
      if (!open) return;
      const { match } = open;
      const insert = item.key + (item.isBranch ? '.' : match.hasClose ? '' : delimiters.close);
      const next = value.slice(0, match.from) + insert + value.slice(match.to);
      pendingCursor.current =
        match.from + item.key.length + (item.isBranch ? 1 : delimiters.close.length);
      setOpen(null);
      setValue(next);
      inputRef.current?.focus();
    },
    [open, value, delimiters, setValue]
  );

  const close = useCallback(() => setOpen(null), []);

  const onKeyDown = (e: KeyboardEvent<Field>) => {
    if (!open) return;
    const count = open.items.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % count);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + count) % count);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      select(open.items[activeIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
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
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) refresh(e.currentTarget);
    },
    onClick: (e: React.MouseEvent<T>) => refresh(e.currentTarget),
    onBlur: close,
    role: 'combobox' as const,
    'aria-autocomplete': 'list' as const,
    'aria-expanded': open !== null,
    'aria-controls': listId,
    'aria-activedescendant': open ? `${listId}-${activeIndex}` : undefined,
  });

  return {
    value,
    setValue,
    getInputProps,
    /** The current suggestions, or an empty array when closed */
    suggestions: open?.items ?? [],
    activeIndex,
    isOpen: open !== null,
    select,
    close,
    /** Render this next to the input */
    SuggestionPopper: (
      <SuggestionPopper
        id={listId}
        items={open?.items ?? []}
        activeIndex={activeIndex}
        onSelect={select}
        position={open?.position ?? null}
        showValues={showValues}
      />
    ),
  };
}
