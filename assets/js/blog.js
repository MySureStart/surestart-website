/* ==========================================
   BLOG PAGE SCRIPTS
   ----------------------------------------------------------------
   Handles two views from the same script:
     - Listing  (rendered into #blog-grid)        -> /blog/
     - Detail   (rendered into #blog-article)     -> /blog/post.html?slug=...
   Reuses the site's `.fade-up` IntersectionObserver pattern.
   Talks only to window.BlogService (see blog-data.js) so swapping
   to the WordPress REST API is a localized change there.
   ========================================== */

(function () {
  'use strict';

  // ---------- Tiny utilities ----------

  function $(sel, root) { return (root || document).querySelector(sel); }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // The site uses .fade-up + IntersectionObserver in script.js. We can't
  // rely on script.js having already observed dynamically-injected nodes,
  // so we attach a small observer here for nodes we add at runtime.
  function observeFadeUp(scope) {
    var els = (scope || document).querySelectorAll('.fade-up:not(.is-visible)');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // ---------- Listing view ----------

  function renderCard(post) {
    var cats = (post.categories || []).map(function (c) {
      return '<span class="blog-card__category">' + escapeHtml(c.name) + '</span>';
    }).join('');

    var img = post.featuredImage || {};
    // Folder-based URLs (matching the rest of the site: /about/, /k12/, ...).
    // Each post lives at /blog/<slug>/index.html. The legacy
    // /blog/post.html?slug=… still works as a fallback.
    var href = '/blog/' + encodeURIComponent(post.slug) + '/';

    return [
      '<article class="blog-card fade-up">',
      '  <a class="blog-card__media" href="' + href + '" aria-label="' + escapeHtml(post.title) + '">',
      '    <img loading="lazy" decoding="async" src="' + escapeHtml(img.url || '') + '" alt="' + escapeHtml(img.alt || post.title) + '">',
      '  </a>',
      '  <div class="blog-card__body">',
      '    <div class="blog-card__categories">' + cats + '</div>',
      '    <h3 class="blog-card__title"><a href="' + href + '">' + escapeHtml(post.title) + '</a></h3>',
      '    <p class="blog-card__excerpt">' + post.excerpt + '</p>',
      '    <div class="blog-card__meta">',
      '      <span class="blog-card__author">' + escapeHtml((post.author && post.author.name) || '') + '</span>',
      '      <span class="blog-card__dot" aria-hidden="true">&middot;</span>',
      '      <time class="blog-card__date" datetime="' + escapeHtml(post.date) + '">' + escapeHtml(formatDate(post.date)) + '</time>',
      '    </div>',
      '    <a class="btn btn-primary blog-card__cta" href="' + href + '">',
      '      <span>Read Article</span>',
      '      <svg class="btn-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">',
      '        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      '      </svg>',
      '    </a>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function renderList() {
    var grid = $('#blog-grid');
    if (!grid) return;

    grid.setAttribute('aria-busy', 'true');
    window.BlogService.getPosts({ perPage: 24 }).then(function (res) {
      var posts = res.posts || [];
      if (!posts.length) {
        grid.innerHTML = '<p class="blog-empty">No posts yet. Check back soon.</p>';
      } else {
        grid.innerHTML = posts.map(renderCard).join('\n');
      }
      grid.removeAttribute('aria-busy');
      observeFadeUp(grid);
    }).catch(function (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load posts', err);
      grid.innerHTML = '<p class="blog-empty">We couldn\'t load posts right now. Please try again later.</p>';
      grid.removeAttribute('aria-busy');
    });
  }

  // ---------- Detail view ----------

  // Resolve the current post's slug. Order of precedence:
  //   1. window.__POST_SLUG__ baked into the static page (preferred,
  //      used by /blog/<slug>/index.html — survives any clean-URL
  //      rewrites done by static hosts like `npx serve`).
  //   2. ?slug=… query string (fallback for /blog/post.html).
  //   3. Last path segment (e.g. /blog/<slug>/) — useful if the
  //      static page forgets to set __POST_SLUG__.
  function getSlugFromUrl() {
    if (typeof window.__POST_SLUG__ === 'string' && window.__POST_SLUG__) {
      return window.__POST_SLUG__;
    }
    try {
      var params = new URLSearchParams(window.location.search);
      var fromQuery = params.get('slug');
      if (fromQuery) return fromQuery;
    } catch (e) { /* no-op */ }
    // Derive from /blog/<slug>/ or /blog/<slug>
    var path = (window.location.pathname || '').replace(/\/+$/, '');
    var parts = path.split('/').filter(Boolean);
    var blogIdx = parts.indexOf('blog');
    if (blogIdx !== -1 && parts[blogIdx + 1] && parts[blogIdx + 1] !== 'post.html') {
      return parts[blogIdx + 1];
    }
    return '';
  }

  function renderArticle(post) {
    var article = $('#blog-article');
    if (!article) return;

    document.title = post.title + ' | SureStart Blog';
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      // excerpt is plain text (with safe entities); strip any tags just in case
      var desc = String(post.excerpt || '').replace(/<[^>]*>/g, '');
      metaDesc.setAttribute('content', desc);
    }

    var img = post.featuredImage || {};
    var cats = (post.categories || []).map(function (c) {
      return '<span class="blog-article__category">' + escapeHtml(c.name) + '</span>';
    }).join('');
    var tags = (post.tags || []).map(function (t) {
      return '<span class="blog-article__tag">#' + escapeHtml(t.name) + '</span>';
    }).join('');

    // No `fade-up` on detail view: long-form articles read better without
    // scroll-triggered reveals. Listing cards (renderCard) still animate.
    article.innerHTML = [
      '<header class="blog-article__header">',
      '  <a class="blog-article__back" href="/blog/">&larr; Back to Blog</a>',
      '  <div class="blog-article__categories">' + cats + '</div>',
      '  <h1 class="blog-article__title">' + escapeHtml(post.title) + '</h1>',
      '  <div class="blog-article__meta">',
      '    <span class="blog-article__author">By ' + escapeHtml((post.author && post.author.name) || '') + '</span>',
      '    <span class="blog-article__dot" aria-hidden="true">&middot;</span>',
      '    <time datetime="' + escapeHtml(post.date) + '">' + escapeHtml(formatDate(post.date)) + '</time>',
      '  </div>',
      '</header>',
      img.url
        ? '<figure class="blog-article__hero"><img src="' + escapeHtml(img.url) + '" alt="' + escapeHtml(img.alt || post.title) + '"></figure>'
        : '',
      // Optional caption/credit rendered as a sibling <p> below the hero figure.
      // `credit` is intentionally raw HTML (same trust model as `content`) so it
      // can carry an <a> tag. Mock data is author-controlled.
      img.url && img.credit
        ? '<p class="blog-article__hero-credit">' + img.credit + '</p>'
        : '',
      '<div class="blog-article__body">' + post.content + '</div>',
      tags ? '<div class="blog-article__tags">' + tags + '</div>' : '',
      '<div class="blog-article__footer">',
      '  <a class="btn btn-primary" href="/blog/">',
      '    <span>Back to Blog</span>',
      '    <svg class="btn-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">',
      '      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      '    </svg>',
      '  </a>',
      '</div>'
    ].join('\n');
  }

  function renderNotFound(slug) {
    var article = $('#blog-article');
    if (!article) return;
    // Match renderArticle: no fade-up on the detail view.
    article.innerHTML = [
      '<header class="blog-article__header">',
      '  <a class="blog-article__back" href="/blog/">&larr; Back to Blog</a>',
      '  <h1 class="blog-article__title">Post not found</h1>',
      '  <p class="blog-article__meta">We couldn&rsquo;t find a post' + (slug ? ' for &ldquo;' + escapeHtml(slug) + '&rdquo;' : '') + '.</p>',
      '</header>',
      '<div class="blog-article__footer">',
      '  <a class="btn btn-primary" href="/blog/"><span>Browse all posts</span></a>',
      '</div>'
    ].join('\n');
  }

  function renderDetail() {
    var article = $('#blog-article');
    if (!article) return;

    var slug = getSlugFromUrl();
    if (!slug) { renderNotFound(''); return; }

    article.setAttribute('aria-busy', 'true');
    window.BlogService.getPostBySlug(slug).then(function (post) {
      article.removeAttribute('aria-busy');
      if (!post) { renderNotFound(slug); return; }
      renderArticle(post);
    }).catch(function (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load post', err);
      renderNotFound(slug);
    });
  }

  // ---------- Boot ----------

  function init() {
    if (!window.BlogService) {
      // eslint-disable-next-line no-console
      console.error('BlogService not found. Did blog-data.js fail to load?');
      return;
    }
    if ($('#blog-grid')) renderList();
    if ($('#blog-article')) renderDetail();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
