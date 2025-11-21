# @deepgram/styles

A Tailwind-based design system and styles library for Deepgram design system and demos.

## Installation

```bash
npm install @deepgram/styles
# or
pnpm add @deepgram/styles
# or
yarn add @deepgram/styles
```

## Usage

### Basic Usage (Pre-built CSS)

Import the pre-built, minified CSS in your application:

```javascript
import "@deepgram/styles";
```

Or in HTML:

```html
<link rel="stylesheet" href="node_modules/@deepgram/styles/dist/deepgram.css" />
```

### Expanded CSS (Non-minified)

For development or easier debugging:

```javascript
import "@deepgram/styles/expanded";
```

### Using with Tailwind CSS

If you're using Tailwind CSS in your project, you can extend your configuration with the Deepgram theme:

```javascript
// tailwind.config.js
const deepgramConfig = require("@deepgram/styles/tailwind-config");

module.exports = {
  presets: [deepgramConfig],
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    // your content paths
  ],
  // your customizations
};
```

### Importing Source Files

To customize and build the styles yourself:

```css
@import "@deepgram/styles/source";
```

## Configuration

### Base Font Size

The entire design system is based on `rem` units, which scale relative to the root font size. By default, the base font size is set to `16px`. You can customize this by setting the CSS variable `--dg-base-font-size` in your application:

```css
:root {
  --dg-base-font-size: 18px; /* Increase base size to 18px */
}
```

Or target a specific element:

```css
.my-app {
  --dg-base-font-size: 14px; /* Decrease base size to 14px */
}
```

This approach allows for:

- **Accessibility**: Users can adjust font sizes in their browser, and all components scale proportionally
- **Responsive Design**: Change the base font size at different breakpoints for better mobile/desktop experiences
- **Consistency**: All spacing, sizing, and typography scale together

Example for responsive font sizing:

```css
:root {
  --dg-base-font-size: 14px; /* Smaller on mobile */
}

@media (min-width: 768px) {
  :root {
    --dg-base-font-size: 16px; /* Standard on desktop */
  }
}
```

**Note**: The CSS variable defines the base font size, but all measurements internally use `rem` units, ensuring everything scales proportionally when you change this value.

### Brand Colors

The design system uses two primary brand colors that can be customized by setting CSS variables `--dg-primary` and `--dg-secondary` in your application. The gradient borders and glow effects automatically derive from these colors, so you only need to set two variables:

```css
:root {
  --dg-primary: #ff6b35; /* Custom orange */
  --dg-secondary: #4ecdc4; /* Custom teal */
}
```

Or target a specific element:

```css
.my-custom-section {
  --dg-primary: #9b59b6; /* Custom purple */
  --dg-secondary: #3498db; /* Custom blue */
}
```

This allows you to:

- **Brand Consistency**: Easily apply your brand colors across all Deepgram components
- **Theme Variations**: Create different themes or color schemes for different sections
- **Quick Customization**: Override brand colors without rebuilding or forking the library
- **Automatic Gradients**: Gradient borders and glow effects automatically use your custom colors

Example for multiple themes:

```css
/* Default Deepgram theme */
:root {
  --dg-primary: #13ef95; /* Deepgram green */
  --dg-secondary: #149afb; /* Deepgram blue */
}

/* Purple theme - gradient will be blue to purple */
.theme-purple {
  --dg-primary: #a855f7; /* Purple */
  --dg-secondary: #ec4899; /* Pink */
}

/* Ocean theme - gradient will be teal to cyan */
.theme-ocean {
  --dg-primary: #16a085; /* Teal */
  --dg-secondary: #3498db; /* Ocean Blue */
}

/* Sunset theme - gradient will be orange to golden */
.theme-sunset {
  --dg-primary: #ff6b35; /* Orange */
  --dg-secondary: #f7931e; /* Golden */
}
```

**Note**: These colors are used throughout the component library for buttons, links, highlights, gradient borders (secondary → primary), glow effects, and other interactive elements. The primary button's gradient border animates from `--dg-secondary` to `--dg-primary`, creating a cohesive brand experience.

## Available Components

The library provides a comprehensive set of Tailwind-based components following BEM methodology:

### Buttons

- `.dg-btn` - Base button component
- `.dg-btn--primary` - Primary action button with gradient border
- `.dg-btn--secondary` - Secondary action button
- `.dg-btn--ghost` - Transparent button with border
- `.dg-btn--danger-ghost` - Destructive action button
- `.dg-btn--icon-only` - Icon-only button
- `.dg-btn--sm` - Small button variant
- `.dg-btn--collapse` - Responsive mobile-adaptive button

### Cards

- `.dg-card` - Flexible card container
- `.dg-card--compact` - Card with reduced padding
- `.dg-card--spacious` - Card with increased padding
- `.dg-card--bordered` - Card with enhanced border
- `.dg-card--structured` - Card optimized for image/header/body/footer layout
- `.dg-card__image` - Card image container
  - `.dg-card__image--small` - Small height (7.5rem)
  - `.dg-card__image--medium` - Medium height (10rem)
  - `.dg-card__image--large` - Large height (15rem)
  - `.dg-card__image--aspect-4-3` - Responsive 4:3 aspect ratio
- `.dg-card__icon` - Card icon container (for Font Awesome icons)
  - `.dg-card__icon--left` - Left-aligned icon (default)
  - `.dg-card__icon--center` - Center-aligned icon
  - `.dg-card__icon--right` - Right-aligned icon
- `.dg-card__header` - Card header section
- `.dg-card__body` - Card body content section
- `.dg-card__footer` - Card footer actions section
  - `.dg-card__footer--bordered` - Footer with top border

### Layout

- `.dg-section` - Reusable content section
- `.dg-section--compact` - Section with reduced spacing
- `.dg-section--spacious` - Section with increased spacing
- `.dg-section--bordered` - Section with border and background
- `.dg-section--elevated` - Section with shadow
- `.dg-section--fieldset` - Fieldset-style section with legend
- `.dg-constrain-width` - Constrained width container (60rem max)
- `.dg-center-h` - Center content horizontally
- `.dg-grid-mobile-stack` - Responsive grid that stacks on mobile
- `.dg-action-group` - Action button group

#### Multi-Column Layouts

- `.dg-layout-three-column` - Full-height three-column layout with header
- `.dg-layout-three-column__header` - Fixed header section with dark theme
- `.dg-layout-three-column__header-container` - Header inner container (max-width constrained)
- `.dg-layout-three-column__header-logo` - Logo image in header
- `.dg-layout-three-column__header-actions` - Header action buttons container
- `.dg-layout-three-column__header-button` - Icon button in header
- `.dg-layout-three-column__header-profile` - Profile link wrapper
- `.dg-layout-three-column__header-avatar` - Profile avatar image
- `.dg-layout-three-column__main` - Main three-column container
- `.dg-layout-three-column__left-main-wrapper` - Wrapper for left sidebar and main content
- `.dg-layout-three-column__sidebar-left` - Left sidebar (256px on xl screens)
- `.dg-layout-three-column__content` - Main content area (flexible width)
- `.dg-layout-three-column__sidebar-right` - Right sidebar (384px on lg+ screens)

### Hero & Typography

- `.dg-hero` - Hero section container
- `.dg-hero__content` - Hero content wrapper
- `.dg-hero__announcement` - Hero announcement banner
- `.dg-hero__body` - Hero body text
- `.dg-hero__actions` - Hero action buttons
- `.dg-hero-title` - Large gradient hero title
- `.dg-section-heading` - Section heading
- `.dg-card-heading` - Card heading
- `.dg-item-title` - Item title
- `.dg-prose` - Prose text with typography
  - `.dg-prose--large` - Larger prose text
  - `.dg-prose--small` - Smaller prose text
  - `.dg-prose--block` - Full width prose

### Forms

- `.dg-input` - Base text input field
  - Focus state with primary color border
  - Disabled state with reduced opacity
- `.dg-input--inline` - Input with minimum width (12.5rem) for inline forms
- `.dg-input--full` - Override for specific width control
- `.dg-textarea` - Multi-line text input
- `.dg-checkbox` - Custom styled checkbox
  - Animated checkmark on selection
  - Focus state for keyboard navigation
- `.dg-checkbox-label` - Checkbox label wrapper
  - Hover states for better UX
  - Supports inline links
- `.dg-checkbox-description` - Container for checkbox with description text
- `.dg-checkbox-group` - Container for multiple checkboxes
- `.dg-form-field` - Form field container (label + input + helper)
  - Full width on mobile, max-w-md (28rem) on desktop
- `.dg-form-field--full` - Override to make form field full width on all screens
- `.dg-form-field--error` - Error validation state (cascades to children)
- `.dg-form-field--success` - Success validation state (cascades to children)
- `.dg-form-label` - Form field label
- `.dg-form-helper` - Helper or validation message text
- `.dg-form-error` - **Deprecated:** Use `.dg-form-helper` with `.dg-form-field--error` instead
- `.dg-drag-drop-zone` - File upload drag-and-drop area
  - Dashed border indicator
  - Hover and drag-over states
  - Icon, text, and hint sections

### Code & Status

- `.dg-code-block` - Code block container
- `.dg-code-block--compact` - Compact code block
- `.dg-code-block--tall` - Tall code block
- `.dg-code-block--no-scroll` - Code block without scrolling
- `.dg-status` - Status message
  - `.dg-status--info` - Info status
  - `.dg-status--success` - Success status
  - `.dg-status--warning` - Warning status
  - `.dg-status--error` - Error status
  - `.dg-status--primary` - Primary status
  - `.dg-status--secondary` - Secondary status
- `.dg-spinner` - Loading spinner animation
- `.dg-modal-overlay` - Modal overlay backdrop
- `.dg-modal-content` - Modal content container

### Newsletter Components

- `.dg-newsletter-container` - Newsletter container with standard spacing
- `.dg-newsletter-container--compact` - Newsletter container with compact spacing
- `.dg-newsletter-form` - Newsletter form with standard spacing
- `.dg-newsletter-form--compact` - Newsletter form with compact spacing
- `.dg-newsletter-form--inline` - Inline newsletter form (responsive)
- `.dg-newsletter-header` - Newsletter header section (responsive flex layout)
- `.dg-newsletter-header__content` - Newsletter header content area
- `.dg-newsletter-header__actions` - Newsletter header actions area
- `.dg-logo-container` - Centered logo container
- `.dg-logo` - Logo image styling
- `.dg-social-links` - Social links container
- `.dg-social-link` - Individual social link with hover effect

### Typography Utilities

- `.dg-text-tagline` - Centered tagline text (small, muted)
- `.dg-text-subtitle` - Subtitle text (small, muted)
- `.dg-text-heading` - Standard heading text
- `.dg-text-heading--with-margin` - Heading with bottom margin
- `.dg-text-legal` - Legal/fine print text (small, centered)

### Links

- `.dg-link` - Primary link with opacity hover effect

### Utilities

- `.dg-footer` - Page footer
- `.dg-text-center` - Center text alignment
- `.dg-text-danger` - Danger/error text color
- `.dg-text-success` - Success text color
- `.dg-text-warning` - Warning text color
- `.dg-text-primary` - Primary brand color text
- `.dg-text-secondary` - Secondary brand color text
- `.dg-text-muted` - Muted text color
- `.dg-text-fog` - Fog (light gray) text color
- `.dg-text-white` - White text color

## Component Examples

### Structured Card with Image

```html
<div class="dg-card dg-card--structured">
  <div class="dg-card__image dg-card__image--medium">
    <img src="image.jpg" alt="Description" />
  </div>
  <div class="dg-card__header">
    <h3 class="dg-card-heading">Card Title</h3>
  </div>
  <div class="dg-card__body">
    <p class="dg-prose">Card body content goes here.</p>
  </div>
  <div class="dg-card__footer">
    <button class="dg-btn dg-btn--primary">Action</button>
  </div>
</div>
```

### Structured Card with Icon

```html
<div class="dg-card dg-card--structured">
  <div class="dg-card__icon dg-card__icon--left">
    <i class="fas fa-rocket"></i>
  </div>
  <div class="dg-card__header">
    <h3 class="dg-card-heading">Feature Title</h3>
  </div>
  <div class="dg-card__body">
    <p class="dg-prose">Feature description goes here.</p>
  </div>
  <div class="dg-card__footer">
    <button class="dg-btn dg-btn--primary">Learn More</button>
  </div>
</div>
```

Icon alignment options: `--left` (default), `--center`, `--right`

### Button Group

```html
<div class="dg-action-group">
  <button class="dg-btn dg-btn--ghost">Cancel</button>
  <button class="dg-btn dg-btn--primary">Confirm</button>
</div>
```

### Hero Section

```html
<section class="dg-hero">
  <div class="dg-hero__content">
    <h1 class="dg-hero-title">Your Hero Title</h1>
    <p class="dg-hero__body">Your hero description text.</p>
    <div class="dg-hero__actions">
      <button class="dg-btn dg-btn--primary">Get Started</button>
      <button class="dg-btn dg-btn--ghost">Learn More</button>
    </div>
  </div>
</section>
```

### Form Input with Label

```html
<div class="dg-form-field">
  <label for="email" class="dg-form-label">Email Address</label>
  <input type="email" id="email" name="email" placeholder="you@example.com" class="dg-input" />
  <p class="dg-form-helper">We'll never share your email.</p>
</div>
```

### Form Input with Error

```html
<div class="dg-form-field dg-form-field--error">
  <label for="email" class="dg-form-label">Email Address</label>
  <input type="email" id="email" name="email" placeholder="you@example.com" class="dg-input" />
  <p class="dg-form-helper">Please enter a valid email address.</p>
</div>
```

### Form Input with Success

```html
<div class="dg-form-field dg-form-field--success">
  <label for="email" class="dg-form-label">Email Address</label>
  <input type="email" id="email" name="email" value="user@example.com" class="dg-input" />
  <p class="dg-form-helper">Email address is valid.</p>
</div>
```

### Checkbox

```html
<label class="dg-checkbox-label">
  <input type="checkbox" name="agree" class="dg-checkbox" />
  <span>I agree to the terms and conditions</span>
</label>
```

### Checkbox with Link

```html
<label class="dg-checkbox-label">
  <input type="checkbox" name="privacy" class="dg-checkbox" />
  <span>I've read the <a href="/privacy" class="dg-link">Privacy Policy</a></span>
</label>
```

### Checkbox with Description

```html
<label class="dg-checkbox-label">
  <input type="checkbox" name="notifications" class="dg-checkbox" />
  <div class="dg-checkbox-description">
    <span>Enable email notifications</span>
    <span class="dg-form-helper">Get notified about updates and announcements</span>
  </div>
</label>
```

### Newsletter Signup Form

```html
<section class="dg-section dg-section--bordered">
  <div class="dg-newsletter-container--compact">
    <h3 class="dg-text-heading">Subscribe to our newsletter</h3>
    <p class="dg-text-subtitle">Get the latest news and updates delivered to your inbox.</p>
    <form class="dg-newsletter-form--compact">
      <input type="email" placeholder="Enter your email" required class="dg-input" name="email" />
      <button type="submit" class="dg-btn dg-btn--primary">Subscribe</button>
    </form>
  </div>
</section>
```

### File Upload Zone

```html
<div class="dg-drag-drop-zone">
  <input type="file" id="file-upload" name="file" class="dg-drag-drop-zone__input" />
  <div class="dg-drag-drop-zone__icon fas fa-upload"></div>
  <div class="dg-drag-drop-zone__text">Drop file here or click to browse</div>
  <div class="dg-drag-drop-zone__hint">MP3, WAV, M4A up to 500MB</div>
</div>
```

### Three-Column Layout

```html
<div class="dg-layout-three-column">
  <header class="dg-layout-three-column__header">
    <div class="dg-layout-three-column__header-container">
      <img src="logo.svg" alt="Company" class="dg-layout-three-column__header-logo" />
      <div class="dg-layout-three-column__header-actions">
        <button type="button" class="dg-layout-three-column__header-button">
          <span class="dg-sr-only">Notifications</span>
          <!-- Icon SVG -->
        </button>
        <a href="#" class="dg-layout-three-column__header-profile">
          <span class="dg-sr-only">Profile</span>
          <img src="avatar.jpg" alt="" class="dg-layout-three-column__header-avatar" />
        </a>
      </div>
    </div>
  </header>

  <div class="dg-layout-three-column__main">
    <div class="dg-layout-three-column__left-main-wrapper">
      <div class="dg-layout-three-column__sidebar-left">
        <!-- Left sidebar content (navigation, filters, etc.) -->
      </div>
      <div class="dg-layout-three-column__content">
        <!-- Main content area -->
      </div>
    </div>
    <div class="dg-layout-three-column__sidebar-right">
      <!-- Right sidebar content (notifications, info, etc.) -->
    </div>
  </div>
</div>
```

## Theme Colors

The library includes Deepgram brand colors:

- **Primary**: Spring Green (#13ef93)
- **Secondary**: Blue (#149afb)
- **Success**: Green (#12b76a)
- **Warning**: Yellow (#fec84b)
- **Danger**: Red (#f04438)
- **Dark Background**: Charcoal (#1a1a1f)
- **Borders**: Pebble (#4e4e52)

## Responsive Design

All components are mobile-first and responsive:

- Mobile: Single column layouts
- Tablet (md): Two column layouts
- Desktop (lg): Multi-column layouts

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- CSS Custom Properties (CSS Variables) support required

## License

MIT

## Contributing

See the [main repository](https://github.com/deepgram/starter-uis) for contribution guidelines.
