export async function POST(req) {
  try {
    const { input, mode } = await req.json();

    // ── UPGRADE 7: Input Normalization ────────────────────────
    const normalized = input.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, " ").trim();
    const rawWords = normalized.split(" ");

    // ── UPGRADE 10: Scope Lock (Fixed 13 Categories) ──────────
    const categories = {
      study: ["study", "exam", "revise", "focus", "deep work", "learn", "homework", "college", "university", "school", "test", "assignment", "research", "reading", "memorize", "grades", "class", "lecture", "student"],
      fitness: ["gym", "workout", "fitness", "diet", "exercise", "muscle", "weight", "bulk", "cut", "cardio", "protein", "training", "run", "health", "lift", "abs", "fat loss", "squat", "bench", "nutrition", "calories"],
      business: ["startup", "product", "launch", "business", "company", "revenue", "market", "pitch", "investor", "saas", "mvp", "founder", "scale", "growth", "sales", "b2b", "b2c", "marketing", "profit", "ecommerce"],
      content: ["post", "content", "write", "tweet", "script", "blog", "article", "copy", "headline", "hook", "newsletter", "email", "caption", "thread", "youtube", "tiktok", "instagram", "creator", "audience", "viral"],
      planning: ["plan", "schedule", "routine", "day", "morning", "week", "calendar", "organize", "time", "productivity", "habit", "daily", "todo", "task", "goals", "system", "track", "journal"],
      coding: ["code", "programming", "software", "debug", "react", "python", "javascript", "frontend", "bug", "syntax", "backend", "database", "api", "html", "css", "deploy", "git", "github", "developer", "engineering", "algorithm", "app", "website", "nextjs", "node"],
      finance: ["money", "invest", "stock", "crypto", "budget", "savings", "retire", "wealth", "portfolio", "tax", "trading", "bitcoin", "ethereum", "index fund", "real estate", "debt", "credit", "finance", "passive income", "dividend"],
      career: ["interview", "resume", "job", "promotion", "salary", "career", "manager", "linkedin", "cv", "hiring", "boss", "coworker", "office", "remote work", "cover letter", "networking", "offer", "negotiate"],
      travel: ["travel", "flight", "hotel", "trip", "vacation", "itinerary", "tourism", "abroad", "backpack", "airport", "luggage", "tourist", "destination", "holiday", "explore", "visiting", "airbnb"],
      mental_health: ["stress", "anxiety", "meditate", "mindfulness", "therapy", "overwhelmed", "burnout", "calm", "relax", "depression", "panic", "breathe", "mental", "peace", "focus", "sleep", "rest", "energy"],
      cooking: ["recipe", "cook", "bake", "dinner", "meal prep", "food", "kitchen", "ingredient", "chef", "breakfast", "lunch", "meal", "diet", "vegan", "meat", "protein", "grocery", "spices", "flavor"],
      creative: ["story", "novel", "character", "plot", "fiction", "poem", "author", "worldbuilding", "book", "writing", "chapter", "fantasy", "sci-fi", "draft", "publish", "protagonist", "screenplay", "art", "design"],
      language: ["language", "spanish", "french", "vocabulary", "grammar", "fluent", "translation", "speak", "english", "learn language", "accent", "fluency", "native", "bilingual", "duolingo", "words", "phrase"]
    };

    // ── UPGRADE 1 & 2: Priority Scoring & Confidence ──────────
    const scores = {};
    for (const cat of Object.keys(categories)) {
      scores[cat] = 0;
    }

    for (const [category, keywords] of Object.entries(categories)) {
      // 1 point for single word matches
      for (const word of rawWords) {
        if (keywords.includes(word)) scores[category]++;
      }
      // 2 points for exact multi-word matches (e.g. "real estate")
      for (const kw of keywords) {
        if (kw.includes(" ") && normalized.includes(kw)) scores[category] += 2;
      }
    }

    const sortedCategories = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0];
    const secondCategory = sortedCategories[1];

    let primary = "default";
    let secondary = null;

    // Confidence threshold: at least 1 point
    if (topCategory[1] >= 1) primary = topCategory[0];
    
    // Multi-intent: Detect strong secondary score
    if (secondCategory[1] >= 1 && secondCategory[0] !== primary) {
      secondary = secondCategory[0];
    }

    const shortContext = input.length > 0 && input.length < 45 ? input : "the objective";

    // ── UPGRADE 8: Speed Perception ───────────────────────────
    const delay = 300 + Math.floor(Math.random() * 200);
    await new Promise((r) => setTimeout(r, delay));

    // ── Output Engine ─────────────────────────────────────────
    let output = "";

    if (mode === "task") {
      output = getTaskOutput(primary, shortContext);
    } else if (mode === "content") {
      output = getContentOutput(primary, shortContext);
    } else if (mode === "learn") {
      output = getLearnOutput(primary, shortContext);
    } else if (mode === "plan") {
      output = getPlanOutput(primary, shortContext);
    } else {
      output = getTaskOutput(primary, shortContext);
    }

    // ── UPGRADE 4: Multi-Intent Handling (Add-on) ─────────────
    if (secondary && primary !== "default") {
      const addOns = {
        study: "- Apply deep learning principles to optimize retention.",
        fitness: "- Ensure physical recovery and hydration are accounted for.",
        business: "- Track the core business metrics for this execution.",
        coding: "- Keep the logical architecture clean and maintainable.",
        finance: "- Monitor the financial ROI and opportunity cost.",
        career: "- Leverage this execution to boost professional value.",
        travel: "- Maintain extreme flexibility in your logistics.",
        mental_health: "- Protect your cognitive bandwidth while executing.",
        cooking: "- Prepare your environment completely before starting.",
        creative: "- Allow for unfiltered ideation before refining.",
        language: "- Focus on consistent immersion over perfection.",
        content: "- Ensure the narrative hook is sharp and clear.",
        planning: "- Time-block this execution ruthlessly."
      };
      
      if (addOns[secondary]) {
        output += `\n\n**SECONDARY FOCUS:**\n\n${addOns[secondary]}`;
      }
    }

    // ── UPGRADE 5: Output Consistency Lock ────────────────────
    return Response.json({ output });
    
  } catch (error) {
    // ── UPGRADE 9: Failure Proofing ───────────────────────────
    return Response.json({ output: getTaskOutput("default", "the objective") });
  }
}

// ── UPGRADE 6: Variation Layer (Helper) ──────────────────────
// Returns a random slight variation in wording while keeping structure fixed
function v(options) {
  return options[Math.floor(Math.random() * options.length)];
}

// ── BREAK IT DOWN ────────────────────────────────────────────
function getTaskOutput(category, ctx) {
  const outputs = {
    study: `### Break It Down

**PHASE 1: ${v(["Preparation for", "Setup for"])} ${ctx}**

- Define exactly what needs to be learned.

- Remove all distractions from workspace.

- Gather materials and set a 45-minute timer.

**PHASE 2: ${v(["Deep Acquisition", "Focused Learning"])}**

- Read core concepts actively, not passively.

- Write summary notes in your own words.

- Test recall immediately after each section.

**PHASE 3: ${v(["Consolidation", "Review"])}**

- Review weak points identified during recall.

- Teach the concept to an imaginary audience.

- Schedule next review session before forgetting.

*INSIGHT: Recall beats re-reading. Test yourself constantly.*`,

    fitness: `### Break It Down

**PHASE 1: ${v(["Preparation for", "Setup for"])} ${ctx}**

- Warm up properly for 5-10 minutes.

- Set a specific training goal for the session.

**PHASE 2: ${v(["Training", "Execution"])}**

- Start with compound movements first.

- Maintain strict form over ego weight.

- Apply progressive overload each week.

**PHASE 3: ${v(["Recovery", "Cooldown"])}**

- Stretch all targeted muscle groups.

- Hydrate and consume protein within 30 minutes.

*INSIGHT: Consistency beats intensity spikes. Show up daily.*`,

    business: `### Break It Down

**PHASE 1: ${v(["Clarity on", "Define"])} ${ctx}**

- Define exact target user and their pain point.

- Validate demand before building anything.

**PHASE 2: ${v(["Execution", "Build"])}**

- Create the simplest possible MVP.

- Focus entirely on the core feature.

- Ship within 2 weeks, not 2 months.

**PHASE 3: ${v(["Iterate", "Refine"])}**

- Collect direct user feedback immediately.

- Improve based on usage data, not assumptions.

*INSIGHT: Speed of iteration defines startup success.*`,

    coding: `### Break It Down

**PHASE 1: ${v(["Isolate", "Identify"])} ${ctx}**

- Stop guessing. Identify the exact line or file causing the issue.

- Reproduce the error consistently.

**PHASE 2: ${v(["Diagnosis", "Analysis"])}**

- Read the error trace from top to bottom.

- Do not write new code until the root cause is confirmed.

**PHASE 3: ${v(["Implementation", "Execution"])}**

- Apply the simplest possible fix.

- Test the edge cases to ensure it does not break again.

*INSIGHT: 90% of engineering time is understanding the problem, not typing.*`,

    finance: `### Break It Down

**PHASE 1: ${v(["Audit", "Review"])} ${ctx}**

- Track exactly where every dollar is currently going.

- Identify high-interest debt and recurring leaks.

**PHASE 2: ${v(["Allocation", "Strategy"])}**

- Build a 3-month emergency buffer.

- Automate investments so you never have to decide to save.

**PHASE 3: ${v(["Growth", "Scaling"])}**

- Ignore daily market fluctuations.

- Focus on increasing primary income, not just clipping coupons.

*INSIGHT: Wealth is built by automation, not willpower.*`,

    career: `### Break It Down

**PHASE 1: ${v(["Audit", "Clarify"])} ${ctx}**

- Identify exactly what the hiring manager or boss needs solved.

- Map your previous experience directly to their pain points.

**PHASE 2: ${v(["Preparation", "Setup"])}**

- Quantify your past achievements with hard numbers.

- Practice your narrative out loud, not just in your head.

**PHASE 3: ${v(["Execution", "Action"])}**

- Ask high-leverage questions that prove you understand the role.

- Follow up within 24 hours with a concise summary.

*INSIGHT: You are not selling your skills. You are selling risk reduction.*`,

    travel: `### Break It Down

**PHASE 1: ${v(["Logistics for", "Setup for"])} ${ctx}**

- Lock in flights and core accommodations first.

- Verify passport expiration and visa requirements.

**PHASE 2: ${v(["Architecture", "Planning"])}**

- Map out one major anchor activity per day.

- Leave 30% of the schedule completely empty for discovery.

**PHASE 3: ${v(["Execution", "Action"])}**

- Pack exactly half the clothes and twice the money you think you need.

- Download offline maps and translation apps.

*INSIGHT: Over-planning kills the spontaneity of travel.*`,

    mental_health: `### Break It Down

**PHASE 1: ${v(["Acknowledge", "Identify"])} ${ctx}**

- Step away from the immediate trigger.

- Do a physical reset: cold water, deep breaths, or a walk.

**PHASE 2: ${v(["Deconstruct", "Analyze"])}**

- Write down exactly what is causing the overwhelming feeling.

- Separate facts from emotional assumptions.

**PHASE 3: ${v(["Action", "Execution"])}**

- Identify the single smallest step you can take right now.

- Focus entirely on the present 5 minutes.

*INSIGHT: Action is the antidote to anxiety.*`,

    cooking: `### Break It Down

**PHASE 1: ${v(["Prep", "Setup"])} ${ctx}**

- Read the entire recipe before doing anything.

- Gather and chop all ingredients before turning on the heat.

**PHASE 2: ${v(["Execution", "Action"])}**

- Clean as you go to prevent a massive mess at the end.

- Taste continuously and adjust seasoning.

**PHASE 3: ${v(["Finalize", "Completion"])}**

- Let proteins rest before cutting.

- Plate with intention.

*INSIGHT: Preparation (Mise en place) is the secret to stress-free cooking.*`,

    creative: `### Break It Down

**PHASE 1: ${v(["Brainstorm", "Ideate"])} ${ctx}**

- Dump every idea onto the page without filtering.

- Define the core conflict or emotion.

**PHASE 2: ${v(["Draft", "Execution"])}**

- Write the first draft as fast as possible.

- Do not edit while writing. Just move forward.

**PHASE 3: ${v(["Refine", "Edit"])}**

- Cut 20% of the words on the second pass.

- Ensure every sentence moves the piece forward.

*INSIGHT: The first draft is just you telling yourself the story.*`,

    language: `### Break It Down

**PHASE 1: ${v(["Foundation for", "Setup for"])} ${ctx}**

- Master the 100 most common words first.

- Ignore complex grammar rules in the beginning.

**PHASE 2: ${v(["Immersion", "Integration"])}**

- Change your phone and environment to the target language.

- Listen to native audio daily, even passively.

**PHASE 3: ${v(["Output", "Execution"])}**

- Force yourself to speak from day one.

- Embrace making mistakes; it is the only way to adapt.

*INSIGHT: Fluency is about communication, not perfection.*`,

    // ── UPGRADE 3: SMART FALLBACK (CRITICAL) ──────────────────
    default: `### Break It Down

**PHASE 1: Understand**

- Clarify the goal.

- Identify constraints.

**PHASE 2: Act**

- Start with the simplest step.

- Build momentum.

**PHASE 3: Improve**

- Review outcome.

- Adjust approach.

*INSIGHT: Action creates clarity.*`,
  };

  return outputs[category] || outputs.default;
}

// ── CREATE CONTENT ───────────────────────────────────────────
function getContentOutput(category, ctx) {
  const outputs = {
    study: `### Create Content

**HOOK:**

- Most students approach ${ctx} the hard way.

- The method that changed everything takes 25 minutes.

**BODY:**

- Active recall forces your brain to retrieve information.

- Spaced repetition prevents the forgetting curve.

**VARIATIONS:**

- Lead with a failure story from personal experience.

- Lead with a shocking statistic about performance.

*INSIGHT: One sharp idea beats ten average ones.*`,

    fitness: `### Create Content

**HOOK:**

- You do not need more motivation for ${ctx}. You need a system.

- The session most people skip is the one that matters.

**BODY:**

- Compound lifts build more muscle in less time.

- Progressive overload is the only variable that matters.

**VARIATIONS:**

- Open with a common myth and destroy it.

- Open with a 30-day transformation data point.

*INSIGHT: One sharp idea beats ten average ones.*`,

    business: `### Create Content

**HOOK:**

- Your approach to ${ctx} is costing you revenue.

- The fastest way to fail is to build before validating.

**BODY:**

- Talk to 50 potential users before writing code.

- Charge from day one to validate real demand.

**VARIATIONS:**

- Lead with a founder failure story.

- Lead with a revenue-first case study.

*INSIGHT: One sharp idea beats ten average ones.*`,

    coding: `### Create Content

**HOOK:**

- Stop over-engineering ${ctx}. Keep it simple.

- 90% of bugs are caused by terrible state management.

**BODY:**

- Write code that is easy to delete, not easy to extend.

- Readability is more important than cleverness.

**VARIATIONS:**

- Open with a nightmare debugging story.

- Open with a controversial opinion on a popular framework.

*INSIGHT: One sharp idea beats ten average ones.*`,

    finance: `### Create Content

**HOOK:**

- The biggest lie you've been told about ${ctx}.

- You cannot save your way to true wealth.

**BODY:**

- Compound interest is the eighth wonder of the world.

- Automate your investments and delete the app.

**VARIATIONS:**

- Compare two contrasting financial mindsets.

- Break down the math of a simple index fund over 20 years.

*INSIGHT: One sharp idea beats ten average ones.*`,

    career: `### Create Content

**HOOK:**

- The traditional approach to ${ctx} is dead.

- Your resume is not the reason you got rejected.

**BODY:**

- Hiring managers want problem solvers, not task doers.

- Quantify every bullet point on your CV with real metrics.

**VARIATIONS:**

- Open with an unconventional interview tactic.

- Open with a story about a massive career pivot.

*INSIGHT: One sharp idea beats ten average ones.*`,

    travel: `### Create Content

**HOOK:**

- Stop traveling to ${ctx} like a tourist.

- The best trips happen when you stop following the itinerary.

**BODY:**

- Pack half the clothes and twice the budget.

- Eat where the locals eat, not where Instagram tells you to.

**VARIATIONS:**

- Share a travel disaster that turned into a great memory.

- Break down the exact budget of a specific trip.

*INSIGHT: One sharp idea beats ten average ones.*`,

    mental_health: `### Create Content

**HOOK:**

- We need to rethink how we handle ${ctx}.

- Burnout is not a badge of honor; it is a system failure.

**BODY:**

- Rest is productive. Protect it ruthlessly.

- Separate your identity from your daily output.

**VARIATIONS:**

- Open with a vulnerable personal realization.

- Challenge the hustle culture narrative directly.

*INSIGHT: One sharp idea beats ten average ones.*`,

    cooking: `### Create Content

**HOOK:**

- Stop overcomplicating ${ctx}. Master the basics.

- The secret ingredient in restaurant food is just more butter.

**BODY:**

- Prep your ingredients before you turn on the stove.

- Acid and salt fix 90% of bland dishes.

**VARIATIONS:**

- Share a massive kitchen failure and what you learned.

- Break down a complex recipe into 3 simple steps.

*INSIGHT: One sharp idea beats ten average ones.*`,

    creative: `### Create Content

**HOOK:**

- The hardest part of ${ctx} is staring at the blank page.

- Your first draft is supposed to be terrible.

**BODY:**

- Write hot, edit cold.

- End every chapter with an unanswered question.

**VARIATIONS:**

- Share the origin story of your best idea.

- Break down the architecture of a famous story.

*INSIGHT: One sharp idea beats ten average ones.*`,

    language: `### Create Content

**HOOK:**

- The traditional way to learn ${ctx} is broken.

- You don't need a textbook, you need immersion.

**BODY:**

- Master the 100 most common words first.

- Speak from day one and embrace sounding foolish.

**VARIATIONS:**

- Share a funny mistranslation story.

- Open with a controversial take on grammar apps.

*INSIGHT: One sharp idea beats ten average ones.*`,

    planning: `### Create Content

**HOOK:**

- Your approach to ${ctx} is completely unfocused.

- Productive people do not manage time. They protect it.

**BODY:**

- Block your highest-energy hours for deep work.

- Batch reactive tasks into a single afternoon slot.

**VARIATIONS:**

- Open with a before/after productivity transformation.

- Open with the cost of context-switching in dollars.

*INSIGHT: One sharp idea beats ten average ones.*`,

    // ── UPGRADE 3: SMART FALLBACK (CRITICAL) ──────────────────
    default: `### Create Content

**HOOK:**

- Start with a bold statement.

- Create curiosity immediately.

**BODY:**

- Deliver clear value.

- Keep sentences sharp.

**VARIATIONS:**

- Add an emotional angle.

- Provide a contrarian viewpoint.

*INSIGHT: Action creates clarity.*`,
  };

  return outputs[category] || outputs.default;
}

// ── EXPLAIN IT ───────────────────────────────────────────────
function getLearnOutput(category, ctx) {
  const outputs = {
    study: `### Explain It

**PHASE 1: Defining ${ctx}**

- A system for absorbing information faster.

- Works by forcing your brain to actively retrieve.

**PHASE 2: Mechanism**

- Read a concept, then close the book and recall it.

- Repeat at increasing intervals to fight the forgetting curve.

**PHASE 3: Application**

- After every session, test yourself with no notes.

- Schedule review sessions at 1 day, 3 days, and 7 days.

*INSIGHT: The effort of recall is what builds the memory.*`,

    coding: `### Explain It

**PHASE 1: Defining ${ctx}**

- It is a tool designed to solve a specific engineering problem.

- It abstracts complexity so you do not rewrite boilerplate.

**PHASE 2: Mechanism**

- Takes inputs, processes through a logic tree, and returns output.

- It operates under strict syntactical rules.

**PHASE 3: Application**

- Use it when the native solution is too slow or unmaintainable.

- Avoid it if it introduces unnecessary dependencies.

*INSIGHT: Do not use a framework until you understand the problem it solves.*`,

    finance: `### Explain It

**PHASE 1: Defining ${ctx}**

- A financial vehicle designed to compound wealth over time.

- It relies on math, not emotion.

**PHASE 2: Mechanism**

- Capital is deployed into assets that generate yield or appreciate.

- Time in the market neutralizes short-term volatility.

**PHASE 3: Application**

- Automate your contributions to remove decision fatigue.

- Hold through downturns. Never sell out of panic.

*INSIGHT: The most powerful force in finance is uninterrupted compounding.*`,

    career: `### Explain It

**PHASE 1: Defining ${ctx}**

- The strategic positioning of your value in the marketplace.

- It is not just about hard skills; it is about perceived impact.

**PHASE 2: Mechanism**

- Companies pay for problems to be solved, not for hours worked.

- Networking accelerates the discovery of your value.

**PHASE 3: Application**

- Quantify your past impact in hard numbers.

- Communicate strictly in terms of ROI for the employer.

*INSIGHT: Your network is a multiplier on your actual skills.*`,

    travel: `### Explain It

**PHASE 1: Defining ${ctx}**

- The architecture of moving through an unfamiliar environment.

- It balances logistics with spontaneous discovery.

**PHASE 2: Mechanism**

- Preparation reduces friction at borders and transits.

- Flexibility allows for localized, authentic experiences.

**PHASE 3: Application**

- Book the anchor points (flights, beds) immediately.

- Leave the granular daily schedule highly adaptable.

*INSIGHT: The best parts of travel cannot be scheduled.*`,

    mental_health: `### Explain It

**PHASE 1: Defining ${ctx}**

- A physiological and psychological response to sustained cognitive load.

- Your nervous system interpreting modern stress as a physical threat.

**PHASE 2: Mechanism**

- Elevated cortisol levels inhibit rational, long-term thinking.

- Lack of recovery loops the brain into a state of hyper-vigilance.

**PHASE 3: Application**

- Implement hard disconnects from screens and work.

- Prioritize sleep as the primary biological reset.

*INSIGHT: You cannot optimize a machine that is overheating.*`,

    cooking: `### Explain It

**PHASE 1: Defining ${ctx}**

- The chemical transformation of ingredients through heat and time.

- Balancing salt, fat, acid, and heat.

**PHASE 2: Mechanism**

- Heat alters protein structures and caramelizes sugars.

- Acid cuts through heavy fats to brighten the palate.

**PHASE 3: Application**

- Prepare all components before applying heat (Mise en place).

- Taste and adjust seasoning at every single stage.

*INSIGHT: A recipe is a baseline; your palate is the compass.*`,

    creative: `### Explain It

**PHASE 1: Defining ${ctx}**

- The process of translating abstract thought into structured narrative.

- Moving an audience from one emotional state to another.

**PHASE 2: Mechanism**

- Conflict drives the plot. Character flaws drive the conflict.

- Pacing controls the release of information to the audience.

**PHASE 3: Application**

- Write the first draft without editing.

- Cut mercilessly on the second pass.

*INSIGHT: Great writing is just terrible writing that has been edited well.*`,

    language: `### Explain It

**PHASE 1: Defining ${ctx}**

- A system of arbitrary sounds and symbols used to transfer meaning.

- It is a tool for connection, not an academic test.

**PHASE 2: Mechanism**

- The brain acquires patterns through massive comprehensible input.

- Output (speaking) solidifies the neural pathways.

**PHASE 3: Application**

- Surround yourself with native audio and text.

- Speak early and accept that you will sound foolish.

*INSIGHT: Children learn languages because they are not afraid to be wrong.*`,

    fitness: `### Explain It

**PHASE 1: Defining ${ctx}**

- A principle where you gradually increase stress on the body.

- The body adapts when forced beyond its current capacity.

**PHASE 2: Mechanism**

- Add small increments of weight or volume each week.

- Consistent progression triggers biological adaptation.

**PHASE 3: Application**

- Track every metric in a log.

- Increase one variable per session, never all at once.

*INSIGHT: Small, consistent increments compound into massive results.*`,

    business: `### Explain It

**PHASE 1: Defining ${ctx}**

- The simplest version of a solution that delivers core value.

- It exists to test demand, not to impress anyone.

**PHASE 2: Mechanism**

- Strip the idea down to one core feature.

- Ship fast, collect feedback, iterate.

**PHASE 3: Application**

- Build only what solves the primary pain point.

- Launch within 2 weeks. Perfection is the enemy.

*INSIGHT: The goal is learning speed, not product completeness.*`,

    content: `### Explain It

**PHASE 1: Defining ${ctx}**

- A hook is the first line that determines if anyone reads further.

- It creates a gap between what the reader knows and wants to know.

**PHASE 2: Mechanism**

- Strong hooks challenge assumptions or provoke curiosity.

- Weak hooks describe. Strong hooks disrupt.

**PHASE 3: Application**

- Write 10 hooks for every piece of content.

- Pick the one that makes you stop and think.

*INSIGHT: If the hook does not stop you, it will not stop anyone.*`,

    planning: `### Explain It

**PHASE 1: Defining ${ctx}**

- Time blocking assigns specific tasks to specific hours.

- It eliminates decision fatigue about what to do next.

**PHASE 2: Mechanism**

- Your brain performs differently at different hours.

- Deep work goes in high-energy slots. Admin goes in low-energy slots.

**PHASE 3: Application**

- Block your first 2 hours for the hardest task.

- Never schedule meetings during deep work blocks.

*INSIGHT: A protected calendar is the highest-leverage tool.*`,

    // ── UPGRADE 3: SMART FALLBACK (CRITICAL) ──────────────────
    default: `### Explain It

**PHASE 1: Understand**

- Clarify the core concept.

- Identify the constraints.

**PHASE 2: Act**

- Break it down into the simplest components.

- Remove unnecessary complexity.

**PHASE 3: Improve**

- Apply the concept immediately.

- Adjust based on real-world feedback.

*INSIGHT: Action creates clarity.*`,
  };

  return outputs[category] || outputs.default;
}

// ── PLAN MY TIME ─────────────────────────────────────────────
function getPlanOutput(category, ctx) {
  const outputs = {
    study: `### Plan My Time

**MORNING: ${v(["Deep Learning", "Focused Study"])} for ${ctx}**

- Study core concepts with zero distractions.

- Use active recall, not passive reading.

**AFTERNOON: ${v(["Practice", "Execution"])}**

- Solve problems and practice weak areas.

- Time yourself to simulate pressure.

**EVENING: ${v(["Review", "Consolidation"])}**

- Revise key topics from the morning session.

- Light review only. No new material.

**NIGHT: ${v(["Reset", "Preparation"])}**

- Analyze mistakes made during practice.

- Plan exactly what to study tomorrow.

*INSIGHT: Morning learning sticks. Protect that block at all costs.*`,

    coding: `### Plan My Time

**MORNING: ${v(["Deep Architecture", "Logic Building"])} for ${ctx}**

- Tackle the hardest logical problem first.

- Write core logic. No UI styling. Zero interruptions.

**AFTERNOON: ${v(["Execution", "Debugging"])}**

- Connect APIs and resolve state issues.

- Fix known bugs and write necessary tests.

**EVENING: ${v(["Refactor", "Cleanup"])}**

- Clean up messy code from the afternoon sprint.

- Document complex functions.

**NIGHT: ${v(["Disconnect", "Shutdown"])}**

- Step away from the screen completely.

- Let your subconscious solve tomorrow's bugs.

*INSIGHT: Code written while tired always has to be rewritten.*`,

    finance: `### Plan My Time

**MORNING: ${v(["Wealth Audit", "Market Review"])} for ${ctx}**

- Review primary income metrics and high-leverage investments.

- Do not check daily stock tickers. Focus on macro goals.

**AFTERNOON: ${v(["Optimization", "Strategy"])}**

- Research tax strategies or rebalance portfolios.

- Process financial admin and bill automation.

**EVENING: ${v(["Education", "Learning"])}**

- Read macro-economic analysis or investor letters.

- Expand your financial literacy.

**NIGHT: ${v(["Disconnect", "Shutdown"])}**

- Financial anxiety ruins sleep. Log out of all accounts.

- Prepare the environment for tomorrow.

*INSIGHT: True wealth is built by doing nothing 99% of the time.*`,

    career: `### Plan My Time

**MORNING: ${v(["High-Leverage Outreach", "Networking"])} for ${ctx}**

- Send cold emails or connect with decision-makers.

- Apply for role-defining positions while energy is high.

**AFTERNOON: ${v(["Skill Building", "Optimization"])}**

- Dedicate 90 minutes to acquiring a hard skill.

- Optimize your resume and LinkedIn profile.

**EVENING: ${v(["Network Maintenance", "Follow-up"])}**

- Follow up on previous conversations.

- Provide value to someone in your network with zero expectation.

**NIGHT: ${v(["Reflection", "Planning"])}**

- Audit the day's progress.

- Outline your top 3 career objectives for tomorrow.

*INSIGHT: The best opportunities are never posted on job boards.*`,

    travel: `### Plan My Time

**MORNING: ${v(["Core Experience", "Exploration"])} for ${ctx}**

- Visit the primary landmark right at sunrise to beat crowds.

- Secure authentic local breakfast.

**AFTERNOON: ${v(["Discovery", "Wandering"])}**

- No itinerary. Walk through unfamiliar neighborhoods.

- Let curiosity drive the routing.

**EVENING: ${v(["Culinary & Culture", "Immersion"])}**

- Secure dinner in a non-tourist sector.

- Engage with the local environment.

**NIGHT: ${v(["Logistics", "Reset"])}**

- Review tomorrow's transit requirements.

- Back up photos and documents.

*INSIGHT: The magic of travel happens in the unscheduled gaps.*`,

    mental_health: `### Plan My Time

**MORNING: ${v(["Grounding", "Reset"])} for ${ctx}**

- Zero screen time for the first 60 minutes.

- Hydrate and get direct sunlight in your eyes immediately.

**AFTERNOON: ${v(["Output Control", "Pacing"])}**

- Cap your intense cognitive work at 4 hours.

- Take a physical walk without a podcast or music.

**EVENING: ${v(["Decompression", "Unwinding"])}**

- Shift from highly stimulating tasks to analog activities.

- Cook, read, or converse.

**NIGHT: ${v(["Protocol", "Shutdown"])}**

- Lower the room temperature.

- Execute a hard cutoff from all digital inputs.

*INSIGHT: You cannot out-work a compromised nervous system.*`,

    cooking: `### Plan My Time

**MORNING: ${v(["Sourcing", "Preparation"])} for ${ctx}**

- Secure high-quality proteins and fresh produce.

- Finalize the recipe architecture for dinner.

**AFTERNOON: ${v(["Mise En Place", "Staging"])}**

- Chop, measure, and stage all ingredients.

- Marinate proteins and build complex sauces early.

**EVENING: ${v(["Execution", "Cooking"])}**

- Apply heat. Focus entirely on timing and temperature.

- Clean your station continuously as you cook.

**NIGHT: ${v(["Reset", "Cleanup"])}**

- Store leftovers correctly.

- Ensure the kitchen is spotless before sleeping.

*INSIGHT: A clean kitchen is the foundation of a great meal.*`,

    creative: `### Plan My Time

**MORNING: ${v(["Pure Output", "Drafting"])} for ${ctx}**

- Write or design with zero filter and zero editing.

- Protect this block with extreme prejudice.

**AFTERNOON: ${v(["Refinement", "Editing"])}**

- Edit the morning's raw output.

- Cut the fluff and tighten the structure.

**EVENING: ${v(["Consumption", "Inspiration"])}**

- Consume high-quality art or literature outside your niche.

- Steal structural ideas from masters.

**NIGHT: ${v(["Incubation", "Shutdown"])}**

- Jot down bullet points for tomorrow's session.

- Let the subconscious process the narrative overnight.

*INSIGHT: Create in the morning, edit in the afternoon. Never mix them.*`,

    language: `### Plan My Time

**MORNING: ${v(["Active Acquisition", "Learning"])} for ${ctx}**

- Memorize 10 new high-frequency vocabulary words.

- Drill spaced-repetition flashcards.

**AFTERNOON: ${v(["Passive Immersion", "Listening"])}**

- Listen to target-language podcasts while commuting or working.

- Do not worry about translating every word.

**EVENING: ${v(["Active Output", "Speaking"])}**

- Speak the language out loud for 15 minutes.

- Shadow native speakers or use language exchange apps.

**NIGHT: ${v(["Review", "Consolidation"])}**

- Briefly review the morning's vocabulary before sleep.

- Sleep consolidates linguistic memory.

*INSIGHT: Frequency of exposure is more important than duration.*`,

    fitness: `### Plan My Time

**MORNING: ${v(["Training", "Execution"])} for ${ctx}**

- Hit the gym during peak energy hours.

- Compound lifts first, isolation second.

**AFTERNOON: ${v(["Nutrition", "Fueling"])}**

- Prepare meals for the next 24 hours.

- Hit protein target before any other macro.

**EVENING: ${v(["Recovery", "Mobility"])}**

- Stretch for 15 minutes minimum.

- Foam roll any tight muscle groups.

**NIGHT: ${v(["Sleep Protocol", "Rest"])}**

- No screens 30 minutes before bed.

- Target 7-8 hours of uninterrupted sleep.

*INSIGHT: Recovery is where growth happens. Protect your sleep.*`,

    business: `### Plan My Time

**MORNING: ${v(["High-Impact Work", "Deep Execution"])} for ${ctx}**

- Work on the single most important business metric.

- No email, no meetings, no Slack.

**AFTERNOON: ${v(["Operations", "Admin"])}**

- Handle team communication and admin tasks.

- Review metrics and adjust priorities.

**EVENING: ${v(["Strategy", "Planning"])}**

- Research competitors and market shifts.

- Document learnings and next-day priorities.

**NIGHT: ${v(["Disconnect", "Shutdown"])}**

- Fully disengage from work.

- Recharge so tomorrow starts strong.

*INSIGHT: Founders who protect deep work hours scale faster.*`,

    content: `### Plan My Time

**MORNING: ${v(["Create", "Draft"])} for ${ctx}**

- Write during peak creative energy.

- Produce first draft without editing.

**AFTERNOON: ${v(["Edit and Polish", "Refine"])}**

- Refine the draft ruthlessly.

- Cut anything that does not add value.

**EVENING: ${v(["Distribute", "Publish"])}**

- Format and schedule posts for optimal times.

- Engage with audience on previous posts.

**NIGHT: ${v(["Research", "Consumption"])}**

- Consume content from top creators in your niche.

- Note patterns that perform well.

*INSIGHT: Create in the morning. Edit in the afternoon. Never mix them.*`,

    planning: `### Plan My Time

**MORNING: ${v(["Priority Execution", "Deep Work"])} for ${ctx}**

- Complete isolation. Zero notifications.

- Attack the single highest-leverage task.

**AFTERNOON: ${v(["Operational Tasks", "Admin"])}**

- Process secondary tasks and admin work.

- Maintain forward velocity without deep focus.

**EVENING: ${v(["Synthesis", "Review"])}**

- Review daily output against weekly goals.

- Architect tomorrow's execution plan.

**NIGHT: ${v(["Disconnect", "Shutdown"])}**

- Sever cognitive ties to active projects.

- Prioritize physical recovery.

*INSIGHT: Consistency outweighs intensity. Protect the morning block.*`,

    // ── UPGRADE 3: SMART FALLBACK (CRITICAL) ──────────────────
    default: `### Plan My Time

**MORNING: High-Impact Execution**

- Complete isolation. Zero notifications.

- Attack the primary bottleneck first.

**AFTERNOON: Operational Momentum**

- Process secondary tasks and communication.

- Maintain forward velocity.

**EVENING: Review and Calibrate**

- Review daily output against goals.

- Plan tomorrow before you stop.

**NIGHT: Disconnect**

- Full mental reset.

- Protect sleep quality above all else.

*INSIGHT: Action creates clarity.*`,
  };

  return outputs[category] || outputs.default;
}