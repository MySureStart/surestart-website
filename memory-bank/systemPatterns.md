# System Patterns: Architecture & Conventions

## Architecture Overview

**Type:** Static HTML website  
**Rendering:** Client-side only (no SSR/SSG framework)  
**Hosting:** GitHub Pages (static file serving)  
**Build Tools:** Node.js scripts for SEO automation (no bundler)

```
surestart-website/
├── index.html                # Homepage
├── about/index.html          # About page (folder-based URL)
├── contact/index.html        # Contact page
├── for-universities/index.html
├── for-students/index.html
├── k12/index.html
├── impact-stories/index.html
├── 403.html, 404.html, etc.  # Error pages
├── assets/
│   ├── css/                  # Stylesheets
│   ├── js/                   # JavaScript files
│   ├── fonts/                # Web fonts
│   ├── images/               # Image assets
│   └── videos/               # Video assets
├── scripts/                  # Node.js automation scripts
├── seo/                      # SEO documentation & data
├── dist/redirects/           # Generated redirect files
├── docs/                     # Operations documentation
└── memory-bank/              # Project documentation
```

---

## HTML Patterns

### Page Structure

All pages follow this consistent structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>[Page Title] — SureStart</title>
  <link rel="stylesheet" href="assets/css/styles.css">
  <link rel="stylesheet" href="assets/css/[page-specific].css">
  <!-- Font preconnects -->
</head>
<body>
  <!-- NAVIGATION -->
  <nav class="navbar" role="navigation">...</nav>
  
  <!-- HERO SECTION -->
  <section class="[page]-hero">...</section>
  
  <!-- CONTENT SECTIONS -->
  <section class="[section-name]">...</section>
  
  <!-- FOOTER -->
  <footer class="footer">...</footer>
  
  <script src="assets/js/script.js"></script>
</body>
</html>
```

### Title Tag Pattern

- Homepage: `SureStart — Shaping Tomorrow's AI Leaders`
- Other pages: `[Page Name] — SureStart`

### Heading Hierarchy

- Each page has exactly **one `<h1>`** (verified in SEO baseline)
- Hero section contains the H1
- Section titles use `<h2>` with class `section-title`
- Subsections use `<h3>`

---

## CSS Patterns

### File Organization

| File | Purpose |
|------|---------|
| `styles.css` | Global styles, variables, shared components |
| `about-us.css` | About Us page specific styles |
| `contact-us.css` | Contact page styles |
| `error-pages.css` | 403, 404, 500, 503 pages |
| `higher-ed.css` | Higher Ed page styles |
| `impact-stories.css` | Impact Stories page styles |
| `k12.css` | K-12 page styles |
| `students.css` | Students page styles |

### Naming Conventions

- **BEM-like classes:** `.hero-title`, `.hero-subtitle`, `.hero-actions`
- **Page prefixes:** `.k12-hero`, `.about-hero`, `.contact-hero`
- **Component classes:** `.btn`, `.btn-primary`, `.btn-secondary`
- **Animation classes:** `.fade-up`

### Common Components

```css
/* Buttons */
.btn { }
.btn-primary { }
.btn-secondary { }

/* Navigation */
.navbar { }
.nav-container { }
.nav-link { }
.nav-dropdown { }

/* Sections */
.section-header { }
.section-title { }
.section-subtitle { }

/* Cards */
.program-flip-card { }
.achievement-card { }
.testimonial-case-card { }
```

---

## JavaScript Patterns

### File Organization

| File | Purpose |
|------|---------|
| `script.js` | Global scripts, navigation, common interactions |
| `impact-stories.js` | Testimonial carousel, animations |
| `k12-scroll.js` | K-12 page scroll interactions |

### Common Patterns

- **Fade animations:** Elements with `.fade-up` class
- **Carousels:** Testimonial rotators with prev/next navigation
- **Modals:** Team member popups (About Us page)
- **Accordions:** FAQ expand/collapse (Contact page)
- **Flip cards:** Program cards with front/back states

---

## Navigation Pattern

### Shared Navigation Component

All pages use identical navigation HTML:

```html
<nav class="navbar" role="navigation">
  <div class="nav-container">
    <div class="nav-brand">
      <a href="index.html">
        <img src="assets/images/logos/surestart/surestart-logo.png" alt="SureStart" class="nav-logo">
      </a>
    </div>
    <div class="nav-menu">
      <a href="index.html" class="nav-link">Home</a>
      <a href="k12.html" class="nav-link">K-12</a>
      <a href="higher-ed.html" class="nav-link">Higher Ed</a>
      <a href="students.html" class="nav-link">Students</a>
      <div class="nav-dropdown">
        <a href="#" class="nav-dropdown-toggle">About Us</a>
        <div class="nav-dropdown-menu">
          <a href="about-us.html">About Us</a>
          <a href="about-us.html#our-team">Our Team</a>
          <a href="impact-stories.html">Impact Stories</a>
        </div>
      </div>
      <a href="contact-us.html" class="nav-link nav-cta">Contact Us</a>
    </div>
    <button class="nav-toggle" aria-label="Toggle menu">...</button>
  </div>
</nav>
```

### Footer Pattern

Consistent footer across all pages with:
- Brand logo and tagline
- Social media links
- Column links (Company, Offerings, Resources)
- Copyright and legal links

---

## Asset Organization

### Images

```
assets/images/
├── heroes/              # Page hero backgrounds
├── icons/               # UI icons, feature icons
├── logos/
│   ├── companies/       # Partner company logos
│   ├── partners/        # Educational partner logos
│   ├── press/           # Media/press logos
│   ├── surestart/       # SureStart brand assets
│   └── universities/    # University logos
├── media/               # Press/podcast images
├── misc/                # Miscellaneous images
├── programs/            # Program card images
├── projects/            # Student project images
├── success-stories/     # Case study images
└── team/                # Team member photos
```

### Videos

```
assets/videos/
├── general/
├── heroes/              # Hero background videos
└── testimonials/        # Student testimonial videos
```

---

## Form Patterns

Contact forms use **Airtable embeds**:

```html
<iframe 
  class="airtable-embed" 
  src="https://airtable.com/embed/[form-id]" 
  frameborder="0" 
  width="100%" 
  height="1000"
  loading="lazy"
></iframe>
```

---

## Responsive Patterns

- Mobile navigation via `.nav-toggle` hamburger menu
- Hero sections have separate desktop/mobile subtitle variants
- Video sections show different layouts for mobile vs. desktop
- Logo marquees auto-scroll with CSS animation

---

## SEO Automation Patterns

### npm Scripts

```bash
# SEO generation
npm run seo:sitemap      # Generate sitemap.xml
npm run seo:robots       # Generate robots.txt (dev mode)
npm run seo:robots:prod  # Generate robots.txt (prod mode)
npm run seo:generate     # Generate both for production
npm run seo:check        # Run SEO smoke test

# Redirect management
npm run redirects:merge     # Merge CSV sources
npm run redirects:validate  # Validate for issues
npm run redirects:build     # Build platform files
npm run redirects:all       # Run all redirect tasks
```

### SEO Smoke Test

The `seo:check` script validates:
- Exactly one `<title>` tag per page
- Meta description exists (public pages)
- Canonical tag exists (public pages)
- Robots meta exists and not noindex (public pages)
- Exactly one `<h1>` tag per page
- No missing alt attributes on images

**Exit codes:** 0 = pass, 1 = failures (CI ready)

### Redirect Output Formats

| File | Platform |
|------|----------|
| `/dist/redirects/_redirects` | Netlify |
| `/dist/redirects/vercel.json` | Vercel |
| `/dist/redirects/nginx.conf` | nginx |

---

## URL Structure Pattern

**Folder-based URLs** (matches legacy Squarespace structure):

| Page | URL | File |
|------|-----|------|
| Home | `/` | `index.html` |
| About | `/about/` | `about/index.html` |
| Contact | `/contact/` | `contact/index.html` |
| For Universities | `/for-universities/` | `for-universities/index.html` |
| For Students | `/for-students/` | `for-students/index.html` |
| K-12 | `/k12/` | `k12/index.html` |
| Impact Stories | `/impact-stories/` | `impact-stories/index.html` |

### Asset Path Pattern (Subfolder Pages)

Subfolder pages use `../` prefix for relative assets:

```html
<!-- In /about/index.html -->
<link rel="stylesheet" href="../assets/css/styles.css">
<img src="../assets/images/logos/surestart/logo.png">
```
