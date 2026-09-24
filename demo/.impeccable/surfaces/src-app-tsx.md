---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Landing page surface brief

Scope: the `demo/` single-page landing site (GitHub Pages). Visitor mode: **Persuade**.
Audience: React developers building prompt-template editors (primary); email merge-tag and workflow builders (secondary).
Action: copy `npm install type-ahead-mention` (primary); GitHub (secondary).
Proof: the live editor only. No testimonials, logos, or invented numbers; measured bundle size and test count are allowed.
Constraints: no generic SaaS template look, code over slogans, a fast page.
Memorable moment: the hero form fills itself in: `{{user.` drops down real values, and switching the record re-types the merged output with the changed values held in red.

## Direction contract

THESIS: A template is a pre-printed form, and data is typed into its blanks. The page IS the form (Form TAM-3), and the hero editor fills it in live. It refuses the dark dev-tool hero with a glowing code window and a feature-card grid.

OWN-WORLD: White bond paper; drop-out red ink carries every rule, caption, box and number; typewriter black carries typed values (resolved data, code). Red is the only chromatic color. Condensed grotesk captions (Archivo, narrow widths), typewriter face for typed fills (Courier Prime). Perforations, registration marks, a form ID in the corner, checkbox controls, ruled tables. Dark mode = carbon copy: carbon-black sheet, lightened red ink, bone typed values.

STORY: See the field complete `{{user.` with real values → believe it knows nested data and flags mistakes → switch the template type (prompt/email/webhook) and record → see carbon copies merged → read the 10-line setup and the prop table → copy the install line from the red band.

FIRST VIEWPORT: Top strip: form ID left, version/MIT/GitHub/npm right. Left ~45%: display title "Autocomplete for {{template.variables}}" in heavy condensed, one-sentence offer, the install tear-off stub (primary action) plus GitHub. Right ~55%: boxed Field 1 "Template" (live MentionInput, autoplaying), checkbox row for template type, Field 2 "Merged output" typed black, record selector, and pause/step/replay controls.

FORM: The Merge Form (office mail-merge / pre-printed forms), candidate 5 of 7 on my ordered list; seed key 50cfcfea. Raises: gate board → changed values hold red until the next edit; darkroom → three carbon copies of one template against three records; one-hue → the install band floods full-bleed red with reversed type; automata → one timeline drives the hero autoplay (pause, step, take over).

SIGNATURE INTERACTION: the autoplay crank typing into the real editor with its real completion popup; clicking in hands control to the visitor. Motion grammar: typewriter cadence, and the hold-red flash on changed values; nothing else animates. Reduced motion shows the final state.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
