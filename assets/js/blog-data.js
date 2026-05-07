/* ==========================================
   BLOG DATA + SERVICE LAYER
   ----------------------------------------------------------------
   Mock blog data using a WordPress-REST-API-friendly shape.
   The page-level scripts only talk to `window.BlogService`, so
   swapping mock -> live WordPress later is a localized change.
   ----------------------------------------------------------------
   TODO(WordPress): Replace MOCK_POSTS with live WP REST API calls.
     - Endpoint:   `${WP_BASE}/wp-json/wp/v2/posts?_embed&per_page=10`
     - Categories: `${WP_BASE}/wp-json/wp/v2/categories`
     - Tags:       `${WP_BASE}/wp-json/wp/v2/tags`
     - Use mapWpPost(wp) below to transform each WP post into our
       internal shape so blog.js needs no change.
     - Suggested base: read from a global, e.g. window.SS_WP_BASE,
       set via a small <script> tag per environment.
   ========================================== */

(function () {
  'use strict';

  // ---------- Internal helpers (used by mock data below) ----------

  /**
   * Build the post HTML body for the AI Policy article.
   * Kept as a function purely to keep this file readable.
   */
  function aiPolicyContent() {
    // Content is hand-converted from the source Word document into
    // clean semantic HTML (no Word-specific markup, smart-quote artifacts,
    // mso-* classes, or inline font styles). It uses the same elements
    // the rest of the site styles globally (h2/h3/p/ul/ol/strong).
    return [
      '<p>A strong school AI policy should not read like a narrow acceptable-use memo or a temporary reaction to AI tools being used ad hoc by members of the school community; instead it should function as a governance system that:</p>',
      '<ul>',
      '  <li>aligns with the institution&rsquo;s mission, vision, and values,</li>',
      '  <li>defines who may use which tools and under what conditions,</li>',
      '  <li>protects student and staff data,</li>',
      '  <li>redesigns assessment for an AI-enabled environment,</li>',
      '  <li>builds role-specific literacy, and</li>',
      '  <li>continuously reviews evidence, incidents, and equity impacts.</li>',
      '</ul>',
      '<p>Towards creating such an institutionally aligned, purpose-driven, operationally clear, and risk-aware AI Policy, here are our recommendations. Each recommendation identifies what the policy should explicitly specify to ensure clarity, consistency, and effective implementation.</p>',

      '<h2>1. Start with Purpose</h2>',
      '<p>A strong AI policy should define the role AI is expected to play in teaching, learning, and institutional operations, grounded in the school&rsquo;s mission, vision, and values.</p>',
      '<p><strong>The policy should specify the following:</strong></p>',
      '<ul>',
      '  <li>How AI advances the school&rsquo;s long-term vision for students, educators, and the broader school community.</li>',
      '  <li>What AI is intended to support in teaching, learning, and school operations (i.e., specific use cases and areas of application).</li>',
      '  <li>A set of principles that will guide how AI is used across the school (e.g., future-readiness, integrity, student agency, or innovation mindset).</li>',
      '  <li>The school&rsquo;s stance on the role of AI in learning (e.g., to amplify student creativity and support teacher expertise, with humans retaining agency in all high-stakes decisions).</li>',
      '</ul>',

      '<h2>2. Explicitly Defined Governance</h2>',
      '<p>An AI policy should not be static; instead it should be a living system with clear ownership that is reviewed and updated regularly, in step with changes in technology, the school&rsquo;s goals, and external regulations.</p>',
      '<p><strong>The policy should specify the following:</strong></p>',
      '<ul>',
      '  <li>A formally defined governance structure (e.g., AI task force, committee, or designated lead).</li>',
      '  <li>Specific roles and responsibilities for enforcement, updates, and decision-making.</li>',
      '  <li>An established review cadence (e.g., every 6&ndash;12 months).</li>',
      '  <li>Alignment with local/country-wide educational regulations and standards.</li>',
      '</ul>',

      '<h2>3. Risk-Based Approach to AI Use</h2>',
      '<p>Not all AI use carries the same level of risk. Treating all use cases the same leads to either over-restriction or unsafe adoption.</p>',
      '<p><strong>The policy should specify the following:</strong></p>',
      '<ul>',
      '  <li>AI use categorized into risk-tiers (e.g., low, medium, high risk).</li>',
      '  <li>Examples of each risk-tier.</li>',
      '  <li>Tie each risk tier to review depth, evidence expectations, and monitoring requirements.</li>',
      '  <li>Provide explicit guardrails:',
      '    <ul>',
      '      <li>Human oversight required for high-risk uses, with humans retaining agency and responsibility for outcomes.</li>',
      '      <li>Certain uses fully prohibited (e.g., sensitive data input, sole-AI decisions).</li>',
      '    </ul>',
      '  </li>',
      '</ul>',

      '<h2>4. Clarity in Classroom Use</h2>',
      '<p>Ambiguity creates inconsistency across classrooms and confusion for students.</p>',
      '<p><strong>The policy should specify the following:</strong></p>',
      '<ul>',
      '  <li>Precise definition of acceptable AI use in academic work.</li>',
      '  <li>Requirement that assignments specify AI conditions such as:',
      '    <ul>',
      '      <li>Not allowed</li>',
      '      <li>Allowed with disclosure</li>',
      '      <li>Required</li>',
      '    </ul>',
      '  </li>',
      '  <li>Clear expectations for student disclosure.</li>',
      '  <li>Consistent expectations across departments.</li>',
      '</ul>',

      '<h2>5. Assessment Redesign Over AI-Policing</h2>',
      '<p>The most recent guidance on assessments focuses on redesigning assessment and clarifying disclosure rules rather than on policing students with unreliable AI-detectors&mdash;the latter has been shown to unfairly misclassify non-native English writing.</p>',
      '<p><strong>The policy should thus specify the following:</strong></p>',
      '<ul>',
      '  <li>Explicitly stated rules for AI use in assessments.</li>',
      '  <li>Explicit policy that AI detection tools are <strong>not</strong> used as sole evidence of misconduct.</li>',
      '  <li>Encouragement for assessment redesign that requires:',
      '    <ul>',
      '      <li>Process documentation</li>',
      '      <li>Reflection and reasoning</li>',
      '      <li>Iteration and critique</li>',
      '      <li>Reduced emphasis on final outputs alone</li>',
      '    </ul>',
      '  </li>',
      '</ul>',

      '<h2>6. Data Privacy and Security as a Baseline</h2>',
      '<p>Without clear policies, AI can introduce privacy risks around student data, and mistakes here have serious legal and reputational consequences.</p>',
      '<p><strong>The policy should specify the following:</strong></p>',
      '<ul>',
      '  <li>No sensitive data in unapproved tools&mdash;with definition and examples of &ldquo;sensitive data&rdquo; provided.</li>',
      '  <li>Defined criteria for approved tools.</li>',
      '  <li>No vendor use of school data for training or product development unless explicitly authorized and lawful.</li>',
      '</ul>',

      '<h2>7. Safety and Incident Readiness</h2>',
      '<p>AI-related risks that come from hallucinated outputs, errors, and unintended negative consequences&mdash;or even intentional harms from bad actors&mdash;must be anticipated and managed proactively.</p>',
      '<p><strong>The policy should specify the following:</strong></p>',
      '<ul>',
      '  <li>Definition of AI-related incidents.</li>',
      '  <li>Assigned responsibility for handling incidents.</li>',
      '  <li>Reporting and response protocols.</li>',
      '  <li>Guidance for handling incidents consistently and quickly.</li>',
      '  <li>Learnings from incidents inform future policy updates.</li>',
      '</ul>',

      '<h2>8. Equity and Access</h2>',
      '<p>AI can amplify or reinforce existing disparities and inequities if not intentionally managed. So a strong AI policy must consider equity and inclusion from the beginning.</p>',
      '<p><strong>The policy should specify the following:</strong></p>',
      '<ul>',
      '  <li>AI tools used in classrooms must be accessible for all students across diverse needs and contexts, or there must be provision for alternatives, as appropriate.</li>',
      '  <li>Plan for digital divide mitigation, if needed.</li>',
      '  <li>Bias-checking practices when using AI tools.</li>',
      '</ul>',

      '<h2>9. Capacity Building and Community Engagement</h2>',
      '<p>A clear, shared understanding of the AI policy across students, teachers, and families is needed for consistent implementation, responsible use, and effective adoption.</p>',
      '<p><strong>The policy should specify the following:</strong></p>',
      '<ul>',
      '  <li>Required baseline AI literacy training for all staff and students.</li>',
      '  <li>Role-specific training for teachers and leadership.</li>',
      '  <li>Structured guidance for students.</li>',
      '  <li>Parent information sessions.</li>',
      '  <li>Established feedback loops for community input into policy evolution.</li>',
      '</ul>',

      '<h2>10. Innovation with Guardrails</h2>',
      '<p>A future-focused school must enable experimentation while managing risk.</p>',
      '<p><strong>The policy should specify the following:</strong></p>',
      '<ul>',
      '  <li>Guardrails for safe experimentation.</li>',
      '  <li>A &ldquo;sandbox&rdquo; for testing new AI tools in controlled and supported settings.</li>',
      '  <li>A process for scaling or discontinuing tools.</li>',
      '</ul>',

      '<h2>11. Operational Clarity (recommended as an addendum)</h2>',
      '<p>Since new AI tools and technologies are developing rapidly, as an addendum to the school&rsquo;s AI policy a school must provide operational clarity on how teachers, students, or other school personnel may get clarity on which tools are approved for use, and how they can submit new tools for approval.</p>',
      '<p><strong>The policy addendum should specify the following:</strong></p>',
      '<ul>',
      '  <li>A clear workflow for approving AI tools:',
      '    <ul>',
      '      <li>Proposal</li>',
      '      <li>Review</li>',
      '      <li>Pilot</li>',
      '      <li>Decision to scale or stop</li>',
      '    </ul>',
      '  </li>',
      '  <li>Role-specific guidance for:',
      '    <ul>',
      '      <li>Teachers</li>',
      '      <li>Students</li>',
      '      <li>Non-instructional staff</li>',
      '    </ul>',
      '  </li>',
      '  <li>A maintained list of approved tools.</li>',
      '</ul>'
    ].join('\n');
  }

  // ---------- Mock data (WordPress-friendly shape) ----------

  /**
   * @typedef {Object} BlogPost
   * @property {number} id
   * @property {string} slug
   * @property {string} title
   * @property {string} excerpt           Short summary (plain text, < ~200 chars)
   * @property {string} content           Article body as HTML string
   * @property {string} date              ISO 8601 date (YYYY-MM-DD)
   * @property {{name:string, avatar?:string}} author
   * @property {{url:string, alt:string}} featuredImage
   * @property {Array<{id:number,name:string,slug:string}>} categories
   * @property {Array<{id:number,name:string,slug:string}>} tags
   */

  /** @type {BlogPost[]} */
  var MOCK_POSTS = [
    {
      id: 1,
      slug: 'best-practices-for-building-a-strong-ai-policy',
      title: 'Best Practices for Building a Strong AI Policy',
      excerpt:
        'A strong school AI policy is more than an acceptable-use memo&mdash;it is a living governance system. Here are eleven recommendations for building one that is purpose-driven, risk-aware, and equity-centered.',
      content: aiPolicyContent(),
      date: '2026-05-07',
      author: {
        name: 'Taniya Mishra',
        avatar:
          'https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/logos/surestart/surestart-logo.png'
      },
      featuredImage: {
        url: 'https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/heroes/our-story.jpg',
        alt: 'Students collaborating on an AI project'
      },
      categories: [
        { id: 11, name: 'AI Policy', slug: 'ai-policy' },
        { id: 12, name: 'K-12', slug: 'k12' }
      ],
      tags: [
        { id: 101, name: 'governance', slug: 'governance' },
        { id: 102, name: 'schools', slug: 'schools' },
        { id: 103, name: 'responsible-ai', slug: 'responsible-ai' },
        { id: 104, name: 'assessment', slug: 'assessment' }
      ]
    }
    // TODO(WordPress): additional posts will come from the WP REST API.
    // Until then, add new mock posts here following the BlogPost shape above.
  ];

  // ---------- WordPress -> internal-shape mapper (currently unused) ----------

  /**
   * Map a single post returned from WP REST (`?_embed`) into our internal shape.
   * Wire this up when switching from MOCK_POSTS to a live API.
   *
   * TODO(WordPress): call this from getPosts/getPostBySlug once the API is live.
   *
   * @param {any} wp  Raw WP REST API post object (with _embedded fields)
   * @returns {BlogPost}
   */
  function mapWpPost(wp) {
    var embedded = wp && wp._embedded ? wp._embedded : {};
    var media = (embedded['wp:featuredmedia'] || [])[0] || null;
    var authorObj = (embedded.author || [])[0] || null;
    var termGroups = embedded['wp:term'] || [];

    var categories = [];
    var tags = [];
    termGroups.forEach(function (group) {
      group.forEach(function (term) {
        var item = { id: term.id, name: term.name, slug: term.slug };
        if (term.taxonomy === 'category') categories.push(item);
        else if (term.taxonomy === 'post_tag') tags.push(item);
      });
    });

    return {
      id: wp.id,
      slug: wp.slug,
      title: (wp.title && wp.title.rendered) || '',
      excerpt: stripHtml((wp.excerpt && wp.excerpt.rendered) || ''),
      content: (wp.content && wp.content.rendered) || '',
      date: (wp.date || '').slice(0, 10),
      author: {
        name: authorObj ? authorObj.name : 'SureStart',
        avatar: authorObj && authorObj.avatar_urls ? authorObj.avatar_urls['96'] : undefined
      },
      featuredImage: {
        url: media ? media.source_url : '',
        alt: media ? media.alt_text || '' : ''
      },
      categories: categories,
      tags: tags
    };
  }

  function stripHtml(html) {
    return String(html || '').replace(/<[^>]*>/g, '').trim();
  }

  // ---------- Public service ----------

  var BlogService = {
    /**
     * Get a paginated list of posts.
     * @param {{page?:number, perPage?:number, category?:string, tag?:string}} [opts]
     * @returns {Promise<{posts: BlogPost[], total: number}>}
     */
    getPosts: function (opts) {
      // TODO(WordPress): replace body with:
      //   return fetch(`${WP_BASE}/wp-json/wp/v2/posts?_embed&per_page=${perPage}&page=${page}` + filters)
      //     .then(r => r.json())
      //     .then(arr => ({ posts: arr.map(mapWpPost), total: arr.length }));
      opts = opts || {};
      var perPage = opts.perPage || 12;
      var page = opts.page || 1;

      var list = MOCK_POSTS.slice();
      if (opts.category) {
        list = list.filter(function (p) {
          return p.categories.some(function (c) { return c.slug === opts.category; });
        });
      }
      if (opts.tag) {
        list = list.filter(function (p) {
          return p.tags.some(function (t) { return t.slug === opts.tag; });
        });
      }
      // Newest first
      list.sort(function (a, b) { return a.date < b.date ? 1 : -1; });

      var total = list.length;
      var start = (page - 1) * perPage;
      return Promise.resolve({
        posts: list.slice(start, start + perPage),
        total: total
      });
    },

    /**
     * Get a single post by slug.
     * @param {string} slug
     * @returns {Promise<BlogPost|null>}
     */
    getPostBySlug: function (slug) {
      // TODO(WordPress): replace with:
      //   return fetch(`${WP_BASE}/wp-json/wp/v2/posts?_embed&slug=${encodeURIComponent(slug)}`)
      //     .then(r => r.json())
      //     .then(arr => arr[0] ? mapWpPost(arr[0]) : null);
      var match = MOCK_POSTS.filter(function (p) { return p.slug === slug; })[0];
      return Promise.resolve(match || null);
    },

    /**
     * @returns {Promise<Array<{id:number,name:string,slug:string}>>}
     */
    getCategories: function () {
      // TODO(WordPress): GET /wp/v2/categories
      var seen = {};
      var out = [];
      MOCK_POSTS.forEach(function (p) {
        p.categories.forEach(function (c) {
          if (!seen[c.slug]) { seen[c.slug] = true; out.push(c); }
        });
      });
      return Promise.resolve(out);
    },

    /**
     * @returns {Promise<Array<{id:number,name:string,slug:string}>>}
     */
    getTags: function () {
      // TODO(WordPress): GET /wp/v2/tags
      var seen = {};
      var out = [];
      MOCK_POSTS.forEach(function (p) {
        p.tags.forEach(function (t) {
          if (!seen[t.slug]) { seen[t.slug] = true; out.push(t); }
        });
      });
      return Promise.resolve(out);
    },

    // Exposed only for the future WP swap; not used by page scripts today.
    _mapWpPost: mapWpPost
  };

  // Expose on window for the static, no-bundler setup used by this site.
  window.BLOG_POSTS = MOCK_POSTS;
  window.BlogService = BlogService;
})();
