// Sample templates and records for the demo. All data is synthetic.

import type { SuggestionNode } from 'type-ahead-mention';

export type TemplateKind = 'prompt' | 'email' | 'webhook';

export interface Sample {
  kind: TemplateKind;
  label: string;
  /** What the template is for, one line */
  caption: string;
  /** Text already in the field before the autoplay starts */
  preset: string;
  /** What the autoplay types, as a script */
  script: Step[];
  /** The full template, used when the visitor switches to this kind */
  template: string;
  records: { name: string; data: SuggestionNode }[];
}

export type Step =
  | { type: string }
  | { accept: true }
  | { down: number }
  | { wait: number };

const promptRecords = [
  {
    name: 'Ada Lovelace',
    data: {
      user: { name: 'Ada Lovelace', plan: 'Pro', locale: 'en-GB', seats: 12 },
      ticket: {
        id: 'T-4821',
        subject: 'Invoice shows the wrong VAT rate',
        messages: [
          { from: 'customer', text: 'My March invoice charged 25% VAT.' },
          { from: 'agent', text: 'Checking with billing now.' },
        ],
      },
      product: { name: 'Engine Cloud', docs: 'docs.example.com/billing' },
    },
  },
  {
    name: 'Grace Hopper',
    data: {
      user: { name: 'Grace Hopper', plan: 'Team', locale: 'en-US', seats: 40 },
      ticket: {
        id: 'T-4907',
        subject: 'SSO login loops back to the start page',
        messages: [{ from: 'customer', text: 'Okta redirects me in a loop.' }],
      },
      product: { name: 'Engine Cloud', docs: 'docs.example.com/sso' },
    },
  },
  {
    name: 'Katherine Johnson',
    data: {
      user: { name: 'Katherine Johnson', plan: 'Free', locale: 'fr-FR', seats: 1 },
      ticket: {
        id: 'T-5012',
        subject: 'Can I export my projects as CSV?',
        messages: [{ from: 'customer', text: 'Looking for a bulk export.' }],
      },
      product: { name: 'Engine Cloud', docs: 'docs.example.com/export' },
    },
  },
];

const emailRecords = [
  {
    name: 'Ada Lovelace',
    data: {
      customer: { first_name: 'Ada', email: 'ada@example.com', address: { city: 'London', country: 'UK' } },
      order: {
        id: '#10482',
        carrier: 'Royal Mail',
        tracking_url: 'track.example.com/RM-88213',
        items: [{ name: 'Brass gear set', qty: 2 }, { name: 'Punch cards (500)', qty: 1 }],
      },
    },
  },
  {
    name: 'Grace Hopper',
    data: {
      customer: { first_name: 'Grace', email: 'grace@example.com', address: { city: 'Arlington', country: 'US' } },
      order: {
        id: '#10517',
        carrier: 'UPS',
        tracking_url: 'track.example.com/1Z-5520',
        items: [{ name: 'Nanosecond wire', qty: 30 }],
      },
    },
  },
  {
    name: 'Katherine Johnson',
    data: {
      customer: { first_name: 'Katherine', email: 'kj@example.com', address: { city: 'Hampton', country: 'US' } },
      order: {
        id: '#10533',
        carrier: 'FedEx',
        tracking_url: 'track.example.com/FX-0417',
        items: [{ name: 'Slide rule', qty: 1 }],
      },
    },
  },
];

const webhookRecords = [
  {
    name: 'Ada Lovelace',
    data: {
      event: {
        type: 'signup',
        user: { email: 'ada@example.com', company: 'Analytical Ltd' },
        plan: { name: 'Pro', seats: 12, annual: true },
      },
      channel: '#signups',
    },
  },
  {
    name: 'Grace Hopper',
    data: {
      event: {
        type: 'upgrade',
        user: { email: 'grace@example.com', company: 'COBOL Works' },
        plan: { name: 'Team', seats: 40, annual: false },
      },
      channel: '#sales',
    },
  },
  {
    name: 'Katherine Johnson',
    data: {
      event: {
        type: 'signup',
        user: { email: 'kj@example.com', company: 'Trajectory Co' },
        plan: { name: 'Free', seats: 1, annual: false },
      },
      channel: '#signups',
    },
  },
];

const promptPreset =
  'You are a support agent for {{product.name}}.\n' +
  'Reply to {{user.name}} ({{user.plan}} plan) about {{ticket.id}}: "{{ticket.subject}}".\n';

export const samples: Record<TemplateKind, Sample> = {
  prompt: {
    kind: 'prompt',
    label: 'Prompt template',
    caption: 'System prompt for a support agent',
    preset: promptPreset,
    script: [
      { wait: 700 },
      { type: 'Answer in ' },
      { type: '{{' },
      { wait: 1100 },
      { type: 'u' },
      { wait: 500 },
      { accept: true },
      { wait: 1400 },
      { down: 2 },
      { wait: 700 },
      { accept: true },
      { type: '. Cite ' },
      { type: '{{product.' },
      { wait: 900 },
      { type: 'd' },
      { wait: 400 },
      { accept: true },
      { type: '.' },
    ],
    template: promptPreset + 'Answer in {{user.locale}}. Cite {{product.docs}}.',
    records: promptRecords,
  },
  email: {
    kind: 'email',
    label: 'Email merge tags',
    caption: 'Shipping confirmation',
    preset: '',
    script: [],
    template:
      'Hi {{customer.first_name}},\n\n' +
      'Order {{order.id}} left our warehouse today with {{order.carrier}}.\n' +
      '{{order.items.0.qty}} × {{order.items.0.name}} is on its way to {{customer.address.city}}.\n\n' +
      'Track it at {{order.tracking_url}}',
    records: emailRecords,
  },
  webhook: {
    kind: 'webhook',
    label: 'Workflow step',
    caption: 'Webhook body sent to Slack',
    preset: '',
    script: [],
    template:
      '{\n' +
      '  "channel": "{{channel}}",\n' +
      '  "text": "New {{event.type}}: {{event.user.email}} ({{event.user.company}}) on {{event.plan.name}}, {{event.plan.seats}} seats"\n' +
      '}',
    records: webhookRecords,
  },
};

export const kinds: TemplateKind[] = ['prompt', 'email', 'webhook'];

// People for the @mention example. Synthetic roles; historical names.
const initialsAvatar = (name: string, shade: string) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="${shade}"/><text x="20" y="25.5" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const shades = ['#16171a', '#4f5158', '#2b2c30', '#6b6d74'];

export const people = [
  ['u_01', 'Ada Lovelace', 'Billing'],
  ['u_02', 'Alan Turing', 'Security'],
  ['u_03', 'Charles Babbage', 'Infrastructure'],
  ['u_04', 'Dorothy Vaughan', 'Support lead'],
  ['u_05', 'Emmy Noether', 'Data'],
  ['u_06', 'Grace Hopper', 'Engineering manager'],
  ['u_07', 'Hedy Lamarr', 'Networking'],
  ['u_08', 'John von Neumann', 'Architecture'],
  ['u_09', 'Katherine Johnson', 'Analytics'],
  ['u_10', 'Mary Jackson', 'Quality'],
].map(([id, label, description], i) => ({
  id,
  label,
  description,
  avatar: initialsAvatar(label, shades[i % shades.length]),
}));
