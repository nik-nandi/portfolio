# 2 UI Styling Guide

This document provides a comprehensive overview of the styles, colors, and key measurements used throughout the 2nd Brain application.

## Color Palette

### Primary Colors

| Variable           | Hex Code    | Usage              |
| ------------------ | ----------- | ------------------ |
| `--onyx`         | `#474448` | Text secondary     |
| `--raisin-black` | `#2d232e` | Text primary       |
| `--bone`         | `#e0ddcf` | Background accent  |
| `--wenge`        | `#534b52` | Accent color       |
| `--isabelline`   | `#f1f0ea` | Background primary |

### Weather Panel Colors

| Variable          | Hex Code    | Usage                   |
| ----------------- | ----------- | ----------------------- |
| `--apricot`     | `#ffcdb2` | Weather panel gradient  |
| `--melon`       | `#ffb4a2` | Weather header gradient |
| `--salmon-pink` | `#e5989b` | Weather header gradient |
| `--old-rose`    | `#b5838d` | Temperature text        |
| `--dim-gray`    | `#6d6875` | Weather text, labels    |

### News Panel Colors

| Variable            | Hex Code     | Usage                    |
| ------------------- | ------------ | ------------------------ |
| `--news-accent`    | `#006d77ff` | Caribbean Current - main accent |
| `--news-secondary` | `#83c5beff` | Tiffany Blue - secondary accent |
| `--news-highlight` | `#e29578ff` | Atomic Tangerine - highlights |
| `--news-text`      | `#006d77ff` | Caribbean Current - text color |
| `--news-bg`        | `#edf6f9ff` | Alice Blue - background color |
| `--news-hover`     | `#ffddd2ff` | Pale Dogwood - hover states |

### Theme Colors (Light Mode)

| Variable             | Value                   | Usage                 |
| -------------------- | ----------------------- | --------------------- |
| `--bg-primary`     | `var(--isabelline)`   | Main background       |
| `--bg-secondary`   | `white`               | Component backgrounds |
| `--bg-accent`      | `var(--bone)`         | Accent backgrounds    |
| `--text-primary`   | `var(--raisin-black)` | Main text             |
| `--text-secondary` | `var(--onyx)`         | Secondary text        |
| `--accent-color`   | `var(--wenge)`        | Buttons, highlights   |
| `--border-color`   | `rgba(0, 0, 0, 0.1)`  | Borders, dividers     |
| `--bg-accent-rgb`  | `224, 221, 207`       | Bone color in RGB for transparency |

### Theme Colors (Dark Mode)

| Variable             | Value                        | Usage                 |
| -------------------- | ---------------------------- | --------------------- |
| `--bg-primary`     | `#121212`                  | Main background       |
| `--bg-secondary`   | `#1e1e1e`                  | Component backgrounds |
| `--bg-accent`      | `#2d2d2d`                  | Accent backgrounds    |
| `--text-primary`   | `#f0f0f0`                  | Main text             |
| `--text-secondary` | `#cccccc`                  | Secondary text        |
| `--accent-color`   | `#444054`                  | Buttons, highlights   |
| `--border-color`   | `rgba(255, 255, 255, 0.1)` | Borders, dividers     |

### Weather Dark Mode Colors

| Variable                | Value       | Usage                    |
| ----------------------- | ----------- | ------------------------ |
| `--dark-bg-primary`   | `#1a1a1a` | Weather panel background |
| `--dark-bg-secondary` | `#2a2a2a` | Weather components       |
| `--dark-text`         | `#f0f0f0` | Weather text             |
| `--dark-accent`       | `#ffb4a2` | Weather accents          |
| `--dark-highlight`    | `#e5989b` | Weather highlights       |

### News Dark Mode Colors

| Variable                   | Value       | Usage                    |
| -------------------------- | ----------- | ------------------------ |
| `--news-dark-accent`     | `#425664ff` | Charcoal Blue - accent   |
| `--news-dark-secondary`  | `#2d3748ff` | Slate Gray - secondary   |
| `--news-dark-highlight`  | `#718096ff` | Cool Gray - highlight    |

### Settings Page Colors

| Variable                    | Value                        | Usage                    |
| --------------------------- | ---------------------------- | ------------------------ |
| `--settings-gradient-from` | `var(--accent-color)`      | Settings header gradient |
| `--settings-gradient-to`   | `#744b78`                  | Settings header gradient |
| `--settings-success`       | `#4CAF50`                  | Success message color    |

## Typography

### Font Families

| Variable            | Value                       |
| ------------------- | --------------------------- |
| `--font-primary`  | `"Space Mono", monospace` |
| `--font-headings` | `"Space Mono", monospace` |
| `--font-mono`     | `"Space Mono", monospace` |

### Font Sizes

| Variable             | Value        | Pixel Equivalent |
| -------------------- | ------------ | ---------------- |
| `--font-size-xs`   | `0.75rem`  | 12px             |
| `--font-size-sm`   | `0.875rem` | 14px             |
| `--font-size-base` | `1rem`     | 16px             |
| `--font-size-lg`   | `1.125rem` | 18px             |
| `--font-size-xl`   | `1.25rem`  | 20px             |
| `--font-size-2xl`  | `1.5rem`   | 24px             |
| `--font-size-3xl`  | `1.875rem` | 30px             |
| `--font-size-4xl`  | `2.25rem`  | 36px             |
| `--font-size-5xl`  | `3rem`     | 48px             |

### Font Weights

| Variable                   | Value   |
| -------------------------- | ------- |
| `--font-weight-light`    | `300` |
| `--font-weight-normal`   | `400` |
| `--font-weight-medium`   | `500` |
| `--font-weight-semibold` | `600` |
| `--font-weight-bold`     | `700` |

### Line Heights

| Variable                  | Value    |
| ------------------------- | -------- |
| `--line-height-tight`   | `1.25` |
| `--line-height-normal`  | `1.5`  |
| `--line-height-relaxed` | `1.75` |

### Space Mono Specific

| Variable                      | Value   |
| ----------------------------- | ------- |
| `--font-space-mono-regular` | `400` |
| `--font-space-mono-bold`    | `700` |

## Component Dimensions

### Layout

| Element           | Value         |
| ----------------- | ------------- |
| Content max-width | `1200px`    |
| Console max-width | `1850px`    |
| Navbar padding    | `1rem 2rem` |
| Content padding   | `2rem`      |
| Footer padding    | `1rem`      |

### Chat Components

| Element                         | Value                            |
| ------------------------------- | -------------------------------- |
| Main chat height                | `70vh`                         |
| Side panel height               | `23.1vh` (exactly 33% of main) |
| Chat header padding             | `12px 16px`                    |
| Messages padding                | `1.5rem`                       |
| Message border-radius           | `18px`                         |
| Message max-width               | `70%`                          |
| AI structured message max-width | `85%`                          |

### Button Styles

| Element                   | Value                   |
| ------------------------- | ----------------------- |
| New chat button padding   | `6px 12px`            |
| Send button border-radius | `24px`                |
| Send button padding       | `0 1.5rem`            |
| Scroll to top size        | `50px` (width/height) |
| Dark mode toggle size     | `36px` (width/height) |

### Settings Components

| Element                       | Value                       |
| ----------------------------- | --------------------------- |
| Settings max-width            | `1000px`                  |
| Settings card border-radius   | `12px`                    |
| Toggle switch width           | `50px`                    |
| Toggle switch height          | `26px`                    |
| Category chip border-radius   | `20px`                    |
| Success message padding       | `8px 16px`                |

## Spacing and Animation

### Margins and Paddings

| Usage              | Value    |
| ------------------ | -------- |
| Console panels gap | `20px` |
| Side panels gap    | `15px` |
| Feature cards gap  | `2rem` |
| Messages gap       | `1rem` |

### Animation Durations

| Animation                    | Duration |
| ---------------------------- | -------- |
| Background/color transitions | `0.3s` |
| Page transitions             | `0.5s` |
| Panel expansion              | `0.3s` |
| Button hover/active          | `0.2s` |
| Scroll to top fade           | `0.3s` |
| Weather circle animation     | `1.5s` |

### Animation Keyframes

| Animation      | Description                                   | Usage                      |
| -------------- | --------------------------------------------- | -------------------------- |
| `fadeInScale`  | Fades in elements with a scale from 0.8 to 1 | New message animations     |
| `shimmer`      | Creates shimmering effect for loading states | Weather loading indicators |
| `pulse`        | Subtly pulsates elements to draw attention   | Notification indicators    |
| `rotate`       | Rotates elements for loading spinners        | Loading indicators         |

## Responsive Breakpoints

| Breakpoint         | Value                 | Usage                               |
| ------------------ | --------------------- | ----------------------------------- |
| Large screens      | `max-width: 1200px`   | Layout changes, console direction   |
| Medium screens     | `max-width: 768px`    | Content padding, navigation         |
| Small screens      | `max-width: 480px`    | Navbar, buttons, layout adjustments |
| Extra small screens| `max-width: 320px`    | Mobile-first adjustments            |

## Shadows and Effects

### Box Shadows

| Usage               | Value                              |
| ------------------- | ---------------------------------- |
| Navbar shadow       | `0 2px 4px var(--border-color)`  |
| Footer shadow       | `0 -2px 4px var(--border-color)` |
| Scroll to top       | `0 2px 5px rgba(0, 0, 0, 0.2)`   |
| Secondary box       | `0 4px 12px var(--border-color)` |
| Secondary box hover | `0 8px 20px rgba(0, 0, 0, 0.15)` |
| Feature card        | `0 4px 8px var(--border-color)`  |
| Feature card hover  | `0 6px 12px var(--border-color)` |

### Borders and Radiuses

| Usage                       | Value                             |
| --------------------------- | --------------------------------- |
| Standard border             | `1px solid var(--border-color)` |
| Border radius (large)       | `8px`                           |
| Border radius (medium)      | `4px`                           |
| Chat message radius         | `18px`                          |
| User message special radius | `bottom-right-radius: 4px`      |
| AI message special radius   | `bottom-left-radius: 4px`       |

## Key Numbers

| Metric                    | Value      | Notes                       |
| ------------------------- | ---------- | --------------------------- |
| Chat animation delay      | `600ms`  | Time before new chat starts |
| Weather panel animation   | `2s`     | Full rotation duration      |
| Maximum content width     | `1200px` | Standard layout             |
| Console max width         | `1600px` | Console page layout         |
| Expanded side panel width | `40%`    | When a panel is expanded    |
| Normal side panel width   | `20%`    | Default width               |
| Responsive threshold      | `768px`  | Major layout changes occur  |

## CSS Classes and Patterns

### Common Space Mono Classes

- `.space-mono-regular`
- `.space-mono-bold`
- `.space-mono-regular-italic`
- `.space-mono-bold-italic`

### Animation Classes

- `.visible` (for scroll button)
- `.expanded` (for panels)
- `.loading` (for message indicators)
- `.new-message` (for fade-in animations)
- `.shimmer-effect` (for loading states)

### Reusable Component Classes

- `.messages-container`
- `.chat-header`
- `.message`
- `.user-message`
- `.ai-message`
- `.section-content`
- `.weather-panel`
- `.news-panel`
- `.input-form`

### Panel-Specific Classes

#### Weather Panel
- `.weather-header`
- `.weather-icon`
- `.temperature`
- `.weather-metrics`
- `.forecast-days`
- `.high` & `.low` (temperature indicators)

#### News Panel
- `.news-list`
- `.news-item`
- `.news-title`

#### Main Panel
- `.main-chat`
- `.message-input`
- `.send-button`
- `.new-chat-button`
- `.structured-response`

### Settings Page Classes

- `.settings-section`
- `.settings-card`
- `.setting-item`
- `.toggle-switch`
- `.slider-container`
- `.category-chip`
- `.radio-group`
- `.save-button`
- `.reset-button`

### Interaction Patterns

| Element               | Hover Effect                                 | Active/Click Effect           |
| --------------------- | -------------------------------------------- | ----------------------------- |
| Side panel            | Box shadow increase, subtle transform        | Scale down to 0.98            |
| Buttons               | Brightness increase (1.1)                    | Immediate response feedback   |
| News items            | Background color change, translateY(-2px)    | N/A                           |
| Expand indicators     | Background highlight, scale(1.1)             | N/A                           |
| Settings cards        | translateY(-3px), increased shadow           | N/A                           |
| Save button           | brightness(1.1), translateY(-2px)            | translateY(0)                 |
| Category chips        | translateY(-2px), background opacity change  | N/A                           |
| Slider thumb          | scale(1.2)                                   | N/A                           |
| Pin button            | Slight rotation (15deg) on hover             | Scale down to 0.95 on active   |

### Accessibility Guidelines

- Ensure sufficient color contrast between text and backgrounds.
- Provide focus styles for interactive elements (buttons, links, inputs).
- Use ARIA attributes where necessary to improve screen reader support.
- Maintain scalable fonts and responsive layout to support user zoom.
- Test keyboard navigation on all interactive components.
