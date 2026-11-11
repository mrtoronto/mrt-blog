# Go Do Stuff (Event Buddy) — Complete Product, UX, & Agent Architecture Overview

> **Purpose of this artifact:** A self-contained product and system architecture dossier explaining **what Go Do Stuff (internal slug: `event-buddy`) is, why it exists, how users interact with it, and how its underlying AI agents work**.
>
> **How to use this alongside `AGENT_OPTIMIZATION_BLOG_NOTES.md`:**
> - **`PRODUCT_AND_AGENT_OVERVIEW.md` (this file)** explains the **product thesis, user experience, living `preferences.md` memory model, and multi-agent workflows** so a blog post reader immediately understands *what* we built and *why* its constraints matter.
> - **`AGENT_OPTIMIZATION_BLOG_NOTES.md`** covers the **evaluation harness (`buddy-eval`), the 34 optimization experiments, latency/cost root-cause analyses, and the 30-case Cloud Run benchmark** that cut search latency by 53% (`96.9s` $\rightarrow$ `45.8s`) and cost by 20% (`$0.214` $\rightarrow$ `$0.172`/stack).

---

## 1. The Problem & Core Product Thesis

### Why Mainstream Event Discovery Fails Real Human Goals
If you move to a new city—or simply want to get off your phone, learn a hands-on skill, and meet people organically—mainstream event platforms (**Eventbrite, Meetup, Luma, Facebook Events, generic "Things to Do This Weekend" SEO directories**) fail in predictable ways:

1. **Popularity & Commercial Bias:** Algorithms rank events by ticket volume, ad spend, or broad category tags (`"Nightlife"`, `"Networking"`, `"Fitness"`). They endlessly surface the same high-volume activities: **5K run clubs, crowded rooftop cocktail mixers, outdoor commercial park yoga, corporate startup networking nights, and massive street festivals**.
2. **Keyword Filtering Misses Experiential & Social Mechanics:** A user rarely just wants *"an art event"* or *"a Saturday night event."* What they actually care about is **how the experience feels socially and physically**:
   - *Is it participatory (making/doing something with my hands) or purely passive spectator entertainment (sitting in the dark watching a comedy show or concert where you talk to zero people)?*
   - *Is it an intimate table of 6–15 people working on a shared task where conversation happens naturally, or a loud bar where you have to cold-approach strangers?*
   - *Does it have grassroots/DIY character, or is it a contrived "$65 Midtown paint-and-sip tourist trap"?*
3. **The Hidden Long Tail of Local Community:** Every vibrant city is full of independent maker spaces, creative reuse depots, community print shops, tool libraries, fixit clinics, neighborhood board game cafes, micro-cinemas, and volunteer stewardship crews. **None of these places buy SEO ads**, and their schedules are scattered across independent websites, local Substacks, community calendars, and plain-text aggregator tables (like `19hz.info` or local indie weeklies).
4. **Stateless Search Amnesia:** On traditional sites, rejecting ten events teaches the search bar nothing. And if you pass on an event because you're busy this Friday (`"Bad Timing"`), a naive thumbs-down algorithm assumes you hate that entire activity category forever.

---

### The Core Thesis: *The Living Taste Profile Is the Product*
**Go Do Stuff** (formerly prototyped as **Event Buddy**) flips the event discovery model upside down:

> **Go Do Stuff is not a static event database with category filters. The core product is a continually improving, human-readable model (`preferences.md`) of what kinds of real-world experiences a specific person finds worthwhile—paired with an autonomous live-web scouting agent that hunts down verified local events matching those exact mechanics.**

Instead of hoarding user preferences inside opaque vector embeddings or black-box collaborative filtering weights, Go Do Stuff stores every user's taste profile as a **structured, 7-section plain-text Markdown document (`preferences.md`)** that:
- The **agent** reads before every search and updates after every round of user feedback or real-world attendance check-in.
- The **user** can inspect, edit directly in the browser, export as a `.md` file, or duplicate into multiple persona profiles (e.g., *"Weekend Maker"*, *"Solo Weeknights"*, *"Date Night"*).

---

## 2. The Heart of the System: The 7-Section `preferences.md` Schema

Every user profile follows a strict 7-section Markdown schema designed so both humans and LLMs can reason over explicit constraints, semantic exclusions, latent psychological/social drivers, concrete local anchors, and historical outcomes.

### The 7 Canonical Sections

| Section | Name | What It Captures & How the Agent Uses It |
|---:|---|---|
| **1** | **`Current Reframed Goal`** | A single-sentence blockquote thesis statement (`> ...`) synthesizing what the user is hunting for right now. Displayed prominently at the top of the Discovery Board so the user always sees how the agent interprets their current goal. |
| **2** | **`Defaults & Hard Constraints`** | Default city/neighborhood, travel radius (e.g., *"Oakland, CA and nearby East Bay: Berkeley, Emeryville, Alameda"*), primary goal (*"Meet people / genuine social connection"*), and demographic filter (*"Adult-oriented; exclude kid/family holiday events"*). |
| **3** | **`Hard Exclusions (Semantic Category Filters)`** | **First-class semantic filters**, not literal keyword blocks. If a user excludes `"run clubs"`, `"rooftop parties"`, or `"purely passive spectator events"`, the agent filters out *"5k social jog"*, *"skyline sunset mixer"*, or *"sit-down comedy showcase"* across both query planning and candidate extraction. |
| **4** | **`Latent & Experiential Preferences (The "Why")`** | A structured Markdown table (`Preference Dimension \| Confidence \| Origin \| Supporting Evidence & Quotes`) capturing cross-cutting experiential mechanics: e.g., **Participatory (doing > watching)**, **Small group (6–15 people)**, **Shared task (natural conversation)**, **DIY / Crafty / Offbeat**, and **Organic weirdness > manufactured fun**. |
| **5** | **`Positive Interests & Anchors`** | Concrete activity domains and **real-world local venues/organizations** the user already loves (e.g., *East Bay Depot for Creative Reuse*, *The Crucible*, *It's Your Move Games*). Used by the planner to craft high-precision `Exploitation` queries and judge neighborhood vibe. |
| **6** | **`Uncertain Hypotheses & Untried Candidates`** | Split into **Planned / Upcoming** events (that need a post-event follow-up) and a **Candidates Not Yet Tried (Strong Fit Backlog)** of recurring local series or neighboring ideas to test in future stacks. |
| **7** | **`Event & Feedback History`** | Ground-truth log divided into distinct semantic buckets: **Attended & Enjoyed**, **Planned / Added to Calendar**, **Positive Interest**, **Logistical Pause / Not Right Now** (activity still valid later!), **Attended Previously (Mixed / Goal Mismatch)**, and **Rejected (Aesthetic / Fit Mismatch — Do Not Repeat)**. |

---

### Real-World Example of a Evolved `preferences.md` Profile

Below is an actual `preferences.md` profile after two rounds of card feedback and a post-event check-in:

```markdown
# Go Do Stuff: User Taste Profile
_Last updated: Tuesday, October 27, 2026_

## 1. Current Reframed Goal
> You want hands-on, indoor maker workshops and craft/artisan studios in Oakland/East Bay (sewing, ceramics, printmaking, woodwork, DIY repair) where you learn tactile skills alongside a small group of local makers, with tabletop games as a secondary social anchor.

## 2. Defaults & Hard Constraints
- **Default Location:** Oakland, CA (and nearby East Bay: Berkeley, Emeryville, Alameda)
- **Primary Goal:** Meet people / genuine social connection
- **Demographic Filter:** Adult-oriented (exclude kid/family holiday events unless requested)

## 3. Hard Exclusions (Semantic Category Filters)
- **Run clubs** / fitness social runs _(Explicit)_
- **Rooftop parties** / generic skyline or cocktail socials _(Explicit)_
- **Yoga in the park** / outdoor commercial wellness sessions _(Explicit)_
- **Purely passive spectator events** (shows, concerts, tours, drag shows where you just watch and don't talk to people) _(Strong dislike)_
- **Contrived / manufactured group activities** (e.g., citywide bicycle scavenger hunt) _(Inferred from Round 1 rejection)_
- **Massive commercial Halloween club parties** / crowded bar crawls _(Inferred for current holiday window)_

## 4. Latent & Experiential Preferences (The "Why")
| Preference Dimension | Confidence | Origin | Supporting Evidence & Quotes |
|---|---|---|---|
| **Participatory (doing > watching)** | Strong (High) | Explicit + Attended | Attended & liked *Free Oakland Up* and *The Crucible*; positive on *Beginner Sewing* at East Bay Depot ("seems neat"). Dislikes passive shows. |
| **Maker & Artisan Workshops** | Strong (High) | Feedback Round 2 | Explicitly requested: "Maker workshops sound more interesting. The beginner sewing seems neat." Prioritize indoor tactile workshops. |
| **Small group** | Strong (High) | Explicit + Inferred | Intimate table/studio sizes (6-15 people) where talking to neighbors and instructor is seamless. |
| **Shared task (natural conversation)** | Strong (High) | Explicit + Inferred | Working on a physical object or game provides shared focus and removes social friction. |
| **DIY / Crafty / Offbeat** | Strong (High) | Attended Outcome | Consistent affinity for creative reuse, upcycling, independent maker spaces. |
| **Outdoor Stewardship** | Nuanced (Hold for later) | Feedback Round 2 | "Not super into outdoor stewardship this week... don't remove from table completely for the future but not in cards for this week." Logistical/seasonal hold. |
| **Recurring format** | Medium | Explicit + Inferred | Likes repeat exposure to the same people to build familiarity over time. |
| **Spectator-only (Disliked)** | Strong Dislike | Explicit + History | Shows, concerts, tours, and passive entertainment don't fulfill the primary goal of talking to people. |
| **Large crowds (Disliked)** | Medium Dislike | Inferred | Prefers studio/intimate settings over crowded events. |

## 5. Positive Interests & Anchors
- **Social practice / creative reuse / DIY community art** (*Free Oakland Up*, *East Bay Depot for Creative Reuse*)
- **Maker spaces & artisan workshops** (Woodworking, textiles/sewing, ceramics/clay, screenprinting/letterpress, glass, electronics/fixit clinics)
- **Tabletop & board game drop-ins** (Casual chess, Scrabble, strategy board game open nights)
- **Community stewardship** (Volunteer gardening/urban forestry, retained on backlog for future weeks)

## 6. Uncertain Hypotheses & Untried Candidates (To Test Next)
### Planned / Upcoming (Follow-Up Needed)
- [ ] **Casual chess drop-in** at *It's Your Move Games & Hobbies, Temescal* | Schedule: Sundays 2-6pm (verify) | Planned date: **2026-11-01**
- [ ] **Beginner sewing / Re:Studio workshops** at *East Bay Depot for Creative Reuse* | Under consideration

### Candidates Not Yet Tried (Strong Fit Backlog)
- [ ] **Open printmaking / linocut / screenprinting drop-in** (East Bay community print shops)
- [ ] **Community clay / pottery one-night workshops** (Oakland/Berkeley ceramics studios)
- [ ] **Fixit Clinic / Repair Cafe** (Community repair events)
- [ ] **Tuesday Night Art Club**, Oakland Public Library (monthly)
- [ ] **Scrabble at It's Your Move Games** (Saturdays 1-5pm, $5)
- [ ] **Volunteer gardening / tree planting** (Melrose garden 4th Saturdays, Friends of Sausal Creek, paused for current week)

## 7. Event & Feedback History
### Attended & Enjoyed (Verified Real-World Outcomes)
- **Free Oakland Up** (*social practice art project, Oakland*) | **Reaction:** Strong Positive ("appealing; added to calendar") | **Attended:** Yes | **Outcome:** `"neat"`
- **Heavy Metal: Industrial Artisan Fair** (*The Crucible, West Oakland*) | **Reaction:** Positive | **Attended:** Yes | **Outcome:** `"cool"`

### Planned / Added to Calendar
- **Casual chess drop-in** (*It's Your Move Games & Hobbies, Temescal*) | **Date:** Sunday, Nov 1, 2026 (Sundays 2-6pm) | **Notes:** Follow up after event; candidate recurring regular.

### Positive Interest (Round 2 Scouting)
- **Beginner Sewing: Upcycled Halloween Cauldron Mini Pouch** (*East Bay Depot for Creative Reuse*) | **Reaction:** Positive ("The beginner sewing seems neat")

### Logistical Pause / Not Right Now (Activity Still Valid Later)
- **Outdoor Stewardship (Monterey Redwoods, Lake Merritt Gardens/Cleanup)** | **Reaction:** Temporarily passed for Oct 31 window ("Not super into outdoor stewardship this week... keep on table for future").

### Attended Previously (Mixed / Goal Mismatch)
- **HellaFunny comedy shows** (Oakland) | **Reaction:** Mixed | **Reason:** *"fun but not social; I don't talk to people there"*

### Rejected (Aesthetic / Fit Mismatch - Do Not Repeat)
- **Round 1 batch (concerts, tours, festivals, drag show, bike scavenger hunt)** | **Reaction:** Silent rejection | **Reason:** Passive spectator or contrived.
```

---

## 3. Product Design & User Experience: Why a "Card Stack" Instead of a Chatbot

### Evolution from Terminal CLI (`uv run buddy`) to Action-Oriented Web App
We originally built **Event Buddy** as a conversational terminal CLI (`mvp/cli.py` + `mvp/agent.py`) where a user chatted back and forth with an autonomous Gemini agent that called `search_local_events` and `update_preferences` on a local `preferences.md` file.

While the conversational loop proved the core thesis, early user testing revealed two major UX lessons:
1. **Triaging events is an action-oriented decision task, not an open-ended chat:** Typing `"I like #2 and #5, skip #1 because I'm busy Friday, and #3 sounds too corporate"` in a chat box is tedious on desktop and painful on mobile.
2. **Grids of 8 long event descriptions cause cognitive overload:** Dumping 8 detailed event write-ups on screen at once makes users skim titles and miss the subtle experiential details (*"Why it fits you"* and *"Caveats"*).

### The Risograph / Indie Zine Card Stack Interface
We designed the full-stack web application (**Go Do Stuff**) around a warm, tactile **Risograph / Indie Zine aesthetic** (`#FAF5E8` cream paper background, `#FFFDF7` ivory cards, `#1E242B` ink borders with hard offset shadows, and teal/tangerine/gold accents) that feels like flipping through hand-picked flyers at an independent neighborhood coffee shop rather than scrolling a corporate SaaS dashboard.

The app is organized into a **3-Step Closed-Loop Workflow** across three primary workspaces (plus a Homepage Hub and Classic Chat mode):

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                         THE GO DO STUFF CLOSED-LOOP WORKFLOW                      │
└───────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────┐
  │ 1. MY TASTE (/preferences)   │
  │ • 3-Step Starter Popup       │
  │ • Taste Profile Coach Chat   │◄─── Entity Grounding: Coach looks up venues
  │   (1-question budget)        │     you mention (e.g. "Free Oakland Up") via
  │ • Multi-Profile Switcher     │     Google Search to infer "The Why" automatically
  └──────────────┬───────────────┘
                 │
                 ▼  Reads active `preferences.md`
  ┌──────────────────────────────┐
  │ 2. FIND STUFF (/discover)    │
  │ • Prompt or Quick Date Chip  │
  │ • Multi-Bucket Live Search   │───► 60–70% Core Match (Exploitation)
  │   (Plan -> Search -> Verify) │     20–30% Adjacent Pick (Shared Mechanics)
  │ • Single-Card Stack (5–8)    │     10% Wildcard Pick (Serendipitous Leap)
  └──────────────┬───────────────┘
                 │
                 ├──► Rate each card: [I'm Going!] [Save for Later] [Bad Timing] [Not for Me]
                 │    + optional free-text / voice-dictated "Why?" note
                 │
                 ├──────────────────────────────────────────┐
                 ▼                                          ▼
  ┌──────────────────────────────┐           ┌──────────────────────────────────────┐
  │Fold Reactions into Profile   │           │ 3. MY PLANS (/schedule)              │
  │• "Save to Preferences" OR    │           │ • Going Next (1-click GCal export)   │
  │• "Save & Deal Fresh Stack"   │           │ • Saved for Later (Backlog)          │
  │• Updates Section 1, 3, 4, 7  │           │ • How Did It Go? (Post-Event Check-in│
  └──────────────────────────────┘           │   Attended & Enjoyed / Mixed / Skip) │
                 ▲                           └──────────────────┬───────────────────┘
                 └──────────────────────────────────────────────┘
                        Real-world attendance outcomes feed back
                        into `preferences.md` with highest weight!
```

---

### Detailed Walkthrough of Each Workspace

#### Workspace 1: My Taste & Preferences (`/preferences` — `PreferencesStudio.svelte`)
- **Zero-Friction 3-Question Onboarding Popup:** New users are never dumped onto an empty chat screen or pre-seeded with someone else's profile. When a new account is created (`needs_onboarding = true`), the app opens a quick 3-step setup card:
  1. *Where are you based (city/neighborhood & travel radius)?*
  2. *What kinds of activities, workshops, or vibes do you enjoy?*
  3. *Anything you're tired of seeing and want to skip (e.g., run clubs, bars, networking mixers)?*
- **The Dedicated Taste Profile Coach (`run_preferences_onboarding_turn`):**
  - Submitting the 3-step popup immediately sends the user's answers to the **Taste Profile Coach**, which writes a complete 7-section `preferences.md` document, auto-titles the profile (e.g., `"Oakland Maker & Board Games"`), shows a green **"Saved to your preferences"** diff summary box, and reveals a prominent **"Find Events"** button in the header.
  - **Smart Entity/Anchor Lookup Grounding:** If a user says *"I loved going to Free Oakland Up and The Crucible"*, the coach doesn't ask *"What is Free Oakland Up?"* Instead, it uses **Google Search + URL Context grounding** behind the scenes to look up those exact local organizations, infer their format/vibe (grassroots social-practice art, industrial fire/metalworking studio), and populate Section 4 (*Latent Preferences*) and Section 5 (*Positive Anchors*) automatically.
  - **Strict 1-Question Budget (No Endless AI Interviews):** On Turn 1, the coach confirms the profile is ready to search immediately and asks *at most one* optional follow-up question. From Turn 2 onward, it stops asking unprompted questions so users aren't trapped in an interrogation before seeing events.
- **Multiple Named Taste Profiles (`preference_documents`):** A single user can maintain separate `preferences.md` documents for different social contexts—for example, a *"Solo Weeknight Maker"* profile, a *"Saturday Outdoor Volunteering"* profile, or a *"Visiting Chicago"* profile—and switch between them with one click.

#### Workspace 2: Find Stuff — The Event Card Stack (`/discover` — `DiscoverBoard.svelte`)
- **Search Bar, Quick Deal Chips, & Active Goal Framing:**
  - At the top of `/discover`, the user sees their active profile pill, their default location, and their 1-sentence **"What We're Hunting For"** goal banner (Section 1 of `preferences.md`).
  - Users can type or voice-dictate any natural language request (e.g., *"Something hands-on under $25 this Saturday afternoon"*) or tap one-click window chips: **`This Weekend`**, **`Tonight`**, **`This Week`**, or **`Surprise Me`**.
- **Live Transparent Progress While Scouting (SSE):**
  - Because live web grounding searches real local calendars in real time, the UI streams a 4-stage visual progress tracker (`Planning your search` $\rightarrow$ `Searching for events` $\rightarrow$ `Checking events` $\rightarrow$ `Building your event stack`) along with the live search plan (`Exploitation`, `Adjacent`, and `Wildcard` queries) so the user can see *where* and *how* their buddy is hunting.
- **Focused Single-Card Stack Presentation (`Option 1 of N`):**
  - Rather than a wall of text, the batch of **5 to 8 verified events** is dealt as an interactive **layered card stack** viewed one card at a time (`Prev` / `Next` buttons + numbered status dots along the top).
  - **Every Event Card Contains:**
    1. **Event Visual Banner (`EventVisual.svelte`):** The real event flyer or venue OpenGraph image scraped from the source page (or a custom Risograph art illustration fallback if the venue site has no flyer), paired with a humanized Discovery Bucket badge:
       - 🎯 **`Core Match`** (`Exploitation` — 60–70% of stack)
       - 🧭 **`Adjacent Pick`** (`Adjacent` — 20–30% of stack)
       - 🎲 **`Wildcard Pick`** (`Wildcard` — 10% of stack)
    2. **Direct Hyperlinked Title (`[Event Title ↗](source_url)`):** Clicking the title opens the canonical venue or event page directly in a new tab.
    3. **Logistics Strip:** Day & date label (`Saturday, Nov 7, 2026` or `Recurring Weekly`), start/end time (`1:00 PM - 4:00 PM`), Venue & Neighborhood/Address, and exact Price (`Free`, `$20`, `Sliding scale $10-$25`).
    4. **What Happens (`description`):** Written in concrete, factual, non-promotional language (strictly zero marketing buzzwords and zero em-dashes `—`), explaining what you physically do there and how social interaction works.
    5. **Why It Fits You (`why_it_fits`):** An explicit 1–2 sentence tie-back to the user's `preferences.md` dimensions and anchors.
    6. **Caveats & Verification (`caveats`):** Honest social or logistical caveats (e.g., *"Popular drop-in; arrive 15 minutes early to grab a workbench"* or *"Listed on monthly studio calendar; confirm exact materials fee on venue site"*).
- **4-Way Per-Card Reaction Toggles + Voice/Text `"Why?"` Notes:**
  - At the bottom of each card, the user clicks one of four semantic reactions:
    - 🟢 **`I'm Going!`** (`going`): Immediately adds the event to **My Plans → Going Next**.
    - 🔵 **`Save for Later`** (`interested`): Bookmarks the event (or recurring series) into **My Plans → Saved for Later**.
    - 🟡 **`Bad Timing`** (`bad_timing`): Marks a logistical/schedule conflict so the agent knows *not* to penalize the activity type!
    - 🔴 **`Not for Me`** (`not_interested`): Marks an aesthetic, vibe, or social mismatch so the agent refines its exclusions and latent boundaries.
  - Right below the buttons is an inline **"Why? (optional note)"** input (with built-in microphone voice dictation) where users can add context like *"Too expensive for a 1-hour class"* or *"Love printmaking, just want something closer to Temescal."*
- **End-of-Stack Wrap-Up Card & Feedback Synthesis:**
  - After flipping through the cards, the final card in the stack is a **Wrap-Up Summary** showing all reactions in the batch, an optional overall steering note, and two primary actions:
    1. **`Update Profile Only`**: Synthesizes all card reactions and `"Why?"` notes into `preferences.md` and displays the exact bullet-point diff of what the agent learned.
    2. **`Update Profile & Deal Fresh Stack`**: Updates `preferences.md` first, then immediately launches a new search round using the newly refined `Current Reframed Goal`, updated exclusions, and `already_seen` deduplication list.

#### Workspace 3: My Plans & Post-Event Check-Ins (`/schedule` — `ScheduleView.svelte`)
- **Closing the Real-World Loop:** Most recommendation engines stop at the click. Go Do Stuff tracks what happens *after* you leave the house across three tabs:
  1. **`Going Next`:** Upcoming committed events sorted chronologically, complete with **1-click "Add to Google Calendar"** links (automatically parsing `start_date_iso`, `time_label`, `venue`, and `source_url` into a pre-filled Google Calendar template) and a `+ Log / Add Event` button for outside events.
  2. **`Saved for Later`:** A personal backlog of intriguing events and recurring weekly/monthly series to revisit in future weeks.
  3. **`How Did It Go?` (Post-Event Check-Ins):** Once an event's date passes (`is_past_due`), a notification badge prompts the user to check in with three real-world outcome states:
     - **`Attended & Enjoyed`** (`attended_liked`)
     - **`Attended (Mixed / Not Social Enough)`** (`attended_mixed`)
     - **`Didn't End Up Going`** (`skipped`)
     - Submitting a check-in (plus a note like *"Met two great people at the sewing table, definitely going back next month"*) triggers `synthesize_feedback_into_preferences`, which treats verified real-world attendance as the highest-confidence signal in Section 4 and Section 7 of `preferences.md`.

---

## 4. Why the 60 / 30 / 10 Discovery Bucket Split Matters

A central design principle of the Go Do Stuff agent is that **pure exploitation creates a boring filter bubble, while pure random exploration feels broken**. Every search plan (`SearchPlanSchema`) and extracted stack (`StructuredDiscoveryOutput`) is intentionally partitioned into three discovery buckets:

1. **60–70% `Exploitation` (`Core Match`):**
   - High-confidence queries targeting the user's explicit positive interests and known anchor venues from Section 5 of `preferences.md` (e.g., querying specific Oakland ceramics studios, creative reuse centers, and board game cafes for someone who loves tactile crafts and tabletop games).
2. **20–30% `Adjacent Exploration` (`Adjacent Pick`):**
   - Queries targeting **neighboring experiential domains that share the same underlying social and physical mechanics** from Section 4, even if the user hasn't explicitly named that medium yet.
   - *Example:* If a user likes beginner sewing and tabletop games because they enjoy *"small groups of 6–15 people doing a shared tactile task where conversation happens naturally,"* an `Adjacent` query hunts for a **community linocut printmaking drop-in**, a **bookbinding studio night**, or a **neighborhood Fixit Clinic / Repair Cafe**.
3. **10% `Wildcard` (`Wildcard Pick`):**
   - A serendipitous lateral leap outside the user's normal routine that still respects every Hard Exclusion and comes with a **defensible hypothesis** in `"Why it fits you"` (e.g., an independent planetarium lecture + telescope viewing, an oddball museum after-hours workshop, or a community zine swap).

---

## 5. How the Agent System Works Under the Hood (Four Distinct Agentic Workflows)

Rather than forcing one monolithic prompt to handle interviewing, live web search, JSON extraction, and profile editing all at once, Go Do Stuff separates its intelligence into **four specialized agentic workflows** powered by `gemini-3.8-flash` via the `google-genai` SDK:

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                   FOUR SPECIALIZED AGENT WORKFLOWS IN GO DO STUFF                    │
├──────────────────────────┬───────────────────────────────────┬───────────────────────┤
│ Workflow                 │ Trigger / Endpoint                │ Gemini Capabilities   │
├──────────────────────────┼───────────────────────────────────┼───────────────────────┤
│ A. Structured Discovery  │ POST /api/discovery/search/stream │ • Stage 1: JSON Plan  │
│    Pipeline              │ (`execute_discovery_pipeline`)    │ • Stage 2: Parallel   │
│                          │                                   │   GoogleSearch Workers│
│                          │                                   │ • Stage 3: JSON Cards │
├──────────────────────────┼───────────────────────────────────┼───────────────────────┤
│ B. Taste Profile         │ POST /api/profile/documents/{id}/ │ • GoogleSearch +      │
│    Onboarding Coach      │ chat (`run_preferences_...`)      │   UrlContext (Entity  │
│                          │                                   │   Lookup ONLY)        │
│                          │                                   │ • JSON Schema Output  │
├──────────────────────────┼───────────────────────────────────┼───────────────────────┤
│ C. Feedback & Outcome    │ POST /api/discovery/batches/{id}/ │ • Structured JSON     │
│    Synthesizer           │ apply-feedback/stream &           │   (`PreferenceUpdate  │
│                          │ POST /api/events/{id}/outcome     │   Output`)            │
├──────────────────────────┼───────────────────────────────────┼───────────────────────┤
│ D. Autonomous Multi-Turn │ CLI (`uv run buddy`) &            │ • Autonomous Function │
│    Tool-Calling Agent    │ POST /api/sessions/{id}/messages/ │   Calling (`search_   │
│                          │ stream (Classic Chat `/chat`)     │   local_events`,      │
│                          │                                   │   `update_preferences`│
│                          │                                   │   `read_preferences`) │
└──────────────────────────┴───────────────────────────────────┴───────────────────────┘
```

---

### Workflow A: The Multi-Stage Structured Discovery Pipeline (`execute_discovery_pipeline`)

When a user clicks **Find Events** on `/discover`, the backend executes a multi-stage pipeline (`api/app/services_discovery.py` + `mvp/search.py`) parameterized by `DiscoveryConfig`:

1. **Deduplication Pre-Check (`already_seen`):**
   - Queries SQLite/Postgres for the titles of events the user has already saved (`UserEvent`) or rejected (`CandidateEvent.reaction_status == "not_interested"`) and combines them with Section 7 of `preferences.md` so the agent never deals the same event twice.
2. **Stage 1 — Search Planner (`build_plan_prompt` $\rightarrow$ `SearchPlanSchema` JSON):**
   - Reads the user's `preferences.md`, `already_seen` list, current prompt, and current local date (`Tuesday, Nov 10, 2026`).
   - Resolves relative time expressions (`"this weekend"`, `"tonight"`, `"next week"`) into concrete calendar dates (`date_window`, e.g., `"Friday Nov 13 - Sunday Nov 15, 2026"`).
   - Synthesizes a 1-sentence `reframed_goal` for this specific search and generates targeted Google Search queries partitioned into `exploitation_queries`, `adjacent_queries`, and `wildcard_queries`.
3. **Stage 2 — Live Grounded Web Search & Redirect Resolution (`execute_event_search`):**
   - Uses Gemini's built-in **Grounding with Google Search** (`types.Tool(google_search=types.GoogleSearch())`, plus optional `types.Tool(url_context=types.UrlContext())` in 2-pass `Deep Read` mode).
   - Prioritize high-discovery local sources: independent venue calendars, maker spaces, creative reuse depots, community colleges/studios, neighborhood roundups, and local aggregators over generic ticket directories.
   - Extracts `grounding_chunks` from Gemini's response metadata and resolves Google's `https://vertexaisearch.cloud.google.com/grounding-api-redirect/...` URLs into canonical venue URLs (`GroundingSource.resolved_uri`) via parallel `httpx` workers.
4. **Stage 3 — Verified Card Curation & Structured Extraction (`build_structure_prompt` $\rightarrow$ `StructuredDiscoveryOutput` JSON):**
   - Evaluates the grounded candidate findings against `preferences.md` and strict selection rules:
     - **Anti-Hallucination Citation Rule:** Every card's `source_url` *must* come from the verified canonical grounding URLs.
     - **Geographic & Temporal Verification:** Venue must actually be in/near `location` (never confusing similarly named streets/cities in other states) and match `date_window` in the current year (or be clearly marked `is_recurring = true`).
     - **Semantic Exclusion Enforcement:** Strips out any candidate that violates Section 3 Hard Exclusions or prompt-level constraints (budget, indoor, sober, daytime).
     - **Intra-Batch Diversity:** Enforces variété across venues and activity subtypes so a user who likes ceramics and board games doesn't get 5 pottery wheel classes at the same studio.
     - **Anti-Hype Copy Style:** Strips marketing buzzwords and strictly forbids em-dashes (`—`).
   - Outputs 5 to 8 `StructuredCandidateItem` objects persisted as `CandidateEvent` rows inside a `DiscoveryBatch`.
5. **Stage 4 — Progressive SSE Delivery & Multi-Strategy Flyer Image Hydration:**
   - The moment Stage 3 finishes, the backend emits `event: cards_ready` over Server-Sent Events (SSE) so the user can immediately read and interact with Card #1.
   - In parallel (`fetch_event_image_url`), background workers scrape OpenGraph/Twitter flyer images (`og:image`, `twitter:image`, JSON-LD `Event.image`) from each card's `source_url`—using a multi-tier fallback chain (standard Chrome headers $\rightarrow$ `WhatsApp/2.23.20.0` link-preview bot headers for sites like Resident Advisor that block browsers with Cloudflare `403` $\rightarrow$ hopping one step through aggregator tables like `19hz.info` using a title match $\rightarrow$ Microlink API fallback) and stream individual `event: card_image` SSE updates as each flyer resolves.

---

### Workflow B: The Taste Profile Onboarding Coach (`run_preferences_onboarding_turn`)

Located in `api/app/services_discovery.py`, this agent powers the chat inside `/preferences`:
- **Role Boundary:** Explicitly forbidden from searching for or recommending upcoming weekend event schedules. Its sole job is listening to the user's tastes, frustrations, and past experiences and maintaining their `PreferenceDocument`.
- **Selective Entity Grounding:** Configured with `google_search` and `url_context` tools *strictly* so that if the user mentions an unfamiliar local venue, collective, past event, or URL (e.g., *"I go to 7th West"* or *"I liked East Bay Bike Party"*), the coach can look up what that entity is in the real world and extract accurate latent dimensions into Sections 4, 5, and 7.
- **Structured Output (`OnboardingTurnSchema`):** Returns `reply` (conversational response), `should_update_document` (`bool`), `updated_markdown` (full 7-section Markdown), `change_summary` (bulleted diff list shown in the UI), `reframed_goal`, and `updated_title` (auto-naming the profile when it has a generic title like `"Default Profile"`).

---

### Workflow C: The Feedback & Outcome Synthesizer (`synthesize_feedback_into_preferences`)

When a user finishes rating a card stack (`/api/discovery/batches/{id}/apply-feedback/stream`) or logs a post-event check-in (`/api/events/{id}/outcome`), the backend compiles a structured feedback report:

```text
Discovery Batch Query: What should I do this weekend? (Oakland, CA | Friday Nov 6 - Sunday Nov 8, 2026)
Overall User Batch Note / Steering: Looking for more indoor tactile crafts and fewer outdoor walks.
- [GOING (Added to Upcoming Schedule - Strong Positive)] **Sunday Chess Drop-In** (It's Your Move Games, Sunday, Nov 8) | User Reason/Note: "Easy way to play casual games and chat"
- [INTERESTED (Saved to Candidate Backlog - Positive)] **Beginner Linocut Printmaking** (kala Art Institute, Saturday, Nov 7)
- [BAD TIMING / HOLD (Logistical or Seasonal Pass - Do NOT penalize activity type)] **Sausal Creek Habitat Restoration** (Dimond Park, Saturday, Nov 7) | User Reason/Note: "Raining this Saturday, keep for spring"
- [NOT FOR ME (Rejected - Aesthetic / Social Mismatch)] **Downtown First Friday Street Fest** (Telegraph Ave, Friday, Nov 6) | User Reason/Note: "Too crowded and loud to actually meet anyone"
```

The Taste Profile Synthesizer (`PreferenceUpdateOutput` schema) folds this evidence into all 7 sections of `preferences.md`, returning both the updated Markdown document and a human-readable `change_summary` list that streams back to the UI toast/drawer.

---

### Workflow D: The Autonomous Multi-Turn Tool-Calling Agent (`EventBuddyAgent`)

Located in `mvp/agent.py` (CLI) and `api/app/services_agent.py` (`UserScopedAgentRunner` for `/chat`), this is the classic autonomous ReAct-style agent loop (up to 6 tool iterations per turn) equipped with three native Gemini function declarations:
1. **`search_local_events(...)`**: Takes `location`, `date_window`, `search_goal`, `exploitation_queries`, `adjacent_queries`, `wildcard_queries`, `exclusions`, and `seen_events`, and executes the live grounded search pipeline.
2. **`update_preferences(...)`**: Writes the updated 7-section `preferences.md` content along with `change_summary` and `reframed_goal`.
3. **`read_preferences()`**: Reads the latest `preferences.md` (in addition to automatic `<current_preferences_md>` context injection on every turn so manual user edits in the drawer or on disk are always respected immediately).

---

## 6. Technical Stack & System Architecture

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           GO DO STUFF SYSTEM ARCHITECTURE                         │
└───────────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────────────────────┐
  │ SVELTEKIT 2 / SVELTE 5 SPA (`web/src/`) — Risograph / Indie Zine UI           │
  │  • `/` Home Hub   • `/discover` Card Stack   • `/schedule` My Plans           │
  │  • `/preferences` Taste Studio   • `/chat` Classic Chat   • `/help` Guide     │
  │  • Browser Web Speech API Dictation + Progressive SSE Stream Consumer         │
  └───────────────────────────────────────┬───────────────────────────────────────┘
                                          │ REST + Server-Sent Events (SSE)
                                          ▼
  ┌───────────────────────────────────────────────────────────────────────────────┐
  │ FASTAPI BACKEND (`api/app/`)                                                  │
  │  • Routers: `discovery.py`, `profile.py`, `events.py`, `sessions.py`, `auth.py`│
  │  • `_InflightStreamHub`: Coalesces duplicate/reconnected SSE streams          │
  │  • Auth: Argon2id passwords + SHA-256 `HttpOnly` session cookies + 6-digit    │
  │    Resend email verification + per-user daily search guardrails               │
  └───────────┬───────────────────────────────────────────────────────┬───────────┘
              │                                                       │
              ▼                                                       ▼
  ┌─────────────────────────────────────────┐   ┌─────────────────────────────────┐
  │ CORE AGENT & SEARCH ENGINE (`mvp/`)     │   │ RELATIONAL DB (SQLAlchemy 2)    │
  │  • `services_discovery.py`              │   │  • Local Dev: SQLite (`WAL`)    │
  │  • `mvp/search.py` (Gemini Grounding,   │   │  • Prod: Neon Serverless PG     │
  │    Parallel Workers, Redirect Resolver, │   │  • Tables: `users`,             │
  │    Multi-Strategy Flyer Image Scraper)  │   │    `preference_documents`,      │
  │  • `mvp/prompts.py` & `mvp/agent.py`    │   │    `discovery_batches`,         │
  └───────────────────┬─────────────────────┘   │    `candidate_events`,          │
                      │                         │    `user_events`,               │
                      ▼                         │    `chat_sessions/messages`     │
  ┌─────────────────────────────────────────┐   └─────────────────────────────────┘
  │ GOOGLE GEMINI API (`google-genai` SDK)  │
  │  • Model: `gemini-3.8-flash`            │
  │  • Tools: `GoogleSearch`, `UrlContext`  │
  │  • Structured Pydantic JSON Outputs     │
  └─────────────────────────────────────────┘
```

### Key Engineering Details
- **Frontend (`web/`):** Built with **SvelteKit 2 + Svelte 5 Runes** (`$state`, `$derived`, `$effect`), compiled via `@sveltejs/adapter-static` into a static SPA served directly by FastAPI in production. Uses native browser `SpeechRecognition` / `webkitSpeechRecognition` for zero-latency voice dictation across search bars, card feedback notes, and onboarding chat.
- **Backend (`api/` & `mvp/`):** **Python 3.12 + FastAPI + SQLAlchemy 2 + Alembic**. Uses **SQLite (`event_buddy.db` in WAL mode)** for zero-config local development and **Neon PostgreSQL** in production.
- **Resilient SSE Streaming (`_InflightStreamHub` in `api/app/routers/discovery.py`):** If a user refreshes their browser tab or their mobile connection blips mid-search, `_InflightStreamHub` coalesces the reconnected SSE request onto the already-running background search thread and replays all emitted status/plan/card events from memory so the search is never lost or double-billed.
- **Single-Container Cloud Deployment (`Dockerfile`):** A single multi-stage Docker image (Node 22 Alpine frontend build $\rightarrow$ Python 3.12 Slim + `uv` backend) powers the **Google Cloud Run Service (`event-buddy`)**, the **Database Migration Job (`event-buddy-migrate`)**, and the **Cloud Evaluation Job (`event-buddy-eval`)**, guarded by active-user inflight checks (`./scripts/check-active-users.sh`) so deployments never sever an active user's SSE stream.

---

## 7. Why This Product Was Uniquely Hard to Optimize (Bridge to the Optimization Blog Post)

Understanding what Go Do Stuff does makes it obvious why standard "make your LLM faster and cheaper" advice would have destroyed the product:

1. **You Cannot Cache Live Local Events Across Users:** Every search depends on a user's hyper-specific 7-section `preferences.md` (their neighborhood, their semantic exclusions, their specific studio anchors, and the exact events they already rejected in Section 7) plus relative time windows (`"tonight"`, `"this Saturday afternoon"`).
2. **You Cannot Skip Live Web Search Grounding:** An ungrounded LLM will happily hallucinate plausible-sounding pottery classes at real Oakland studios on dates they don't exist, or cite dead homepage links. Every single recommended card *must* be backed by a live Google Search grounding chunk with a verified date, time, price, and resolved source URL.
3. **Broadening Queries Saves Money Ready-Made, But Destroys Hyper-Local Magic:** As we proved in Wave 1 of `AGENT_OPTIMIZATION_BLOG_NOTES.md`, collapsing 8–10 specific search queries into 4 broad `OR` queries cut cost by 58% and latency by 32%, **but lost `11–1` in blind side-by-side judging** because broad queries surfaced generic city-wide listings instead of the user's Section 5 neighborhood studio anchors and Section 6 hypotheses.
4. **The Product Promise Is "7–8 Diverse, Non-Obvious Local Flyers":** A stack where 4 of 7 cards are pottery classes at the same studio—or where the `Adjacent` and `Wildcard` buckets are missing—violates the core reason people use Go Do Stuff.

How we built an automated 4-layer evaluation harness (`buddy-eval`) and re-architected the sequential 4-stage pipeline into a **1-Worker-Per-Query Parallel Map-Reduce pipeline**—cutting median latency from **`96.2s` to `44.6s` (-53.7%)** and cost by **20%** while achieving an exact **`15–15` blind A/B quality tie** across 30 stratified city/prompt test cases—is documented in full in **`AGENT_OPTIMIZATION_BLOG_NOTES.md`**.
