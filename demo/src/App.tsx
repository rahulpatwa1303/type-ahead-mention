import { useEffect, useState } from 'react';
import { Check, Copy, Minus, Package, X } from 'lucide-react';
import { Github } from './GithubIcon';
import {
  MentionInput,
  TemplateTextarea,
  replaceMentions,
  resolveTemplate,
  validateTemplate,
  type MentionSource,
} from 'type-ahead-mention';
import { Hero } from './Hero';
import { people, samples } from './data';

const INSTALL = 'npm install type-ahead-mention';
const COPY_NAMES = ['Original', 'Duplicate', 'Triplicate'];
const REPO = 'https://github.com/rahulpatwa1303/type-ahead-mention';
const NPM = 'https://www.npmjs.com/package/type-ahead-mention';

function CopyButton({ text, label = 'Copy', className = '' }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard can be blocked in iframes; fall back to a selection
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    setDone(true);
    window.setTimeout(() => setDone(false), 1600);
  };
  return (
    <button type="button" className={`copy-btn ${className}`} onClick={copy} aria-live="polite">
      {done ? <Check size={16} strokeWidth={2.4} /> : <Copy size={16} />}
      <span>{done ? 'Copied' : label}</span>
    </button>
  );
}

function useCarbon(): [boolean, (v: boolean) => void] {
  const [carbon, setCarbon] = useState(() => {
    try {
      const saved = localStorage.getItem('tam-carbon');
      if (saved !== null) return saved === '1';
    } catch {
      /* storage blocked */
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.dataset.theme = carbon ? 'dark' : 'light';
  }, [carbon]);
  return [
    carbon,
    (v) => {
      setCarbon(v);
      try {
        localStorage.setItem('tam-carbon', v ? '1' : '0');
      } catch {
        /* storage blocked */
      }
    },
  ];
}

const specimenData = samples.prompt.records[0].data;

function LightFieldSpecimen({ carbon }: { carbon: boolean }) {
  const [value, setValue] = useState('No editor here: {{ticket.subject}} for @[Ada Lovelace](u_01), cc @');
  return (
    <TemplateTextarea
      value={value}
      onChange={setValue}
      suggestions={specimenData}
      mentions={peopleSource}
      multiline
      rows={2}
      colorScheme={carbon ? 'dark' : 'light'}
      aria-label="Light field example"
    />
  );
}

function SubmitSpecimen({ carbon }: { carbon: boolean }) {
  const [value, setValue] = useState('Summarise {{ticket.subject}} for {{user.name}}');
  const [sent, setSent] = useState<string | null>(null);
  return (
    <>
      <MentionInput
        value={value}
        onChange={setValue}
        suggestions={specimenData}
        onSubmit={(v) => setSent(resolveTemplate(v, specimenData))}
        colorScheme={carbon ? 'dark' : 'light'}
        aria-label="Single-line input with submit"
      />
      <p className="specimen-out">
        {sent ? (
          <>
            <span className="out-label">Sent:</span> {sent}
          </>
        ) : (
          'Press Enter to submit. Suggestions take Enter first when they are open.'
        )}
      </p>
    </>
  );
}

// A fake directory API: filters the list after a network-like delay
const peopleSource: MentionSource = {
  trigger: '@',
  search: async (query, { signal }) => {
    await new Promise((resolve, reject) => {
      const t = window.setTimeout(resolve, 380);
      signal.addEventListener('abort', () => {
        window.clearTimeout(t);
        reject(new DOMException('aborted', 'AbortError'));
      });
    });
    const q = query.toLowerCase();
    return people
      .filter((p) => p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .slice(0, 6);
  },
  getItem: (id) => people.find((p) => p.id === id),
};

function MentionSpecimen({ carbon }: { carbon: boolean }) {
  const [value, setValue] = useState('Loop in @[Grace Hopper](u_06) and @');
  return (
    <>
      <MentionInput
        value={value}
        onChange={setValue}
        suggestions={specimenData}
        mentions={peopleSource}
        multiline
        colorScheme={carbon ? 'dark' : 'light'}
        aria-label="Mentions example"
      />
      <p className="specimen-out">
        <span className="out-label">Stored:</span> {value}
      </p>
      <p className="specimen-out">
        <span className="out-label">replaceMentions():</span> {replaceMentions(value)}
      </p>
    </>
  );
}

function ValidateSpecimen({ carbon }: { carbon: boolean }) {
  const [value, setValue] = useState('Hi {{user.nmae}}, you have {{user.seats}} seats on {{user.plan}}.');
  const { unknown } = validateTemplate(value, specimenData);
  return (
    <>
      <MentionInput
        value={value}
        onChange={setValue}
        suggestions={specimenData}
        colorScheme={carbon ? 'dark' : 'light'}
        aria-label="Validation example"
      />
      <p className="specimen-out">
        <span className="out-label">validateTemplate():</span>{' '}
        {unknown.length ? `unknown: ${unknown.map((u) => u.path).join(', ')}` : 'all variables found'}
      </p>
    </>
  );
}

function DelimiterSpecimen({ carbon }: { carbon: boolean }) {
  const [value, setValue] = useState('Deploy ${product.name} for ${user.');
  return (
    <MentionInput
      value={value}
      onChange={setValue}
      suggestions={specimenData}
      delimiters={{ open: '${', close: '}' }}
      colorScheme={carbon ? 'dark' : 'light'}
      aria-label="Custom delimiters example"
    />
  );
}

function ArraySpecimen({ carbon }: { carbon: boolean }) {
  const [value, setValue] = useState('Latest message: {{ticket.messages.0.text}} Next: {{ticket.messages.');
  return (
    <MentionInput
      value={value}
      onChange={setValue}
      suggestions={specimenData}
      colorScheme={carbon ? 'dark' : 'light'}
      aria-label="Array index example"
    />
  );
}

const SNIPPET = `import { useState } from 'react';
import { MentionInput, useMentionResolver } from 'type-ahead-mention';

const data = { user: { name: 'Ada', plan: 'Pro' } };

export function PromptEditor() {
  const [text, setText] = useState('Reply to {{user.name}}');
  const preview = useMentionResolver(text, data);

  return (
    <>
      <MentionInput
        value={text}
        onChange={setText}
        suggestions={data}
      />
      <pre>{preview}</pre>
    </>
  );
}`;

const props: [string, string, string, string][] = [
  ['value', 'string', 'required', 'The template text'],
  ['onChange', '(value) => void', 'required', 'Called on every edit'],
  ['suggestions', 'object', 'required', 'Data to suggest from. Nested objects and arrays work.'],
  ['multiline', 'boolean', 'false', 'Textarea mode. Otherwise Enter never adds a line.'],
  ['delimiters', '{ open, close }', "'{{' '}}'", 'For ${ }, [[ ]], or anything else'],
  ['showValues', 'boolean', 'true', 'Preview each value in the list'],
  ['highlight', 'boolean', 'true', 'Show variables as chips'],
  ['validate', 'boolean', 'true', "Underline paths that aren't in the data"],
  ['mentions', '{ trigger, search, getItem }', '—', '@mentions with async search and avatars, stored as @[Label](id)'],
  ['onSubmit', '(value) => void', '—', 'Enter (single-line) or Mod-Enter (multiline)'],
  ['colorScheme', "'light' | 'dark' | 'auto'", "'light'", 'Built-in themes; restyle with --tam-* CSS variables'],
  ['disabled / readOnly', 'boolean', 'false', ''],
  ['ref', 'MentionInputHandle', '—', 'focus(), insertVariable(path), openSuggestions(), view'],
];

type Mark = 'yes' | 'no' | 'partial';
const compare: [string, Mark, Mark, Mark][] = [
  ['Completes nested paths (user.address.city)', 'yes', 'partial', 'partial'],
  ['Array indices (items.0.name)', 'yes', 'partial', 'partial'],
  ['Shows each value in the suggestion list', 'yes', 'partial', 'partial'],
  ['Flags variables missing from the data', 'yes', 'no', 'partial'],
  ['Resolves and validates templates at runtime', 'yes', 'no', 'no'],
  ['Adds completion to your own <input> / <textarea>', 'yes', 'no', 'no'],
  ['@mentions of people, with avatars and async search', 'yes', 'yes', 'yes'],
  ['Rich text (bold, lists, embeds)', 'no', 'no', 'yes'],
];

function MarkIcon({ mark }: { mark: Mark }) {
  if (mark === 'yes') return <Check size={18} strokeWidth={2.6} aria-label="Yes" className="mark mark-yes" />;
  if (mark === 'partial') return <Minus size={18} strokeWidth={2.6} aria-label="Build it yourself" className="mark mark-partial" />;
  return <X size={16} strokeWidth={2} aria-label="No" className="mark mark-no" />;
}

export default function App() {
  const [carbon, setCarbon] = useCarbon();
  const copiesSample = samples.email;

  return (
    <>
      <div className="sheet">
      <header className="form-head">
        <div className="form-id">
          <span className="form-no">Form TAM-3</span>
          <span className="form-rev">type-ahead-mention · v3.0 · MIT</span>
        </div>
        <nav aria-label="Page">
          <a href="#copies">Copies</a>
          <a href="#fields">Fields</a>
          <a href="#setup">Setup</a>
          <a href="#compare">Compare</a>
          <a href={REPO} className="nav-ext">
            <Github size={15} /> GitHub
          </a>
          <a href={NPM} className="nav-ext nav-npm">
            <Package size={15} /> npm
          </a>
          <label className="checkbox carbon-toggle">
            <input type="checkbox" checked={carbon} onChange={(e) => setCarbon(e.target.checked)} />
            <span className="box" aria-hidden="true">
              {carbon && <X size={13} strokeWidth={2.6} />}
            </span>
            Carbon
          </label>
        </nav>
      </header>

      <main>
        <section className="hero" aria-labelledby="title">
          <div className="hero-copy">
            <h1 id="title">
              Autocomplete for <span className="title-var">{'{{template.'}<wbr />{'variables}}'}</span> in React
            </h1>
            <p className="offer">
              Type <code>{'{{user.'}</code> and see the real value of every key in your data. Drill into nested
              objects and arrays. Misspelled variables get underlined as you type, and <code>@</code> mentions
              people. For prompt templates, email merge tags and workflow builders.
            </p>
            <div className="stub" role="group" aria-label="Install">
              <span className="stub-label caption">Install</span>
              <code className="stub-cmd">{INSTALL}</code>
              <CopyButton text={INSTALL} className="stub-copy" />
            </div>
            <p className="hero-links">
              <a href={REPO}>
                <Github size={16} /> Source on GitHub
              </a>
              <a href="#setup">Setup: one file, 20 lines</a>
            </p>
          </div>
          <div className="registered">
            <span className="reg reg-tl" aria-hidden="true" />
            <span className="reg reg-tr" aria-hidden="true" />
            <span className="reg reg-bl" aria-hidden="true" />
            <span className="reg reg-br" aria-hidden="true" />
            <span className="form-rev-block caption" aria-hidden="true">
              Form TAM-3 · Rev. 09-2026
            </span>
            <Hero carbon={carbon} />
          </div>
        </section>

        <section id="copies" className="part" aria-labelledby="copies-title">
          <div className="part-head">
            <h2 id="copies-title">One template, every record</h2>
            <p>
              The same syntax runs at send time. <code>resolveTemplate(template, record)</code> merges a template
              with each record. These three copies come from one template and three sample records.
            </p>
          </div>
          <div className="copies">
            {copiesSample.records.map((r, i) => (
              <article key={r.name} className={`copy copy-${i + 1}`} aria-label={`${COPY_NAMES[i]} copy: ${r.name}`}>
                <div className="copy-head">
                  <span className="caption">TAM-3 · Shipping</span>
                  <span className="copy-rec">To: {r.name}</span>
                </div>
                <pre className="typed">{resolveTemplate(copiesSample.template, r.data)}</pre>
                <div className="copy-foot caption">
                  <span>{COPY_NAMES[i]}</span>
                  <span>Copy {i + 1} of 3</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="fields" className="part" aria-labelledby="fields-title">
          <div className="part-head">
            <h2 id="fields-title">What the field does</h2>
            <p>Every example below is live. Click into one and type.</p>
          </div>
          <div className="specimens">
            <div className="specimen">
              <div className="specimen-note">
                <h3>Catches typos before they ship</h3>
                <p>
                  Paths that aren't in the data get a red squiggle. <code>validateTemplate()</code> gives you the
                  same list on the server.
                </p>
              </div>
              <div className="specimen-field">
                <ValidateSpecimen carbon={carbon} />
              </div>
            </div>
            <div className="specimen">
              <div className="specimen-note">
                <h3>Mentions people, too</h3>
                <p>
                  <code>{'mentions={{ search }}'}</code> takes a sync or async search, with avatars. Picks are
                  stored as <code>{'@[Grace Hopper](u_06)'}</code> and shown as chips that Backspace removes
                  whole. Type after the <code>@</code>: this one searches a fake directory with a 380 ms delay.
                </p>
              </div>
              <div className="specimen-field">
                <MentionSpecimen carbon={carbon} />
              </div>
            </div>
            <div className="specimen">
              <div className="specimen-note">
                <h3>Walks into arrays</h3>
                <p>
                  Arrays suggest their indices, so <code>{'{{ticket.messages.0.text}}'}</code> is two keystrokes
                  away. Finish the second variable.
                </p>
              </div>
              <div className="specimen-field">
                <ArraySpecimen carbon={carbon} />
              </div>
            </div>
            <div className="specimen">
              <div className="specimen-note">
                <h3>Your syntax, not ours</h3>
                <p>
                  <code>{"delimiters={{ open: '${', close: '}' }}"}</code>. Handlebars, JS template literals,
                  Liquid-style <code>[[ ]]</code>: pick your own.
                </p>
              </div>
              <div className="specimen-field">
                <DelimiterSpecimen carbon={carbon} />
              </div>
            </div>
            <div className="specimen">
              <div className="specimen-note">
                <h3>Single-line with submit</h3>
                <p>
                  A chat box: Enter calls <code>onSubmit</code>, and pasted newlines become spaces.
                </p>
              </div>
              <div className="specimen-field">
                <SubmitSpecimen carbon={carbon} />
              </div>
            </div>
            <div className="specimen">
              <div className="specimen-note">
                <h3>Or skip the editor: 6.7 kB</h3>
                <p>
                  <code>{'<TemplateTextarea>'}</code> is a plain <code>{'<textarea>'}</code> with the same
                  completion, highlighting, typo underlines and @mentions, and no CodeMirror. For your own
                  input, <code>useMentionSuggestions()</code> is 5.7 kB.
                </p>
              </div>
              <div className="specimen-field">
                <LightFieldSpecimen carbon={carbon} />
              </div>
            </div>
          </div>
        </section>

        <section id="setup" className="part" aria-labelledby="setup-title">
          <div className="part-head">
            <h2 id="setup-title">Setup</h2>
            <p>
              One package, React 18 or 19. The first load is 7 kB. <code>{'<MentionInput>'}</code> fetches
              CodeMirror (about 100 kB) the first time it renders and shows a plain field until then.{' '}
              <code>{'<TemplateTextarea>'}</code> never fetches it.
            </p>
          </div>
          <div className="setup">
            <div className="code-sheet">
              <div className="code-head caption">
                <span>PromptEditor.tsx</span>
                <CopyButton text={SNIPPET} />
              </div>
              <pre className="code" tabIndex={0}>
                {SNIPPET.split('\n').map((line, i) => (
                  <span key={i} className="code-line">
                    <span className="code-no" aria-hidden="true">
                      {i + 1}
                    </span>
                    {line || ' '}
                    {'\n'}
                  </span>
                ))}
              </pre>
            </div>
            <div className="api" id="api">
              <h3>
                <code>{'<MentionInput>'}</code> props
              </h3>
              <table className="ruled">
                <thead>
                  <tr>
                    <th scope="col">Prop</th>
                    <th scope="col">Type</th>
                    <th scope="col">Default</th>
                  </tr>
                </thead>
                <tbody>
                  {props.map(([name, type, def, what]) => (
                    <tr key={name}>
                      <th scope="row">
                        <code>{name}</code>
                        {what && <span className="prop-what">{what}</span>}
                      </th>
                      <td>
                        <code>{type}</code>
                      </td>
                      <td>
                        <code>{def}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="api-more">
                Also exported: <code>resolveTemplate</code>, <code>validateTemplate</code>,{' '}
                <code>parseTemplate</code>, <code>getValueAtPath</code>, <code>parseMentions</code>,{' '}
                <code>replaceMentions</code>, the <code>TemplatePath&lt;T&gt;</code>{' '}
                type, and <code>templateVariables()</code> for an existing CodeMirror editor.{' '}
                <a href={`${REPO}/tree/master/packages/core#readme`}>Full API reference</a>
              </p>
            </div>
          </div>
        </section>

        <section id="compare" className="part" aria-labelledby="compare-title">
          <div className="part-head">
            <h2 id="compare-title">Which one do you need?</h2>
            <p>
              If you want <code>@name</code> mentions of people in a rich-text editor, use one of the others. If
              your users write templates against structured data, use this one.
            </p>
          </div>
          <div className="table-scroll">
            <table className="ruled compare">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Capability</span>
                  </th>
                  <th scope="col" className="col-us">
                    type-ahead-mention
                  </th>
                  <th scope="col">react-mentions</th>
                  <th scope="col">Tiptap Mention</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([row, a, b, c]) => (
                  <tr key={row}>
                    <th scope="row">{row}</th>
                    <td className="col-us" data-label="type-ahead-mention">
                      <MarkIcon mark={a} />
                    </td>
                    <td data-label="react-mentions">
                      <MarkIcon mark={b} />
                    </td>
                    <td data-label="Tiptap">
                      <MarkIcon mark={c} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="legend">
            <span>
              <MarkIcon mark="yes" /> built in
            </span>
            <span>
              <MarkIcon mark="partial" /> build it yourself
            </span>
            <span>
              <MarkIcon mark="no" /> not supported
            </span>
            <span className="legend-date">Compared from each library's docs, September 2026.</span>
          </p>
        </section>
      </main>
      </div>

      <section className="band" aria-labelledby="band-title">
        <div className="band-inner">
          <h2 id="band-title" className="sr-only">
            Install
          </h2>
          <code className="band-cmd">{INSTALL}</code>
          <div className="band-actions">
            <CopyButton text={INSTALL} label="Copy install command" className="band-copy" />
            <a href={REPO} className="band-link">
              <Github size={16} /> GitHub
            </a>
            <a href={NPM} className="band-link">
              <Package size={16} /> npm
            </a>
          </div>
          <ul className="band-facts">
            <li>7 kB first load</li>
            <li>CodeMirror loads with the editor</li>
            <li>TypeScript types, ESM and CJS</li>
            <li>61 tests</li>
            <li>MIT license</li>
          </ul>
        </div>
      </section>

      <footer className="fine-print">
        <span>Form TAM-3 (Rev. 09-2026)</span>
        <span>
          Made by <a href="https://github.com/rahulpatwa1303">Rahul Patwa</a>. Names in the sample records are
          historical figures; all data is made up.
        </span>
        <a href={`${REPO}/issues`}>Report a problem</a>
      </footer>
    </>
  );
}
