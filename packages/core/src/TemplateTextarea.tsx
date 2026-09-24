// TemplateTextarea.tsx
// The light field: a real <textarea> over a backdrop that draws the highlights.
// The browser keeps handling input, selection, IME and undo.

import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { lookupMention, toSources, type MentionSource } from './mentions';
import { useMentionSuggestions } from './useMentionSuggestions';
import {
  DEFAULT_DELIMITERS,
  getValueAtPath,
  parseMentions,
  parseTemplate,
  type Delimiters,
  type SuggestionNode,
} from './template';

export interface TemplateTextareaProps {
  value: string;
  onChange: (value: string) => void;
  /** Data whose keys are suggested. Nested objects and arrays are supported. */
  suggestions: SuggestionNode;
  /** Suggest people after `@`, stored as `@[Label](id)` */
  mentions?: MentionSource | MentionSource[];
  placeholder?: string;
  /** @default false */
  multiline?: boolean;
  /** Minimum visible lines in multiline mode. @default 3 */
  rows?: number;
  delimiters?: Delimiters;
  /** @default true */
  showValues?: boolean;
  /** @default true */
  highlight?: boolean;
  /** @default true */
  validate?: boolean;
  /** @default 'light' */
  colorScheme?: 'light' | 'dark' | 'auto';
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  onSubmit?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  style?: React.CSSProperties;
  className?: string;
}

type Segment = { from: number; to: number; kind: 'var' | 'invalid' | 'mention'; label?: string; trigger?: string; title?: string };

export const TemplateTextarea = /* @__PURE__ */ forwardRef<HTMLTextAreaElement, TemplateTextareaProps>(
  function TemplateTextarea(
    {
      value,
      onChange,
      suggestions,
      mentions,
      placeholder,
      multiline = false,
      rows = 3,
      delimiters = DEFAULT_DELIMITERS,
      showValues = true,
      highlight = true,
      validate = true,
      colorScheme = 'light',
      disabled = false,
      readOnly = false,
      autoFocus = false,
      onSubmit,
      onFocus,
      onBlur,
      id,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      style,
      className,
    },
    ref
  ) {
    const textarea = useRef<HTMLTextAreaElement | null>(null);
    const backdrop = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => textarea.current!, []);

    const handleChange = (next: string) => onChange(multiline ? next : next.replace(/\r?\n/g, ' '));

    const { getInputProps, SuggestionPopper, isOpen } = useMentionSuggestions({
      data: suggestions,
      value,
      onChange: handleChange,
      delimiters,
      showValues,
      mentions,
      colorScheme,
    });
    const input = getInputProps<HTMLTextAreaElement>();
    const sources = toSources(mentions);

    const segments = useMemo(() => {
      const list: Segment[] = [];
      if (highlight) {
        const hasData = Object.keys(suggestions).length > 0;
        for (const v of parseTemplate(value, delimiters)) {
          const invalid = validate && hasData && !getValueAtPath(suggestions, v.path).found;
          list.push({ from: v.from, to: v.to, kind: invalid ? 'invalid' : 'var', title: invalid ? `Unknown variable: ${v.path}` : undefined });
        }
      }
      const triggers = sources.map((s) => s.trigger ?? '@');
      for (const m of parseMentions(value, triggers)) {
        list.push({ from: m.from, to: m.to, kind: 'mention', label: m.label, trigger: m.trigger, title: lookupMention(sources, m.id)?.description });
      }
      list.sort((a, b) => a.from - b.from);
      return list;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, suggestions, delimiters.open, delimiters.close, highlight, validate, mentions]);

    // Draw the same characters as the textarea, so every glyph lines up
    const rendered: React.ReactNode[] = [];
    let last = 0;
    for (const s of segments) {
      if (s.from < last) continue;
      rendered.push(value.slice(last, s.from));
      const raw = value.slice(s.from, s.to);
      if (s.kind === 'mention') {
        const labelStart = s.trigger!.length + 1;
        rendered.push(
          <span key={s.from} className="tam-mention-raw">
            {s.trigger}
            <span className="tam-dim">[</span>
            {raw.slice(labelStart, labelStart + s.label!.length)}
            <span className="tam-dim">{raw.slice(labelStart + s.label!.length)}</span>
          </span>
        );
      } else {
        rendered.push(
          <span key={s.from} className={s.kind === 'invalid' ? 'tam-var tam-var-invalid' : 'tam-var'}>
            {raw}
          </span>
        );
      }
      last = s.to;
    }
    rendered.push(value.slice(last));
    // A trailing newline needs something after it to take up a line
    if (value.endsWith('\n') || value === '') rendered.push('​');

    const syncScroll = () => {
      if (backdrop.current && textarea.current) {
        backdrop.current.scrollTop = textarea.current.scrollTop;
        backdrop.current.scrollLeft = textarea.current.scrollLeft;
      }
    };
    useEffect(syncScroll, [value]);

    useEffect(() => {
      if (autoFocus) textarea.current?.focus();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        className={className ? `tam-root tam-area ${className}` : 'tam-root tam-area'}
        style={{ ...style, ['--tam-rows' as string]: multiline ? rows : 1 }}
        data-scheme={colorScheme}
        data-multiline={String(multiline)}
        data-disabled={String(disabled)}
      >
        <div ref={backdrop} className="tam-backdrop" aria-hidden="true">
          {rendered}
        </div>
        <textarea
          {...input}
          ref={(el) => {
            textarea.current = el;
            input.ref(el);
          }}
          className="tam-input"
          id={id}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-multiline={multiline}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={1}
          spellCheck={false}
          wrap={multiline ? 'soft' : 'off'}
          onScroll={syncScroll}
          onFocus={onFocus}
          onBlur={() => {
            input.onBlur();
            onBlur?.();
          }}
          onKeyDown={(e) => {
            input.onKeyDown(e);
            if (e.defaultPrevented || isOpen) return;
            const submitKey = multiline ? e.key === 'Enter' && (e.metaKey || e.ctrlKey) : e.key === 'Enter';
            if (submitKey) {
              e.preventDefault();
              onSubmit?.(value);
            }
          }}
        />
        {SuggestionPopper}
      </div>
    );
  }
);
