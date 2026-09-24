---
name: type-ahead-mention
description: Form TAM-3, a pre-printed merge form in drop-out red ink whose blanks are filled in typewriter black.
colors:
  ink: "#d23a2b"
  ink-text: "#b02a1d"
  bond-paper: "#fafaf7"
  field-white: "#ffffff"
  typed-black: "#16171a"
  typed-gray: "#4f5158"
  ink-rule: "color-mix(in srgb, #d23a2b 42%, transparent)"
  ink-tint: "color-mix(in srgb, #d23a2b 9%, transparent)"
  ink-tint-strong: "color-mix(in srgb, #d23a2b 20%, transparent)"
  band-text: "#ffffff"
  carbon-paper: "#121316"
  carbon-field: "#1a1b1f"
  carbon-ink: "#f0604d"
  carbon-ink-text: "#ff8a78"
  carbon-typed: "#ecebe6"
  carbon-typed-gray: "#a9aab1"
  carbon-band: "#c23526"
typography:
  display:
    fontFamily: "'Archivo Variable', 'Archivo', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.9rem, 6.2vw, 5.6rem)"
    fontWeight: 830
    lineHeight: 0.93
    letterSpacing: "-0.012em"
    fontVariation: "'wdth' 66"
  headline:
    fontFamily: "'Archivo Variable', 'Archivo', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.1rem, 3.8vw, 3.3rem)"
    fontWeight: 820
    lineHeight: 0.98
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 68"
  title:
    fontFamily: "'Archivo Variable', 'Archivo', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "21px"
    fontWeight: 720
    lineHeight: 1.2
    fontVariation: "'wdth' 80"
  form-number:
    fontFamily: "'Archivo Variable', 'Archivo', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 820
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 68"
  body:
    fontFamily: "'Archivo Variable', 'Archivo', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Archivo Variable', 'Archivo', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "12.5px"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "0.055em"
    fontVariation: "'wdth' 75"
  typed:
    fontFamily: "'Courier Prime', 'Courier New', Courier, monospace"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.6
  typed-display:
    fontFamily: "'Courier Prime', 'Courier New', Courier, monospace"
    fontSize: "clamp(1.45rem, 4.6vw, 3.9rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
rounded:
  none: "0px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  sheet-max: "1280px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.band-text}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.ink-text}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-text}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.ink-tint}"
  button-icon:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.none}"
    size: "36px"
  button-icon-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.band-text}"
  button-band:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "46px"
  checkbox-box:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.typed-black}"
    rounded: "{rounded.none}"
    size: "19px"
  line-number:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.field-white}"
    rounded: "{rounded.none}"
    size: "19px"
  form-box:
    backgroundColor: "{colors.field-white}"
    rounded: "{rounded.none}"
    padding: "12px 16px 14px"
  input-plain:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.typed-black}"
    typography: "{typography.typed}"
    rounded: "{rounded.none}"
    padding: "10px 14px"
  variable-chip:
    backgroundColor: "{colors.ink-tint}"
    textColor: "{colors.ink-text}"
    typography: "{typography.typed}"
    rounded: "{rounded.none}"
  popup-option-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.band-text}"
    typography: "{typography.typed}"
    rounded: "{rounded.none}"
  install-band:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.band-text}"
    padding: "clamp(48px, 7vw, 88px) clamp(16px, 4vw, 48px)"
---

# Design System: type-ahead-mention

## Overview

**Creative North Star: "The Merge Form"**

The page is a pre-printed office form, Form TAM-3, and data is typed into its blanks. Everything that belongs to the form itself (rules, box outlines, captions, field numbers, perforations, registration marks, the form ID) is printed in one drop-out red ink on white bond. Everything that was filled in (resolved values, code, commands, record names, status lines) is typed in a typewriter face in near-black. The reader should always be able to tell printed from typed at a glance: red and condensed grotesk is the form, black and Courier is the data.

Density is that of a real form: tight boxed fields with 1px internal rules inside a heavier 1.5px outer box, ruled tables, checkbox rows, square corners everywhere. Depth is almost absent; the sheet is flat, and only the working surfaces (the live form, the install stub, the completion popup) lift slightly off the paper. The one moment of full saturation is the install band, where the ink floods edge to edge and type reverses to white.

Dark mode is a carbon copy, not an inverted theme: a carbon-black sheet, the ink lightened so it still reads as red on black, and bone-colored typed values. The toggle is itself a form checkbox labelled "Carbon". The favicon and OG image are drawn from the same materials: a square white box with a 3px ink stroke, ink braces, and a black typed bar.

**Key Characteristics:**
- One chromatic hue (drop-out red); everything else is paper, black and gray.
- Two voices: condensed Archivo prints the form, Courier Prime types the data.
- Zero radius on every surface, including the embedded editor and its popup.
- Line weight carries hierarchy: 4px double, 1.5px outer box, 1px inner rule, 3px dotted perforation.
- Motion is typewriter cadence plus the hold-red flash on changed values; nothing else animates.
- Dark mode is "Carbon": a carbon copy of the same form.

## Colors

A single drop-out red on bond paper, with typewriter black for anything filled in.

### Primary
- **Drop-out Red Ink** (ink): every box outline, rule, perforation, registration mark, field-number badge, form ID, checkbox stroke, focus ring, primary button fill, selected completion option, and the install band flood. Used as a line and as small solid marks; floods only in the band.
- **Deep Ink for Text** (ink-text): red that has to be read as small text: captions, variable chips in the editor, link hover, code line numbers, changed merged values, outline-button labels. It exists because the line ink is only 4.6:1 on paper; the text ink is 6.3:1.
- **Ink Rule** (ink-rule, 42% ink): hairline row separators in ruled tables and between field specimens, link underlines, scrollbar thumb.
- **Ink Tint** (ink-tint, 9% ink) and **Strong Tint** (ink-tint-strong, 20%): the tint fills variable chips, inline code, checkbox hover, the crank control strip, the "this library" column of the comparison table, and changed values; the strong tint is the text selection and the 3px focus halo on inputs.

### Neutral
- **Bond Paper** (bond-paper): the page ground.
- **Field White** (field-white): the inside of every box (forms, copies, code sheets, inputs, popup), so boxes read as printed fields on the sheet.
- **Typewriter Black** (typed-black): body text, headings, and every typed value.
- **Typewriter Gray** (typed-gray): secondary prose, captions notes, crank status, legend, fine print.
- **Reversed White** (band-text): type on solid light-mode ink (band, primary button, selected option, field-number badges).

### Carbon (dark mode)
- **Carbon Sheet** (carbon-paper) and **Carbon Field** (carbon-field) replace paper and field.
- **Lightened Ink** (carbon-ink) and **Lightened Text Ink** (carbon-ink-text) replace the two reds; tints mix from the lightened ink at 13% / 26%, the rule at 38%.
- **Bone Type** (carbon-typed) and **Carbon Gray** (carbon-typed-gray) replace black and gray.
- **Carbon Band** (carbon-band): the band keeps a deeper red than the lightened ink so reversed white type holds 5.5:1.

### Named Rules
**The One Ink Rule.** Red is the only chromatic color. Checks, crosses and partial marks in the comparison table are black and gray, not green and red. A second hue means you are no longer on the form.

**The Printed vs Typed Rule.** If the form printed it, it is red; if someone filled it in, it is black. Merged values stay black (bold) except while they are newly changed.

**The One Flood Rule.** Solid ink fills are small marks (field-number badges, the primary copy button, the selected completion option, the hold-red flash) plus exactly one full-bleed flood: the install band. No other section gets a colored background.

**The Reversed Type Rule.** White type only sits on ink that holds at least 4.5:1: the light-mode ink (4.8:1) or the carbon band red (5.5:1). Never put white text on the lightened carbon ink (3.2:1).

## Typography

**Display Font:** Archivo Variable (with Archivo, Helvetica Neue, Arial)
**Body Font:** Archivo Variable at normal width
**Label/Mono Font:** Courier Prime 400/700 (with Courier New, Courier) for typed values

**Character:** Archivo's width axis does the work: headings and captions are cut narrow and heavy like pre-printed form headers, body runs at normal width. Courier Prime is the typewriter that filled the blanks, so it appears only where content was typed in.

### Hierarchy
- **Display** (830, clamp(2.9rem, 6.2vw, 5.6rem), 0.93, width 66%): the page title only. The `{{template.variables}}` span in it is ink. Balanced wrap. On narrow screens clamp(2.5rem, 12vw, 3.4rem).
- **Headline** (820, clamp(2.1rem, 3.8vw, 3.3rem), 0.98, width 68%): part titles, paired with a gray lead paragraph aligned to the right half.
- **Form Number** (820, 22px, width 68%, uppercase, ink): the "Form TAM-3" mark top left.
- **Title** (720, 21px, 1.2, width 80%): specimen and API sub-heads.
- **Body** (400, 17px, 1.55; 16px under 720px): prose, max 34–46ch/em per block.
- **Label / Caption** (650, 12.5px, 0.055em tracking, uppercase, width 75%, ink-text): the printed label on every box, table header row, and copy footer. Captions label a box or a column; they are not section eyebrows.
- **Typed** (Courier Prime 400, 15.5px, 1.6; 14–16.5px by context): editor text, merged output, carbon copies, code, record names, crank status, form revision line.
- **Typed Display** (Courier Prime 700, clamp(1.45rem, 4.6vw, 3.9rem), 1.1): the install command in the band.

### Named Rules
**The Two Hands Rule.** Archivo is the printer, Courier Prime is the typist. Never set a heading or button in Courier, and never set data, code, or a command in Archivo.

**The Width Axis Rule.** Hierarchy comes from width and weight together: narrower and heavier as the element becomes more "printed" (display 66%, captions 75%, buttons 80%). Body text stays at 100% width.

## Layout

A single sheet, max 1280px, centered, with a fluid gutter of clamp(16px, 4vw, 48px). The header is a flex strip closed by a 4px double ink rule. The hero is a two-column grid (0.92fr / 1.08fr, gap clamp(32px, 5vw, 72px)): title, offer, install stub and links on the left; the registered live form on the right. Parts open with a perforated tear line (3px dotted ink), then a two-column head: headline left, lead paragraph right-aligned, bottom-aligned (gap 16px 48px). Content grids repeat the 48px column gap (specimens 0.8fr / 1.2fr); carbon copies sit three-up with a 30px gap.

Vertical rhythm: parts start clamp(32px, 4vw, 48px) below their tear line, heads sit 32px above content, the band opens clamp(72px, 9vw, 120px) below the last part with inner padding clamp(48px, 7vw, 88px).

Breakpoints: at 1020px the hero and copies collapse to one column. At 720px part heads and specimens stack, section nav links hide (GitHub and the Carbon toggle stay), the form revision and registration marks hide, the install stub moves its "Install" label to a top row, band facts stack, and the comparison table becomes one block per feature with typed column labels.

## Elevation & Depth

The system is flat: depth is conveyed by ink outlines and field-white boxes on bond paper. A single soft, warm lift is reserved for the working surfaces the visitor operates.

### Shadow Vocabulary
- **Working-surface lift** (`box-shadow: 0 10px 28px -12px rgb(40 12 8 / 0.28), 0 2px 6px -2px rgb(40 12 8 / 0.12)`; carbon `0 12px 32px -12px rgb(0 0 0 / 0.7), 0 2px 6px -2px rgb(0 0 0 / 0.5)`): the hero form, the install stub, the completion popup and its info panel. Nothing else.
- **Focus halo** (`box-shadow: 0 0 0 3px` strong tint): text inputs and standalone editors on focus.
- **Carbon transfer** (`text-shadow: 0 0 0.5px` / `0.9px currentColor`): the second and third carbon copies' typed text softens, like a weaker transfer.

### Named Rules
**The Lifted Tools Rule.** Only surfaces the visitor is actively using lift off the sheet. Cards, code sheets, tables and copies stay flat.

**The Underneath Sheet Rule.** A carbon copy may show the sheet beneath it a few pixels out of register (an outlined paper-colored rectangle offset 5–7px). This belongs to the carbon-copy stack only; it is not an elevation style for other boxes.

## Shapes

Every corner is square (0px), including the library editor (`--tam-radius: 0px`), its popup, and its options. Form language is line weight: the header closes with a 4px double rule; outer boxes use 1.5px ink; divisions inside a box use 1px ink; tables use a 1.5px head rule and 42% ink row hairlines; perforations are 3px dotted ink (tear lines above every part and the band, the divider between the stub's label and command); copy footers use 1px dotted. Registration marks are 14px L-shaped corners set 10px outside the hero form, with the form revision printed above its top-right corner. Checkboxes are 19px square boxes with a 1.5px ink stroke, marked with a typed X.

## Components

### Buttons
Printed and square: condensed uppercase labels, ink outlines, no radius.
- **Shape:** square (0px), min height 36px; label 650, 13–13.5px, 0.05em tracking, uppercase, width 80%.
- **Primary (copy on the install stub):** solid ink, reversed white, 0 20px padding; hover deepens to text ink.
- **Outline:** 1px ink border, transparent fill, text-ink label; hover fills with ink tint.
- **Icon (crank controls):** 36px square, 1px ink border, field-white fill, text-ink icon; hover floods ink with white icon; disabled at 38% opacity.
- **Band buttons:** 46px tall; copy is white with band-red text, the link is a 1px 75%-white outline; focus rings turn white on the band.
- **Transitions:** background and color, 120ms ease.

### Checkboxes and radios
- **Style:** 19px square box, 1.5px ink stroke, field-white fill, a 13px typed X when checked; labels 15.5px Archivo.
- **State:** hover fills the box with ink tint; keyboard focus draws the 2px ink ring 2px outside the box. Radios (template type, record) use the same square box; the form has no circles.

### Form Box (the hero form)
- **Corner Style:** square.
- **Background:** field white; 1.5px ink outer border; each fieldset or field divided by 1px ink.
- **Shadow Strategy:** working-surface lift.
- **Internal Padding:** 12px 16px 14px; a field under focus tints to 3% ink.
- **Captions:** each section is captioned with a 19px solid-ink field-number badge (condensed 750, 12px) and an uppercase caption; an optional gray caption note sits right-aligned.
- **Crank strip:** the bottom row is ink-tinted, with typed status left and icon buttons right.

### Inputs / Fields
- **Style:** field white, 1px ink border (1.5px when standalone via the library), square, Courier Prime 16px, 10px 14px padding.
- **Focus:** a 3px strong-tint halo, no border change; inside the hero form the field itself tints instead.
- **Variable chips:** ink tint fill, text-ink Courier. Unknown paths stay black with an ink wavy underline.

### Completion Popup
- **Style:** field white, 1.5px ink border, square, 3px inner padding, Courier Prime 14.5px, working-surface lift.
- **Selected option:** solid ink with reversed white; its detail text (for example "{4 keys}") at 85% white.

### Carbon Copies (signature)
Three copies of one merged template side by side. Each is a field-white box with a 1px ink border, a caption plus typed "To:" head, typed body, and a dotted footer naming the copy (White, Yellow, Pink) and "Copy n of 3". Each shows its underneath sheet out of register, and later copies soften their type (carbon transfer).

### Code Sheet and Ruled Tables
- **Code sheet:** field white, 1px ink border, caption head row with an outline copy button, Courier 14.5px/1.65, a ruled line-number gutter in text ink.
- **Ruled tables:** caption-style header row over a 1.5px ink rule, 42% ink hairlines between rows, no vertical rules. The comparison highlights this library's column with ink tint and an ink header.

### Navigation
The header strip: form number and typed revision on the left; 15px/550 Archivo links on the right with no underline, hover to text ink; external links carry 15px line icons; the Carbon checkbox closes the row. Under 720px only GitHub and Carbon remain.

### Install Band
The one ink flood: full-bleed ink (carbon band red in dark mode), a white 55% tear line on top, the install command in typed display, band buttons, and a row of uppercase condensed facts separated by thin white rules.

### Motion
Typewriter cadence in the autoplaying hero, and the hold-red flash: a changed merged value starts as solid ink with white type and settles over 1100ms (cubic-bezier(0.16, 1, 0.3, 1)) to bold text ink on tint, holding there until the next edit. Hover transitions are 120ms color/background only. Under reduced motion, smooth scroll and the flash turn off and the final state shows.

## Do's and Don'ts

### Do:
- **Do** draw every structural line, caption and number in ink, and every filled-in value in typed black Courier Prime.
- **Do** keep all corners at 0px, and pass `--tam-radius: 0px` and the ink variables to the library editor wherever it appears.
- **Do** express hierarchy with line weight: 4px double for the header, 1.5px outer boxes, 1px inner rules, 3px dotted perforations.
- **Do** label boxes and table columns with the uppercase condensed caption (650, 12.5px, 0.055em) in text ink, numbered with a solid ink badge when the box is part of a sequence.
- **Do** use text ink, not line ink, for any red text below 18px.
- **Do** restrict the soft lift shadow to surfaces the visitor operates (live form, install stub, popup).
- **Do** render dark mode as Carbon: carbon sheet, lightened ink, bone type, and a deeper band red.

### Don't:
- **Don't** introduce a second chromatic color, gradients, or colored section backgrounds; the band is the only flood.
- **Don't** set headings, buttons or captions in Courier, or data and code in Archivo.
- **Don't** put a caption above a section headline as an eyebrow; captions label boxes and columns only.
- **Don't** put white text on the lightened carbon ink (#f0604d); it is 3.2:1. Every fill that carries white text uses `--ink-fill` (#d23a2b on bond, #c23526 in carbon, 5.8:1), never `--ink`.
- **Don't** reuse the out-of-register underneath sheet on anything but a carbon-copy stack.
- **Don't** animate anything beyond typewriter cadence, the hold-red flash, and 120ms hover color changes.
