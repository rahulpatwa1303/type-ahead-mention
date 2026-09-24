import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  acceptCompletion,
  completionStatus,
  moveCompletionSelection,
} from '@codemirror/autocomplete';
import { Pause, Play, RotateCcw, StepForward, X } from 'lucide-react';
import {
  MentionInput,
  getValueAtPath,
  parseTemplate,
  type MentionInputHandle,
} from 'type-ahead-mention';
import { kinds, samples, type Step, type TemplateKind } from './data';

type Atom =
  | { kind: 'char'; ch: string; delay: number }
  | { kind: 'accept' }
  | { kind: 'down' }
  | { kind: 'wait'; ms: number }
  | { kind: 'record'; index: number };

/** Flattens a script into single actions, so pause and step land between keystrokes */
const flatten = (script: Step[]): Atom[] =>
  script.flatMap((step): Atom[] => {
    if ('type' in step) {
      const fast = step.type.startsWith('{{');
      return [...step.type].map((ch, i) => ({
        kind: 'char',
        ch,
        delay: fast ? 90 : 38 + ((i * 29) % 45),
      }));
    }
    if ('accept' in step) return [{ kind: 'accept' }];
    if ('down' in step) return Array.from({ length: step.down }, () => ({ kind: 'down' as const }));
    return [{ kind: 'wait', ms: step.wait }];
  });

type CrankState = 'playing' | 'paused' | 'done' | 'yours';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const display = (value: unknown) =>
  value === null || value === undefined
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value)
      : String(value);

export function Hero({ carbon }: { carbon: boolean }) {
  const [kind, setKind] = useState<TemplateKind>('prompt');
  const sample = samples[kind];
  const reduced = useMemo(prefersReducedMotion, []);
  const [template, setTemplate] = useState(reduced ? sample.template : sample.preset);
  const [recordIndex, setRecordIndex] = useState(0);
  const [changed, setChanged] = useState<Set<string>>(new Set());
  const [crank, setCrank] = useState<CrankState>(reduced ? 'done' : 'playing');
  const handle = useRef<MentionInputHandle>(null);

  const atoms = useMemo(
    () => [...flatten(samples.prompt.script), { kind: 'wait', ms: 1600 } as Atom, { kind: 'record', index: 1 } as Atom],
    []
  );
  const cursor = useRef(0);
  const timer = useRef<number>();

  const record = sample.records[recordIndex];

  const switchRecord = useCallback(
    (index: number) => {
      const before = sample.records[recordIndex].data;
      const after = sample.records[index].data;
      const diff = new Set<string>();
      for (const v of parseTemplate(template)) {
        if (display(getValueAtPath(before, v.path).value) !== display(getValueAtPath(after, v.path).value)) {
          diff.add(v.path);
        }
      }
      setChanged(diff);
      setRecordIndex(index);
    },
    [sample, recordIndex, template]
  );

  // Run one atom. Returns the delay before the next one.
  const runAtom = useCallback(
    (atom: Atom): number => {
      const view = handle.current?.view;
      if (!view) return 100;
      switch (atom.kind) {
        case 'char': {
          const pos = view.state.selection.main.head;
          view.dispatch({
            changes: { from: pos, insert: atom.ch },
            selection: { anchor: pos + 1 },
            userEvent: 'input.type',
          });
          return atom.delay;
        }
        case 'accept':
          if (completionStatus(view.state) !== 'active') return -120; // retry shortly
          acceptCompletion(view);
          return 260;
        case 'down':
          if (completionStatus(view.state) !== 'active') return -120;
          moveCompletionSelection(true)(view);
          return 260;
        case 'wait':
          return atom.ms;
        case 'record':
          switchRecord(atom.index);
          return 0;
      }
    },
    [switchRecord]
  );

  const runAtomRef = useRef(runAtom);
  runAtomRef.current = runAtom;

  const tick = useCallback(() => {
    if (cursor.current >= atoms.length) {
      setCrank('done');
      return;
    }
    const delay = runAtomRef.current(atoms[cursor.current]);
    if (delay >= 0) cursor.current += 1;
    timer.current = window.setTimeout(tick, Math.abs(delay));
  }, [atoms]);

  useEffect(() => {
    if (crank !== 'playing') return;
    // Put the caret at the end of the preset before typing
    const view = handle.current?.view;
    if (view && cursor.current === 0) view.dispatch({ selection: { anchor: view.state.doc.length } });
    timer.current = window.setTimeout(tick, 400);
    return () => window.clearTimeout(timer.current);
  }, [crank, tick]);

  const replay = () => {
    window.clearTimeout(timer.current);
    cursor.current = 0;
    setKind('prompt');
    setTemplate(samples.prompt.preset);
    setRecordIndex(0);
    setChanged(new Set());
    // Let the value reach the editor before typing
    window.setTimeout(() => setCrank('playing'), 30);
    setCrank('paused');
  };

  const step = () => {
    window.clearTimeout(timer.current);
    if (crank === 'playing') setCrank('paused');
    // Skip waits so each press shows something happening
    while (cursor.current < atoms.length) {
      const atom = atoms[cursor.current];
      const delay = runAtom(atom);
      if (delay < 0) break;
      cursor.current += 1;
      if (atom.kind !== 'wait') break;
    }
    if (cursor.current >= atoms.length) setCrank('done');
  };

  const takeOver = () => {
    if (crank === 'playing' || crank === 'paused') {
      window.clearTimeout(timer.current);
      setCrank('yours');
    }
  };

  const chooseKind = (next: TemplateKind) => {
    window.clearTimeout(timer.current);
    setCrank(next === 'prompt' && cursor.current >= atoms.length ? 'done' : 'yours');
    setKind(next);
    setTemplate(samples[next].template);
    setRecordIndex(0);
    setChanged(new Set());
  };

  const onEdit = (value: string) => {
    setTemplate(value);
    if (changed.size) setChanged(new Set());
  };

  // Merged output, split so changed and unknown values can be marked
  const merged = useMemo(() => {
    const parts: { text: string; state?: 'value' | 'changed' | 'unknown' }[] = [];
    let last = 0;
    for (const v of parseTemplate(template)) {
      parts.push({ text: template.slice(last, v.from) });
      const { found, value } = getValueAtPath(record.data, v.path);
      parts.push(
        found
          ? { text: display(value), state: changed.has(v.path) ? 'changed' : 'value' }
          : { text: v.raw, state: 'unknown' }
      );
      last = v.to;
    }
    parts.push({ text: template.slice(last) });
    return parts;
  }, [template, record, changed]);

  const crankLabel =
    crank === 'playing'
      ? 'Typing a demo…'
      : crank === 'paused'
        ? 'Paused'
        : crank === 'yours'
          ? 'Your turn: type {{ anywhere'
          : 'Done. Now type {{ anywhere';

  return (
    <div className="hero-form" aria-label="Live demo">
      <fieldset className="kind-row">
        <legend className="caption">
          <span className="line-no">1</span> Type of template
        </legend>
        {kinds.map((k) => (
          <label key={k} className="checkbox">
            <input
              type="radio"
              name="kind"
              value={k}
              checked={kind === k}
              onChange={() => chooseKind(k)}
            />
            <span className="box" aria-hidden="true">
              {kind === k && <X size={15} strokeWidth={2.6} />}
            </span>
            {samples[k].label}
          </label>
        ))}
      </fieldset>

      <div className="field field-template" onPointerDown={takeOver} onKeyDown={takeOver}>
        <label className="caption" htmlFor="hero-template">
          <span className="line-no">2</span> Template
          <span className="caption-note">{sample.caption}</span>
        </label>
        <MentionInput
          ref={handle}
          id="hero-template"
          value={template}
          onChange={onEdit}
          suggestions={record.data}
          multiline
          colorScheme={carbon ? 'dark' : 'light'}
          placeholder="Type {{ to insert a variable"
        />
      </div>

      <fieldset className="record-row">
        <legend className="caption">
          <span className="line-no">3</span> Merge with record
        </legend>
        {sample.records.map((r, i) => (
          <label key={r.name} className="checkbox">
            <input
              type="radio"
              name="record"
              checked={recordIndex === i}
              onChange={() => {
                takeOver();
                switchRecord(i);
              }}
            />
            <span className="box" aria-hidden="true">
              {recordIndex === i && <X size={15} strokeWidth={2.6} />}
            </span>
            {r.name}
          </label>
        ))}
      </fieldset>

      <div className="field field-output">
        <div className="caption" id="merged-caption">
          <span className="line-no">4</span> Merged output
          {changed.size > 0 && (
            <span className="caption-note changed-note">
              {changed.size} {changed.size === 1 ? 'value' : 'values'} changed
            </span>
          )}
        </div>
        <pre className="typed" aria-labelledby="merged-caption" aria-live="polite">
          {merged.map((p, i) =>
            p.state ? (
              <span key={`${i}-${p.text}`} className={`merged-${p.state}`}>
                {p.text}
              </span>
            ) : (
              p.text
            )
          )}
        </pre>
      </div>

      <div className="crank" role="group" aria-label="Demo controls">
        <span className="crank-status" aria-live="polite">{crankLabel}</span>
        <div className="crank-buttons">
          {crank === 'playing' ? (
            <button type="button" className="icon-btn" onClick={() => setCrank('paused')} aria-label="Pause demo">
              <Pause size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="icon-btn"
              onClick={() => (crank === 'paused' ? setCrank('playing') : replay())}
              aria-label={crank === 'paused' ? 'Resume demo' : 'Play demo from the start'}
              disabled={kind !== 'prompt' && crank !== 'yours' && crank !== 'done'}
            >
              <Play size={16} />
            </button>
          )}
          <button
            type="button"
            className="icon-btn"
            onClick={step}
            aria-label="Step demo forward"
            disabled={crank === 'done' || crank === 'yours'}
          >
            <StepForward size={16} />
          </button>
          <button type="button" className="icon-btn" onClick={replay} aria-label="Replay demo">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
