# Design Brief

## Direction

FarmPath — a grounded mobile companion that turns pepper farming into a clear, guided journey from nursery bed to market sale.

## Tone

Organic modernism: warm, practical, and confident — agricultural without rustic cliché, using a clean grotesque voice and generous white space instead of earth-tone nostalgia.

## Differentiation

A field-notes system built on a deep forest green that behaves like soil and a lime accent that reads as growth — progress rings, harvest bars, and monospace numerals make farming data feel like a living record rather than a spreadsheet.

## Color Palette

| Token      | OKLCH           | Role                                    |
| ---------- | --------------- | --------------------------------------- |
| background | 0.975 0.006 130 | Off-white field canvas (light)          |
| foreground | 0.235 0.012 150 | Near-black green-ink text               |
| card       | 1 0 0           | White rounded surfaces                  |
| primary    | 0.42 0.11 152   | Deep forest green — brand, CTAs         |
| accent     | 0.72 0.17 128   | Lime green — progress, active states    |
| success    | 0.78 0.13 135   | Light green — completed lessons         |
| muted      | 0.955 0.012 135 | Chips, dividers, secondary surfaces     |

## Typography

- Display: Bricolage Grotesque — screen titles, greeting, crop names, section headers
- Body: Figtree — UI labels, lesson copy, list rows, buttons
- Mono: Geist Mono — harvest/sales/profit numerals, day counters, percentages
- Scale: hero `text-3xl font-bold tracking-tight`, h2 `text-xl font-semibold`, label `text-xs font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Off-white canvas with pure-white cards lifted by soft green-tinted shadows (`shadow-subtle` resting, `shadow-elevated`/`shadow-card-hover` on press); depth comes from layering and generous radius, never from heavy borders or gradients.

## Structural Zones

| Zone      | Background          | Border    | Notes                                                  |
| --------- | ------------------- | --------- | ------------------------------------------------------ |
| Header    | `bg-background`     | —         | Greeting + avatar, no hard line; scrolls with content  |
| Content   | `bg-background`     | —         | White cards on off-white; `bg-gradient-subtle` hero band |
| Tab bar   | `bg-card/95` blur   | `border-t`| Fixed bottom, 5 tabs, active item `text-primary` + fill |
| Hero band | `bg-gradient-primary`| —        | Deep-green journey card with progress ring, white text |

## Spacing & Rhythm

16px page gutters with 12–14px card gaps; cards use 16–20px internal padding and 2xl (20px) radius; every interactive row ≥44px tall for one-handed thumb use.

## Component Patterns

- Buttons: full-radius pills, `bg-primary` fill with `text-primary-foreground`, subtle press scale; secondary actions `bg-secondary`; accent reserved for progress and active tabs
- Cards: 20px radius, `bg-card`, `shadow-subtle` + 1px `border-border`; lesson/crop cards lead with photography and a rounded image
- Badges: pill chips on `bg-muted`; progress via lime `bg-accent` bars and SVG rings; completion check uses `bg-success`

## Motion

- Entrance: cards and list rows fade-and-rise 8px, 240ms ease-out, staggered 40ms
- Hover/press: cards lift to `shadow-card-hover`, 200ms; buttons scale 0.98 on press
- Decorative: progress rings draw in (`ring-fill` 900ms), harvest bars grow up (`grow-up` 600ms), completion check pops (`check-pop` 300ms); no looping animation

## Constraints

- Mobile-first: design at 390px, scale up with `sm:`/`md:`; support light and dark mode
- Touch targets ≥44px; fixed tab bar respects `env(safe-area-inset-bottom)`; content padded above tab bar
- Pepper-plant photography leads crop/lesson cards; no AI assistant and no offline-mode surfaces in this build

## Signature Detail

The pairing of a deep-green journey ring with oversized Geist Mono numerals — growth measured like a field log, not a scoreboard.
