# Design System

## Typography

### Font Families

- **Headings**: Poppins (sans-serif)
- **Body**: Inter (sans-serif)

### Font Weights

- **Poppins**: 400, 500, 600, 700, 800
- **Inter**: 300, 400, 500, 600

### Usage

```css
font-heading  /* Headings (h1-h6) */
font-body     /* Body text */
```

---

## Colors

### Primary Palette (Forest Green)

| Token                  | HSL         | Hex     | Usage                        |
| ---------------------- | ----------- | ------- | ---------------------------- |
| `--primary`            | 140 35% 35% | #4a7c6f | Main actions, links, accents |
| `--primary-foreground` | 40 30% 97%  | #f7f5f2 | Text on primary              |

### Secondary Palette (Warm Beige)

| Token                    | HSL        | Hex     | Usage             |
| ------------------------ | ---------- | ------- | ----------------- |
| `--secondary`            | 35 30% 90% | #ece8e0 | Cards, sections   |
| `--secondary-foreground` | 30 30% 25% | #4a4540 | Text on secondary |

### Accent (Terracotta Orange)

| Token                 | HSL        | Hex     | Usage            |
| --------------------- | ---------- | ------- | ---------------- |
| `--accent`            | 30 75% 55% | #d98c4d | CTAs, highlights |
| `--accent-foreground` | 40 30% 97% | #f7f5f2 | Text on accent   |

### Earth Tones

| Token                      | HSL        | Hex     | Usage               |
| -------------------------- | ---------- | ------- | ------------------- |
| `--earth`                  | 30 30% 35% | #6b5c4d | Dark accents        |
| `--earth-foreground`       | 40 30% 97% | #f7f5f2 | Text on earth       |
| `--warm-yellow`            | 42 70% 60% | #e8c06a | Highlights          |
| `--warm-yellow-foreground` | 30 30% 20% | #4d4540 | Text on warm-yellow |
| `--sand`                   | 38 25% 92% | #ece9e4 | Backgrounds         |

### Neutral

| Token                | HSL        | Hex     | Usage             |
| -------------------- | ---------- | ------- | ----------------- |
| `--background`       | 40 30% 97% | #f7f5f2 | Page background   |
| `--foreground`       | 30 20% 20% | #3d3632 | Primary text      |
| `--border`           | 35 20% 88% | #ddd8cf | Borders           |
| `--muted`            | 35 20% 92% | #ece8e0 | Muted backgrounds |
| `--muted-foreground` | 30 10% 45% | #8a817a | Secondary text    |
| `--destructive`      | 0 84% 60%  | #dc2626 | Error states      |

### Dark Mode

| Token                  | HSL         | Hex     |
| ---------------------- | ----------- | ------- |
| `--background`         | 30 20% 10%  | #1a1714 |
| `--foreground`         | 40 20% 90%  | #e6e2df |
| `--primary`            | 140 35% 50% | #5f9a8c |
| `--primary-foreground` | 30 20% 10%  | #1a1714 |

---

## Spacing & Layout

### Container

- Centered with `2rem` padding
- Max width: `1400px` (2xl breakpoint)

### Section Spacing

```css
.section-padding    /* py-16 md:py-24 px-4 md:px-8 */
```

---

## Components

### Border Radius

- Default: `0.75rem` (12px)
- `--radius`: `0.75rem`

### Buttons

- Use `--primary` for main actions
- Use `--accent` for CTAs and highlights

### Cards

- Background: `--card` (40 25% 95%)
- Border: `--border`

---

## Gradients

- **Hero**: `linear-gradient(135deg, hsl(140 35% 35% / 0.9), hsl(140 30% 25% / 0.85))`
- **Sections**: `linear-gradient(180deg, hsl(40 30% 97%), hsl(38 25% 92%))`

---

## Animations

- **Fade Up**: 0.6s ease-out with staggered delays (0.15s, 0.3s, 0.45s)
- **Accordion**: 0.2s ease-out

---

## Tailwind Classes Reference

```css
/* Colors */
bg-primary, text-primary, border-primary
bg-secondary, text-secondary
bg-accent, text-accent
bg-earth, text-earth
bg-warm-yellow
bg-sand
bg-background, text-foreground
bg-muted, text-muted-foreground

/* Typography */
font-heading
font-body
```
