# Writing Style Guide (`mrt-blog`)

This document defines the voice, tone, formatting rules, and structural patterns for all blog posts and project write-ups on **m-r-t.xyz**.

Future agents and contributors **must** read this file before drafting, editing, or structuring any written content on the site so that every post feels consistent and authentic.

---

## 1. Core Voice & Philosophy

**"Candid, Matter-of-Fact Engineering Log"**

Posts on this site document software projects, how they were built, architectural trade-offs, and lessons learned. The voice should sound like Matt talking directly to another engineer: candid, plainspoken, and practical.

- **Candid over polished:** Write how a developer actually speaks when explaining a project. Do not try to sound like a tech publication, a documentation manual, or a marketing launch post.
- **Matter-of-fact, zero hype:** State what the problem was, what choices were made, and how the code works. Do not oversell the project, and do not pad the text with jokes, tangential personal anecdotes, or filler intros.
- **Built for two reading speeds:**
  1. **The 30-second scanner:** Can read the top Overview card, glance at the section headings, scan inline `code` terms and bullet points, and immediately understand what the project does and how it is put together.
  2. **The deep-dive reader:** Can expand collapsible rabbit holes, scroll through longer scripts, and read every implementation detail without losing anything.

---

## 2. Pronouns & The Project Team Footnote

Projects documented on this blog are built by Matt working alongside AI coding agents. Rather than hiding that or making the pronouns awkward, follow a clear distinction:

### Pronoun Rule (`"I"` vs. `"we"`)
- **Use `"I"` for high-level goals, motivation, preferences, and opinions.**
  - *Example:* "I wanted a place to document my side projects without running a database or paying for a CMS."
  - *Example:* "I keep all of my domains on Cloudflare because I prefer managing DNS from the CLI."
- **Use `"we"` for hands-on implementation, debugging, and build steps done with the agent.**
  - *Example:* "We used a scoped Cloudflare API token to create the zone and push all nine DNS records from a shell script."
  - *Example:* "While polling the nameservers, we ran into a quirk with how `.xyz` referral servers return `NS` records."

### Team / Colophon Footnote (Required on Every Post)
Every post must include a `team` metadata block that renders at the bottom of the article to clarify who `"we"` refers to:
- **Human:** `Matt Toronto`
- **AI Collaborator:** Specify the model name when known (e.g., `Gemini 4 Argon`, `Claude 4.5 Opus`). For older projects where the exact model wasn't recorded, leave the specific model blank or use a general label (e.g., `AI Coding Agent`).
- **Harness:** Specify the environment used (defaults to `Cursor`).

Do not write a breakdown of which side did which task. Keep the team block compact and factual.

---

## 3. Sentence Structure & Punctuation Rules

1. **NEVER use em-dashes (`—`).**
   - Matt never uses em-dashes in personal writing. Do not use `—` (or `--` as a stand-in for an em-dash) anywhere in prose, summaries, UI labels, or page titles.
   - Instead of chaining clauses together with an em-dash, **write two shorter sentences**, or use parentheses `(...)`, a colon `:`, or a comma where appropriate.
   - For page titles and metadata separators, use a pipe `|` (e.g., `Matt Toronto | Projects & Engineering Notes`) or a bullet `&bull;`.
2. **Favor shorter, direct sentences.**
   - Avoid winding compound sentences. If a sentence has more than two clauses, split it in two.
3. **Get straight to the point.**
   - Opening paragraphs should immediately state what was built and why. Never open with broad industry commentary ("In modern web development, static sites have become increasingly popular...").

---

## 4. Scannability & Progressive Disclosure

Avoid dense walls of text. Every post should use progressive disclosure so readers can choose their own depth:

### A. Top-of-Post Overview Card (`overview`)
Every post starts with a dedicated callout card right below the article header.
- **Label:** Frame it based on the post type, such as `TL;DR`, `Architecture at a Glance`, or `Stack Summary`.
- **Bullets:** 2 to 4 concise bullet points summarizing the core stack, mechanism, or takeaway.
- **Collapsible Section Breakdown / Jump Links:** Inside the bottom of the overview card, include a collapsible toggle (`Section Breakdown & Jump Links`) that lists each section heading as an anchor link alongside a 1-sentence gist of that section. Do **not** put individual TL;DR boxes inline inside each section of the article body.

### B. Paragraphs & Inline Formatting
- Keep paragraphs short (typically 2 to 4 sentences).
- Use inline formatting with restraint to help the eye scan:
  - Wrap filenames, CLI commands, flags, config keys, package names, and HTTP routes in inline code tags: `svelte.config.js`, `proxied: false`, `@sveltejs/adapter-static`.
  - Use `<strong>` sparingly on key concepts or bullet lead-ins (e.g., **Registrar (Namecheap):** ...). Do not bold entire sentences or pepper every paragraph with bold text.

### C. Collapsible Deep Dives (`deepDive`)
- When a section includes a side quest, debugging war story, protocol edge case, or optional background detail, put it inside a collapsible `<details>` block rather than letting it bloat the main flow.
- Give the collapsible toggle a clear, specific label (e.g., `Deep Dive: Why querying @a.nic.xyz directly looked empty`).

### D. Code Snippets & Syntax Highlighting (`code`)
- Include real, practical code snippets with a `filename` header and explicit `language` tag (`javascript`, `typescript`, `yaml`, `bash`, `json`, `html`, `css`, etc.) so language-specific syntax highlighting renders properly.
- **Short snippets (~15 lines or fewer):** Render expanded inline. Cleaned-up excerpts are great.
- **Longer scripts (>15–20 lines):** Keep them inside a scrollable container (`max-height`) so a single script never takes over two full screens of vertical scrolling, or place optional/supplementary scripts inside a collapsible block.

### E. Length & Pacing
- There is no artificial word count or section count target. A small utility might need 3 short sections; a complex system might need 8. Include all the technical detail that is actually useful and stop as soon as you're done.

---

## 5. Strict Anti-Patterns (What to Avoid)

Never include any of the following in blog posts or project descriptions:

- **No em-dashes (`—`):** Zero occurrences anywhere in `src/` content or titles.
- **No AI transition clichés:** Never use phrases like:
  - *"Delving into..."* / *"Let's dive in..."*
  - *"In today's fast-paced landscape..."*
  - *"It's not just X; it's Y."*
  - *"Moreover," "Furthermore," "Crucially," "Notably," "Importantly"*
  - *"At its core," "Under the hood" (overused), "Enter [Tool Name]."*
- **No breathless hype or marketing adjectives:** Cut words like *"seamlessly," "revolutionary," "game-changing," "blazingly fast," "effortlessly," "supercharge," "robust," "elegant,"* or *"powerful."* State concrete facts instead.
- **No throat-clearing introductions or wrap-up summaries:** Do not start with a generic philosophy paragraph, and do not end the post with a repetitive "In conclusion, we built X and learned Y" summary paragraph. When the last technical step is done, let the post end cleanly above the Team footnote.
- **No forced humor:** Keep the tone natural and human, not performatively quirky or pun-filled.

---

## 6. Post Drafting Checklist for Agents

Before finalizing a new or edited post in `src/lib/data/content.ts`:

1. [ ] **Zero em-dashes:** Run a check for `—` across the post title, summary, and sections.
2. [ ] **Pronoun check:** Are goals/opinions using `"I"` and shared build/implementation steps using `"we"`?
3. [ ] **Overview card included:** Does the post have an `overview` block (`TL;DR` or `Architecture at a Glance`) with 2–4 bullets and 1-sentence `summary` lines on each section for the collapsible jump list?
4. [ ] **Scannable body:** Are paragraphs short, with inline `` `code` `` for filenames/commands/keys and restrained `<strong>` lead-ins on bullets?
5. [ ] **Rabbit holes tucked away:** Are tangential debugging stories or extra-deep technical notes placed inside `deepDive` collapsible blocks?
6. [ ] **Syntax-highlighted code:** Does every `code` block have an accurate `language` and `filename`?
7. [ ] **Team footnote populated:** Does the post have a `team` object specifying `human`, `aiCollaborator` (model name if known), and `harness`?
