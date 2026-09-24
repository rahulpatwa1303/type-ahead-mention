import {
  getCompletionMatch,
  getValueAtPath,
  parseTemplate,
  previewValue,
  resolveTemplate,
  validateTemplate,
  filterSuggestions,
} from '../src/template';
import { data } from './fixtures';

describe('parseTemplate', () => {
  it('finds variables with offsets', () => {
    expect(parseTemplate('Hi {{user.name}}!')).toEqual([
      { path: 'user.name', raw: '{{user.name}}', from: 3, to: 16 },
    ]);
  });

  it('tolerates whitespace and bracket indices', () => {
    expect(parseTemplate('{{ user.roles[1] }}').map((v) => v.path)).toEqual(['user.roles.1']);
  });

  it('skips malformed variables but keeps later valid ones', () => {
    expect(parseTemplate('{{ not valid }} {{ oops {{user.name}}').map((v) => v.path)).toEqual([
      'user.name',
    ]);
  });

  it('supports custom delimiters', () => {
    expect(parseTemplate('${a.b} and [[c]]', { open: '${', close: '}' }).map((v) => v.path)).toEqual([
      'a.b',
    ]);
  });
});

describe('delimiters without a close', () => {
  const at = { open: '@', close: '' };
  it('parses and resolves @paths', () => {
    expect(parseTemplate('Ping @user.name. Thanks', at).map((v) => v.path)).toEqual(['user.name']);
    expect(resolveTemplate('Ping @user.name.', data, { delimiters: at })).toBe('Ping Ada Lovelace.');
  });
  it('completes after @', () => {
    const m = getCompletionMatch('hey @user.em', 12, data, at)!;
    expect(m.items.map((i) => i.key)).toContain('email');
    expect(m.hasClose).toBe(true);
  });
});

describe('getValueAtPath', () => {
  it('walks objects and arrays', () => {
    expect(getValueAtPath(data, 'order.items.0.name')).toEqual({ found: true, value: 'Engine' });
    expect(getValueAtPath(data, 'order.items[0].qty')).toEqual({ found: true, value: 2 });
  });

  it('distinguishes missing from falsy', () => {
    expect(getValueAtPath(data, 'order.paid')).toEqual({ found: true, value: false });
    expect(getValueAtPath(data, 'order.nope').found).toBe(false);
    expect(getValueAtPath(data, 'user.name.length').found).toBe(false);
  });

  it('does not read inherited properties', () => {
    expect(getValueAtPath(data, 'user.toString').found).toBe(false);
  });
});

describe('resolveTemplate', () => {
  it('replaces variables', () => {
    expect(resolveTemplate('Hi {{ user.name }}, {{order.items.0.qty}}x', data)).toBe('Hi Ada Lovelace, 2x');
  });

  it('keeps unknown variables by default', () => {
    expect(resolveTemplate('Hi {{user.nick}}', data)).toBe('Hi {{user.nick}}');
  });

  it('supports missing: empty and a function', () => {
    expect(resolveTemplate('Hi {{user.nick}}', data, { missing: 'empty' })).toBe('Hi ');
    expect(resolveTemplate('Hi {{user.nick}}', data, { missing: (v) => `<${v.path}>` })).toBe('Hi <user.nick>');
  });

  it('formats falsy values, objects and arrays', () => {
    expect(resolveTemplate('{{order.paid}} {{order.total}}', data)).toBe('false 42');
    expect(resolveTemplate('{{user.roles}}', data)).toBe('["admin","editor"]');
    expect(resolveTemplate('{{x}}', { x: null })).toBe('');
  });

  it('supports hyphenated keys and custom format', () => {
    expect(resolveTemplate('{{first-name}}', data, { format: (v) => String(v).toUpperCase() })).toBe('ADA');
  });
});

describe('validateTemplate', () => {
  it('lists unknown variables', () => {
    const result = validateTemplate('{{user.name}} {{user.nmae}} {{order.items.3}}', data);
    expect(result.valid).toBe(false);
    expect(result.unknown.map((v) => v.path)).toEqual(['user.nmae', 'order.items.3']);
  });
});

describe('getCompletionMatch', () => {
  const at = (text: string) => {
    const cursor = text.indexOf('|');
    return getCompletionMatch(text.replace('|', ''), cursor, data);
  };

  it('suggests top-level keys right after the open delimiter', () => {
    const m = at('Hello {{|')!;
    expect(m.from).toBe(8);
    expect(m.items.map((i) => i.key)).toEqual(['user', 'order', 'first-name']);
  });

  it('suggests nested keys with the partial query', () => {
    const m = at('{{user.na|')!;
    expect(m.parentPath).toEqual(['user']);
    expect(m.query).toBe('na');
    expect(m.from).toBe(7);
    expect(m.items.find((i) => i.key === 'name')!.path).toBe('user.name');
  });

  it('suggests array indices', () => {
    expect(at('{{user.roles.|')!.items.map((i) => i.key)).toEqual(['0', '1']);
  });

  it('uses offsets that work on later lines', () => {
    const text = 'line one\nline two {{us|';
    const m = at(text)!;
    expect(text.slice(0, m.from).endsWith('{{')).toBe(true);
  });

  it('extends the range over the rest of the word and sees the close', () => {
    const m = at('{{user.na|me}}')!;
    expect([m.from, m.to, m.hasClose]).toEqual([7, 11, true]);
  });

  it('returns null outside variables', () => {
    expect(at('no braces |')).toBeNull();
    expect(at('{{user.name}} after |')).toBeNull();
    expect(at('{{user.name.|')).toBeNull(); // leaf
    expect(at('{{nope.|')).toBeNull();
    expect(at('{{user na|')).toBeNull();
  });

  it('does not look past the current line', () => {
    expect(at('{{\n|')).toBeNull();
  });
});

describe('previewValue / filterSuggestions', () => {
  it('previews values compactly', () => {
    expect(previewValue('Ada')).toBe('"Ada"');
    expect(previewValue([1, 2, 3])).toBe('[3 items]');
    expect(previewValue({ a: 1 })).toBe('{1 key}');
    expect(previewValue('x'.repeat(50)).length).toBe(28);
  });

  it('ranks prefix matches before substring matches', () => {
    const items = ['email', 'name', 'nickname'].map((key) => ({ key, path: key, value: 1, isBranch: false }));
    expect(filterSuggestions(items, 'na').map((i) => i.key)).toEqual(['name', 'nickname']);
  });
});
