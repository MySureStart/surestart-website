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

  /**
   * Build the post HTML body for the Goal Setting Strategies article.
   */
  function goalSettingContent() {
    // Hand-converted from the source Word document. Same approach as
    // aiPolicyContent above: no Word-specific markup, smart-quote artifacts,
    // mso-* classes, or inline font styles. Editorial metadata from the
    // original publication (image credit, "Reviewed by", cross-promo links)
    // is intentionally omitted; the "Summary:" block is exposed via the
    // post.excerpt field rather than duplicated in the body.
    return [
      '<p><em>Original article published by <a href="https://builtin.com/articles/goal-setting-strategies">Built In </a></em> <br><br> Research shows that following a structured framework makes accomplishing your goals far more likely. Here are some of the most proven strategies.</p>',
      '<p>We&rsquo;re all navigating increasingly complex and speculative futures, brought on by AI disruption, fast-changing workplace expectations, and geopolitical upheavals. In this context, goal setting can provide a huge benefit: a structured pathway to our pursuit of fulfilling and financially sustainable careers that balance knowns with unknowns, growth with experience, and experimentation with opportunities.</p>',

      '<h2>6 Effective Goal-Setting Strategies</h2>',
      '<ul>',
      '  <li>SMART goals</li>',
      '  <li>OKRs</li>',
      '  <li>The WOOP method</li>',
      '  <li>Backcasting</li>',
      '  <li>HARD goals</li>',
      '  <li>BHAG goals</li>',
      '</ul>',

      '<h2>Why Goal Setting Improves Results</h2>',
      '<p>Extensive research attests to the effectiveness of explicitly setting goals. Psychologist Elliot Berkman defines goals as desired outcomes that would not happen without effort and action. We want to achieve them, but they are at least a bit difficult to attain. He presents strong evidence that goal-setting strategies that align our motivational processes (desiring a particular outcome over others) to our cognitive processes (knowledge, skills, and strategies for taking needed action) can help us accomplish things.</p>',
      '<p>A separate study by Gail Matthews showed that explicitly writing your goals down, taking action, and maintaining accountability increased the chances of achieving desired outcomes by 33 percent compared to not taking such measures. Clearly, following a structured framework for your goals can help to accomplish them.</p>',

      '<h2>6 Goal Setting Frameworks</h2>',
      '<p>With the aforementioned benefits of goal-setting in mind, let&rsquo;s explore some established frameworks to operationalize the practice of setting and achieving goals.</p>',

      '<h3>SMART</h3>',
      '<p>SMART is a framework for setting goals using Specific, Measurable, Achievable, Realistic, and Time-bound as structured criteria. Management consultant George Doran first presented the framework in the early 1980s as a way to improve goal clarity for managers, and people in professional and educational settings have used it to turn ill-defined intentions into clear and measurable goals ever since.</p>',
      '<p>The highly structured nature of SMART goals makes them particularly suitable for goals that you can achieve within a few months at most. They&rsquo;re also useful in contexts that require swift execution. That&rsquo;s because the framework offers clearly defined criteria for goal definition, specified time-frames, and accountability for follow-through.</p>',
      '<h4>SMART Goal Example</h4>',
      '<p>An example of a SMART goal is &ldquo;I will increase my sales calls by 10 per week to generate five additional qualified leads per month for the next three months.&rdquo;</p>',
      '<p>This goal maps to the SMART framework by being specific (&ldquo;increase my sales calls&rdquo; is a specific action), measurable (&ldquo;10 per week&rdquo; and &ldquo;five additional qualified leads per month&rdquo; assign particular numbers that you can track), achievable (as increasing the number of sales calls by 10 per week isn&rsquo;t unrealistic), relevant (&ldquo;five additional qualified leads per month&rdquo; is very relevant for revenue growth), and time-bound (&ldquo;for the next three months&rdquo; establishes a clear end point).</p>',

      '<h3>OKRs</h3>',
      '<p>OKRs, which stands for Objectives and Key Results, are another commonly used goal-setting framework within companies. In this framework, individuals measure the achievement of goals&mdash;referred to as objectives&mdash;by one or more key results.</p>',
      '<p>Former Intel CEO Andy Grove created the OKR framework. John Doerr later popularized it in his book <em>Measure What Matters</em>, which highlights how setting OKR goals helped corporations like Intel, Google, and others achieve significant and sustained growth.</p>',
      '<p>OKRs and SMART goals are both used extensively in corporate settings, but they differ in terms of structure and purpose. SMART goals are designed to be highly specific, while OKRs are expected to be more aspirational and less tightly defined. Thus, in practice, SMART goals are a better fit for expectedly achievable goals, whereas OKRs are better suited for stretch goals. Given their broader scope and because more than one key result may be associated with a single OKR objective, this approach may take longer to achieve than SMART goals.</p>',
      '<h4>OKR Example</h4>',
      '<p>The OKR formula looks like this: I will do X as measured by Y. An example OKR is as follows:</p>',
      '<ul>',
      '  <li><strong>Objective:</strong> Increase company&rsquo;s revenue.',
      '    <ul>',
      '      <li><strong>Key Result 1:</strong> Generate 200 new leads each quarter.</li>',
      '      <li><strong>Key Result 2:</strong> Increase weekly sales calls from 30 to 50.</li>',
      '      <li><strong>Key Result 3:</strong> Improve conversion rate from 15 to 20 percent.</li>',
      '      <li><strong>Key Result 4:</strong> Close $1M in yearly sales.</li>',
      '    </ul>',
      '  </li>',
      '</ul>',

      '<h3>The WOOP Method</h3>',
      '<p>The WOOP method, which stands for &ldquo;Wish, Outcome, Obstacle, and Plan,&rdquo; is a goal-setting method developed by psychologists Gabriele Oettingen and Peter M. Gollwitzer from New York University. It has four main steps: identifying your wish, envisioning the best outcome, anticipating any obstacles that may get in the way, and building a specific plan to achieve the outcome.</p>',
      '<p>The WOOP method is effective not just for professional settings but also more broadly for younger students and patients pursuing long-term health goals. The scientific evidence for this method is detailed in <em>Rethinking The Positive</em> by Gabriele Oettingen.</p>',
      '<p>What is particularly attractive about the WOOP approach is that it does not tell us to do away with our wishing or dreaming; instead, it gives us a pathway to turn our dreams into reality. WOOP is useful for bridging longer-term and deeply felt aspirations to short- to medium-term tactical goals.</p>',
      '<h4>WOOP Example</h4>',
      '<p>For example, your wish may be to increase team productivity this quarter. The outcome you desire is for the team to consistently meet their deadlines and complete projects more efficiently to drive a 20 percent increase in the number of projects completed per week. A potential obstacle blocking this outcome is that you tend to avoid addressing performance issues and let delays slide. So, the concrete plan you develop is this: when you are reviewing project progress, if you notice a missed deadline, then you will address it with the person responsible within 24 hours with clear expectations and next steps to get the project back on track.</p>',

      '<h3>Backcasting</h3>',
      '<p>Backcasting, also sometimes called mirror planning, is a goal-setting approach that starts with defining an ideal future outcome and working backward with intervening milestones to figure out how to get there, including possible obstacles and ways to overcome them. Dr. John B. Robinson formally presented the concept of backcasting in the 1990s as part of his futures planning research.</p>',
      '<p>There are three main components to a backcast plan: a defined future vision with a target completion date, intervening milestones with dates, and possible challenges with mitigation plans. Thus, backcasting, by its very definition, is best suited for goals that are large and far enough out that they require some speculative planning. Compared with forward planning, research shows that backward planning produced greater motivation, higher expectation of success, lower time pressure, and better outcomes.</p>',
      '<h4>Backcasting Example</h4>',
      '<p>Here&rsquo;s a small business example that starts with a future goal and then breaks it down into immediate and near-term milestones:</p>',
      '<ul>',
      '  <li><strong>Future goal:</strong> Consistently make $100,000 per year in revenue.</li>',
      '  <li><strong>End of year milestone:</strong> $100,000 total revenue.</li>',
      '  <li><strong>Six-month mark milestone:</strong> $50,000 revenue with consistent monthly sales.</li>',
      '  <li><strong>Four-month mark milestone:</strong> First steady customers.</li>',
      '  <li><strong>Two-month mark milestone:</strong> Secure your first three customers.</li>',
      '  <li><strong>One-month mark milestone:</strong> Finalize messaging and pricing.</li>',
      '  <li><strong>Right now:</strong> Define product/service, begin price discovery, and test messaging.</li>',
      '</ul>',

      '<h3>HARD Goals</h3>',
      '<p>HARD goals refer to a framework where goals are Heartfelt, Animated, Required, and Difficult. Mark Murphy introduced this framework in his 2009 book <em>Hundred Percenters: Challenge Your Employees to Give It Their All and They&rsquo;ll Give You Even More</em>. Murphy came up with this after observing the phenomenon that, despite following the steps, employees were disengaging from traditional goal-setting approaches.</p>',
      '<p>Murphy&rsquo;s thesis was that people would be more likely to stay engaged and persist over a longer duration if their goals were emotionally compelling. To achieve the latter, a HARD goal must be connected to a person&rsquo;s core beliefs (heartfelt), vividly visualized in one&rsquo;s mind (animated), feel necessary and urgent (required), and push for growth beyond one&rsquo;s comfort zone (difficult). Given the focus on heartfelt and difficult-to-achieve goals, pursuing HARD goals tends to be most feasible over medium- to long-term timeframes.</p>',
      '<h4>HARD Goal Example</h4>',
      '<p>An example of a HARD goal is &ldquo;Increase employee retention by 15 percent over the next 12 months through implementing regular career development check-ins.&rdquo;</p>',
      '<p>This goal maps to the HARD framework by being heartfelt as increased retention positively impacts employee morale and company culture, animated as fewer exits can be visualized as a stable, high-morale, closely bonded team, required as stability is critical to an organization&rsquo;s growth, and difficult as achieving a 15 percent improvement in retention in 12 months will demand significant lift from managers in terms of prioritization, time investment, and follow-through.</p>',

      '<h3>BHAG Goals</h3>',
      '<p>BHAG (pronounced bee-hag) stands for Big Hairy Audacious Goals. BHAG goals were first introduced by Jim Collins and Jerry Porras in their book <em>Built to Last: Successful Habits of Visionary Companies</em>.</p>',
      '<p>The purpose of BHAGs is to engender transformational, long-term change within organizations over substantial timeframes, on the order of 10 to 25 years.</p>',
      '<p>There can be different types of BHAG: the most common are <strong>target-oriented BHAGs</strong>, which aim for measurable outcomes over a particular time-frame; <strong>competitive BHAGs</strong>, which involve outperforming a rival; <strong>role-model BHAGs</strong>, which focus on a role model and setting a goal to emulate their success; and <strong>transformation BHAGs</strong>, which involve organization-wide transformations such as pivoting the business model, overhauling the organization structure, or altering the growth strategy.</p>',
      '<h4>BHAG Example</h4>',
      '<p>For example, a small business might set a target-oriented BHAG to grow its company from a local business into a nationwide brand serving customers in all 50 states within 20 years. It&rsquo;s a lofty, long-term goal, but one that is exciting to rally a team around.</p>',

      '<h2>Choosing Appropriate Goal Setting Frameworks</h2>',
      '<p>The goal-setting framework one chooses depends on a number of contextual factors.</p>',
      '<p>Are you setting a professional goal? If so, perhaps SMART or OKRs, which are the most proven in professional settings, might be the most apt. If the goal is overarching with multifaceted results, however, SMART might be too narrow, so OKRs are the right framework to capture its complexity. Are you making a personal decision? If so, perhaps the WOOP method, which has been widely used by individuals for personal decision-making, would be the best fit.</p>',
      '<p>Are you making a significant transformation at the personal, familial, or organizational level that will likely take several years? If so, a BHAG is what you should plan for. Will the path to achieving the final outcome have some uncertainties? Then consider making a backcasting plan.</p>',
      '<p>You should also consider which framework resonates with your personality. If you thrive on structure, one of the more constrained frameworks like SMART may be a great fit. If you see yourself as a dreamer, perhaps you&rsquo;ll be drawn to WOOP. If you find yourself bored with activities that are too easy or need your work to be closely aligned to your values to feel motivated, HARD may prove to be the framework that helps you achieve the best outcomes.</p>',
      '<p>There may even be a complex goal that requires using two frameworks. For example, you may have a BHAG where you achieve sub-goals using one of the other frameworks. Taken together, no one framework works for every goal or every person.</p>',

      '<h2>Common Goal-Setting Mistakes</h2>',
      '<p>What could go wrong with goal setting? Let me identify some common mistakes and how we might avoid them.</p>',

      '<h3>Setting Too Many Goals at Once</h3>',
      '<p>The first mistake people make is setting too many goals at the same time. This can quickly become overwhelming and derail progress. So, consider your goals carefully, prioritize them in the order of importance, and then pick one or two that you aim to achieve.</p>',

      '<h3>Unclear Reasoning</h3>',
      '<p>Second, not spending enough time asking why something is important and who it is important for. Sometimes we set goals that are important to other people we care about, but not necessarily to us. Remember, goals that don&rsquo;t truly motivate may not get the effort they require.</p>',

      '<h3>Too Easy or Too Hard</h3>',
      '<p>Motivation brings me to the third common mistake: not finding the &ldquo;zone of productive struggle&rdquo;&mdash;goals that are too easy won&rsquo;t hold our interest over time, and unrealistically difficult goals may deflate and discourage us. To find the right balance, ask yourself: does more than 50 percent of the goal feel achievable even if it requires stretching, effort, and learning? Does 100 percent feel achievable? If the answer to the first is yes and to the second is no, you may be in the right zone.</p>',

      '<h3>Not Setting Subgoals to Enjoy the Process</h3>',
      '<p>A final mistake we commonly make, especially when our goals take a while to reach, is that we start fixating on the mountain top and not on the climb, thus risking losing the excitement, the drive, and the joy that got us started. To avoid it, set intervening milestones, regularly track progress, learn from mistakes, and celebrate small wins.</p>',
      '<p>In reality, most meaningful goals are not a single event. Rather, they are a series of interdependent events that we achieve over time. So, if the process of goal achievement feels slow, if it requires multiple iterations, or if the path occasionally feels unclear, don&rsquo;t give up&mdash;remember that the final outcome is just the visible moment; the real work is everything you do leading up to it.</p>',

      '<h2>Frequently Asked Questions</h2>',

      '<h3>What are the most effective goal-setting strategies?</h3>',
      '<p>There are a number of goal-setting strategies that have been shown to be effective. We discuss SMART, OKRs, the WOOP method, backcasting, HARD goals, and BHAG in this article.</p>',

      '<h3>What is the SMART goal strategy?</h3>',
      '<p>SMART is a framework for setting goals using Specific, Measurable, Achievable, Realistic, and Time-bound as structured criteria. The highly structured nature of SMART goals makes them particularly suitable for goals that you can achieve within a few months at most. They&rsquo;re very useful in contexts that require swift execution because the framework offers clearly defined criteria for goal definition, specified time-frames, and accountability for follow-through.</p>',

      '<h3>What is the difference between OKRs and SMART goals?</h3>',
      '<p>OKRs and SMART goals are both used extensively in corporate settings, but they differ in terms of structure and purpose. SMART goals are designed to be highly specific, while OKRs are expected to be more aspirational and less tightly defined. Thus, in practice, SMART goals are a better fit for expectedly achievable goals, whereas OKRs are better suited for stretch goals.</p>',

      '<h3>Why do goal-setting strategies improve success?</h3>',
      '<p>Using evidence-based goal-setting strategies improves the chances of success because they turn vague or ill-defined intentions into explicitly defined goals with measurable outcomes accompanied by structured action plans.</p>'
    ].join('\n');
  }

  /**
   * Build the post HTML body for the Vibe Coding article.
   */
  function vibeCodingContent() {
    // Hand-converted from the source Word document. Same approach as
    // aiPolicyContent / goalSettingContent above: clean semantic HTML, no
    // Word-specific markup or smart-quote artifacts. Byline (author, date)
    // is exposed via structured fields rather than duplicated in the body.
    // The trailing "https://mysurestart.com/vibe-lab" line is removed in
    // favor of an internal relative link in the closing paragraph.
    return [
      '<p><em>With editing assistance from ChatGPT (OpenAI, 2025)</em></p>',

      '<p>In February 2025, we were introduced to a new term, <strong>vibe coding</strong>&mdash;a novel way of building software through using natural language rather than writing lines of code.</p>',
      '<p>Vibe coding involves describing your idea in written or spoken words&mdash;what you want your app, website, or software to do, to look like, to feel like&mdash;and letting an AI coding agent bring it to life. You then review, refine, and iterate until it matches your vision. Remarkable, right?</p>',
      '<p>But in just eight short months, this novelty has become a necessity: Anton Osika, CEO of Lovable, a vibe coding platform, recently shared that every day, over 100,000 new projects are being built through vibe coding on their platform.</p>',
      '<p>If you haven&rsquo;t tried vibe coding yet, no worries. Let me walk you through the steps, and you will be vibe-coding in no time!</p>',

      '<h2>What vibe coding looks like in practice</h2>',
      '<ol>',
      '  <li>Open an AI-supported vibe coding platform&mdash;great options include Lovable, Cursor, Cline, and Bolt, among others.</li>',
      '  <li>You write: &ldquo;Create a two-page site for a student eco-challenge with sign-up and a leaderboard; modern, accessible, mobile-first.&rdquo;</li>',
      '  <li>The AI builds the basic app (pages, routes, components).</li>',
      '  <li>You refine: update copy, adjust color/contrast for accessibility, add a consent flow, connect a database or to a payment processing platform.</li>',
      '  <li>You approve when ready! Review diffs, keep &ldquo;secrets&rdquo; in <code>.env</code>, run quality checks, and bless what ships.</li>',
      '</ol>',
      '<p>Think of it as moving from painstakingly hand-writing every line of a solution to directing a super-eager and tireless assistant to craft the solution: you guide features, user experience, data used, and security hygiene observed; the AI agent drafts the boilerplate and iterates on your feedback.</p>',

      '<h2>Why vibe coding matters (especially now)</h2>',
      '<ul>',
      '  <li><strong>Speed to learning:</strong> Students, teachers, and product teams can go from prompt to prototype in minutes. That compresses the &ldquo;idea &rarr; feedback&rdquo; loop and supports exponential thinking and agency in more students, irrespective of technical background.</li>',
      '  <li><strong>Access &amp; equity:</strong> Not every organization can afford a full-stack engineer on staff. Vibe coding lowers the barrier to making real software.</li>',
      '  <li><strong>Focus on what&rsquo;s human:</strong> Strategy, problem framing, user empathy, data ethics, brand voice&mdash;these are not automatable. Vibe coding frees time to practice them.</li>',
      '  <li><strong>Authentic collaboration:</strong> Multiple agents (or teammates) can work in parallel on branches&mdash;code here, UI change there, UX polish somewhere else&mdash;then merge with human review.</li>',
      '</ul>',
      '<p>The magic isn&rsquo;t that AI writes perfect code&mdash;it doesn&rsquo;t. The magic is how quickly ideas become artifacts that people can react to.</p>',

      '<h2>How it is shaping software development going forward</h2>',
      '<ul>',
      '  <li><strong>&ldquo;Prompt &rarr; Prototype&rdquo; as baseline fluency.</strong> Tomorrow&rsquo;s &ldquo;Hello, World&rdquo; isn&rsquo;t printing text; it&rsquo;s building a small, usable tool and instrumenting it for feedback.</li>',
      '  <li><strong>Engineering as orchestration.</strong> We will spend more time writing specs, guardrails, tests, and integration code&mdash;and less time on repetitive scaffolding.</li>',
      '  <li><strong>Curricula will invert.</strong> We&rsquo;ll teach decomposition, design rules, data privacy, and safety first, and then dive into implementation details where depth matters.</li>',
      '  <li><strong>Secure-by-default habits will be non-negotiable.</strong> Code review and security checks before deployment will be part of every project&mdash;even student projects&mdash;because it will be easy; thus, building better technical habits and safer software.</li>',
      '  <li><strong>Creativity will scale.</strong> With the heavy lifting handled, students can try five ideas in a week and learn from all five. Iteration becomes affordable.</li>',
      '</ul>',

      '<h2>What vibe coding is not</h2>',
      '<ul>',
      '  <li><strong>A replacement for computer science.</strong> Algorithms, data structures, systems, and security still matter&mdash;often more&mdash;because we are now approving and integrating machine-generated code. So, we will need to continue teaching them to our youth.</li>',
      '  <li><strong>A license to skip review.</strong> Treat the AI like a junior developer: helpful, fast, and fallible. You are accountable for quality.</li>',
      '</ul>',

      '<h2>Getting started (the SureStart way)</h2>',
      '<p>When we introduce vibe coding to students, we emphasize three habits:</p>',
      '<ol>',
      '  <li><strong>Write great prompts</strong> (goal, users, constraints, success criteria).</li>',
      '  <li><strong>Ship in slices</strong> (one feature per branch; review diffs).</li>',
      '  <li><strong>Protect users</strong> (privacy, accessibility, and manually verified safety checks before you press &ldquo;publish&rdquo;).</li>',
      '</ol>',

      '<h2>Ready to see this in action?</h2>',
      '<p>We&rsquo;ve launched the <a href="/vibe-lab/">SureStart Vibe Lab</a>&mdash;hands-on sessions, templates, and secure guardrails to help schools, educators, and students prototype responsibly with AI.</p>',
      '<p>If you are a student, come learn how to turn your big ideas into tangible prototypes. If you are an educator, let&rsquo;s give you the time back to finally assess the thinking behind the build, not just whether a semicolon is in the right place.</p>',
      '<p>&#128073; Explore the <a href="/vibe-lab/">SureStart Vibe Lab</a>.</p>'
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
        url: 'https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/blog/AdobeStock_917190692.jpeg',
        alt: 'Students collaborating on an AI project'
      },
      categories: [
        // { id: 11, name: 'AI Policy', slug: 'ai-policy' },
        // { id: 12, name: 'K-12', slug: 'k12' }
      ],
      tags: [
        { id: 101, name: 'governance', slug: 'governance' },
        { id: 102, name: 'schools', slug: 'schools' },
        { id: 103, name: 'responsible-ai', slug: 'responsible-ai' },
        { id: 104, name: 'assessment', slug: 'assessment' }
      ]
    },
    {
      id: 2,
      slug: 'goal-setting-strategies-6-frameworks-for-achieving-goals',
      title: 'Goal Setting Strategies: 6 Frameworks for Achieving Goals',
      excerpt:
        'Strategic goal-setting frameworks like SMART, OKRs, and WOOP help navigate career disruption by aligning motivation with action. Research shows writing goals and using structured methods increases success by 33 percent.',
      content: goalSettingContent(),
      date: '2026-04-15',
      author: {
        name: 'Taniya Mishra',
        avatar:
          'https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/logos/surestart/surestart-logo.png'
      },
      featuredImage: {
        url: 'https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/blog/AdobeStock_1120768142.jpeg',
        alt: 'Person planning goals with notebook and laptop',
        // Optional HTML-allowed credit shown as a <figcaption> under the hero.
        // Trusted, author-authored markup (same trust model as `content`).
        // TODO(WordPress): map from media.caption.rendered in mapWpPost().
        credit:
          'Original article published by <a href="https://builtin.com/articles/goal-setting-strategies" target="_blank" rel="noopener noreferrer">Built In</a>'
      },
      categories: [
        // { id: 13, name: 'Career Development', slug: 'career-development' },
        // { id: 14, name: 'Productivity', slug: 'productivity' }
      ],
      tags: [
        { id: 105, name: 'goal-setting', slug: 'goal-setting' },
        { id: 106, name: 'smart', slug: 'smart' },
        { id: 107, name: 'okrs', slug: 'okrs' },
        { id: 108, name: 'woop', slug: 'woop' },
        { id: 109, name: 'hard-goals', slug: 'hard-goals' },
        { id: 110, name: 'bhag', slug: 'bhag' }
      ]
    },
    {
      id: 3,
      slug: 'vibe-coding-why-prompt-to-prototype-is-the-next-ai-fluency',
      title: 'Vibe Coding: Why \u201CPrompt \u2192 Prototype\u201D Is the Next AI Fluency',
      excerpt:
        'Vibe coding turns natural-language ideas into working software. Here&rsquo;s why prompt-to-prototype fluency is becoming the new baseline for students, educators, and builders.',
      content: vibeCodingContent(),
      date: '2025-10-22',
      author: {
        name: 'Taniya Mishra',
        avatar:
          'https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/logos/surestart/surestart-logo.png'
      },
      featuredImage: {
        url: 'https://pub-dcb79d88e2ec4567824453cc853f55f3.r2.dev/images/blog/AdobeStock_1548303423.jpeg',
        alt: 'A student prototyping an app from a written prompt with an AI coding agent'
      },
      categories: [
        // { id: 15, name: 'AI Education', slug: 'ai-education' },
        // { id: 16, name: 'Vibe Coding', slug: 'vibe-coding' }
      ],
      tags: [
        { id: 111, name: 'vibe-coding', slug: 'vibe-coding' },
        { id: 112, name: 'ai-fluency', slug: 'ai-fluency' },
        { id: 113, name: 'prototyping', slug: 'prototyping' },
        { id: 114, name: 'lovable', slug: 'lovable' },
        { id: 115, name: 'cursor', slug: 'cursor' },
        { id: 116, name: 'education', slug: 'education' }
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
