export interface Project {
	title: string;
	slug: string;
	description: string;
	repoUrl?: string;
	liveUrl?: string;
	tags: string[];
	status: 'Active' | 'In Progress' | 'Shipped';
	relatedPostSlug?: string;
	relatedPosts?: { slug: string; label: string }[];
}

export interface CodeSnippet {
	filename?: string;
	language: string;
	snippet: string;
}

export interface DeepDiveBlock {
	title: string;
	paragraphs: string[];
	bullets?: string[];
	code?: CodeSnippet;
}

export interface PostSection {
	id?: string;
	heading?: string;
	summary?: string;
	paragraphs: string[];
	bullets?: string[];
	code?: CodeSnippet;
	deepDive?: DeepDiveBlock;
}

export interface PostOverview {
	label: string;
	bullets: string[];
}

export interface PostTeam {
	human: string;
	aiCollaborator?: string;
	harness?: string;
}

export interface BlogPost {
	slug: string;
	title: string;
	date: string;
	readingTime: string;
	summary: string;
	repoUrl?: string;
	repoName?: string;
	liveUrl?: string;
	liveLabel?: string;
	tags: string[];
	overview?: PostOverview;
	sections: PostSection[];
	team?: PostTeam;
}

export const siteMeta = {
	title: 'Matt Toronto | Projects & Engineering Notes',
	author: 'Matt Toronto',
	githubHandle: 'mrtoronto',
	githubUrl: 'https://github.com/mrtoronto',
	siteUrl: 'https://m-r-t.xyz',
	ogImage: 'https://m-r-t.xyz/og-image.jpg',
	description:
		'A collection of software projects, architecture write-ups, and engineering experiments.'
};

export const projects: Project[] = [
	{
		title: 'Go Do Stuff',
		slug: 'go-do-stuff',
		description:
			'Hyper-local event discovery agent built around a living preferences.md taste profile, a card-stack UX, and a Gemini live-search pipeline. Private source repo; public app.',
		liveUrl: 'https://go-do-stuff.com',
		tags: ['Agents', 'Gemini', 'FastAPI', 'SvelteKit', 'Cloud Run'],
		status: 'Active',
		relatedPosts: [
			{ slug: 'go-do-stuff-agent', label: 'Product & Agent' },
			{ slug: 'go-do-stuff-agent-optimization', label: 'Optimization' }
		]
	},
	{
		title: 'mrt-blog',
		slug: 'mrt-blog',
		description:
			'Static project blog and engineering log built with SvelteKit 5, deployed via GitHub Actions to GitHub Pages, and served on a custom domain through Cloudflare DNS.',
		repoUrl: 'https://github.com/mrtoronto/mrt-blog',
		liveUrl: 'https://m-r-t.xyz',
		tags: ['SvelteKit', 'TypeScript', 'GitHub Actions', 'Cloudflare DNS'],
		status: 'Active',
		relatedPostSlug: 'how-this-site-works'
	}
];

export const posts: BlogPost[] = [
	{
		slug: 'go-do-stuff-agent',
		title: 'Go Do Stuff: A Living Taste Profile and Live-Search Event Agent',
		date: '2026-11-10',
		readingTime: '12 min read',
		summary:
			'How Go Do Stuff turns a plain-text preferences.md taste profile into a live-web event scout that deals verified local cards instead of chatbot waffle or SEO directory noise.',
		liveUrl: 'https://go-do-stuff.com',
		liveLabel: 'go-do-stuff.com',
		tags: ['Agents', 'Gemini', 'FastAPI', 'SvelteKit', 'Preferences.md'],
		overview: {
			label: 'Architecture at a Glance',
			bullets: [
				'**Product thesis:** The living `preferences.md` taste profile is the product. Event search is the delivery mechanism.',
				'**UX:** A 3-step loop across My Taste, Find Stuff (card stack), and My Plans with post-event check-ins that feed real outcomes back into the profile.',
				'**Agent system:** Four specialized workflows on `gemini-3.8-flash` (discovery pipeline, onboarding coach, feedback synthesizer, classic tool-calling chat) instead of one monolithic prompt.',
				'**Stack:** SvelteKit 2 / Svelte 5 SPA, FastAPI + SQLAlchemy, Gemini Grounding with Google Search, Cloud Run. Live at [go-do-stuff.com](https://go-do-stuff.com).'
			]
		},
		sections: [
			{
				paragraphs: [
					'I built Go Do Stuff (internal slug `event-buddy`) because mainstream event discovery keeps failing in the same predictable ways. Eventbrite, Meetup, Luma, and SEO "things to do" directories rank by ticket volume and ad spend. They surface the same 5K run clubs, crowded rooftop cocktail mixers, commercial park yoga, and $65 tourist paint-and-sips. Keyword filters miss how an event actually feels socially and physically: whether you are making something with your hands at a table of 6 to 15 people where conversation happens naturally, or sitting in the dark at a comedy show talking to zero people.',
					'Every city has a long tail of independent maker spaces, creative reuse depots, community print shops, tool libraries, fixit clinics, board game cafes, and volunteer stewardship crews. None of them buy SEO ads. Their schedules live across independent studio websites, local Substacks, and plain-text aggregator tables like `19hz.info`. And on traditional platforms, search is stateless: rejecting ten events teaches the search bar nothing, while passing on one event because you are busy Friday makes a naive algorithm assume you hate that activity forever.',
					'Go Do Stuff flips that model. I decided the core product should not be a static event database. The product is a continually improving, human-readable taste profile (`preferences.md`) of what kinds of real-world experiences a specific person finds worthwhile, paired with an autonomous live-web scouting agent that hunts down verified local events matching those mechanics. The live app is at [go-do-stuff.com](https://go-do-stuff.com). The source repo is private, so this post includes the schemas and architecture inline. A companion post covers how we cut median search latency by 53% and cost by 20%: [Optimizing the Go Do Stuff Agent](/posts/go-do-stuff-agent-optimization/).'
				]
			},
			{
				id: 'preferences-schema',
				heading: '1. The Heart of the System: preferences.md',
				summary:
					'Every user profile is a strict 7-section Markdown document that both humans and the agent can read, edit, and reason over.',
				paragraphs: [
					'I did not want to lock user taste inside opaque vector embeddings or black-box collaborative filtering weights. Every user profile in Go Do Stuff is stored as a structured, 7-section plain-text Markdown document (`preferences.md`).',
					'The agent reads `preferences.md` before every search and updates it after every round of card feedback or post-event attendance check-in. In the browser (`/preferences`), the user can inspect the raw file, edit it directly, export it as `.md`, or maintain multiple named persona profiles (`preference_documents`) for different contexts like "Solo Weeknight Maker", "Saturday Outdoor Volunteering", or "Visiting Chicago".',
					'Each of the seven canonical sections serves a specific job during planning and filtering:'
				],
				bullets: [
					'**1. Current Reframed Goal:** A single-sentence blockquote thesis (`> ...`) synthesizing what the user is hunting for right now, shown at the top of the Discovery Board.',
					'**2. Defaults & Hard Constraints:** Default city and neighborhood radius (for example, Oakland plus Berkeley, Emeryville, and Alameda), primary social goal, and demographic filter.',
					'**3. Hard Exclusions (Semantic Category Filters):** First-class semantic filters rather than literal keyword blocks. Excluding "run clubs", "rooftop parties", or "passive spectator events" also strips out a "5k social jog", "skyline sunset mixer", or "sit-down comedy showcase".',
					'**4. Latent & Experiential Preferences (The "Why"):** A Markdown table (`Preference Dimension | Confidence | Origin | Supporting Evidence & Quotes`) capturing cross-cutting mechanics like participatory doing over watching, small groups of 6 to 15 people, shared physical tasks, and DIY or offbeat character.',
					'**5. Positive Interests & Anchors:** Activity domains and concrete local venues the user already likes (such as East Bay Depot for Creative Reuse, The Crucible, or It\'s Your Move Games), used to craft high-precision `Exploitation` queries.',
					'**6. Uncertain Hypotheses & Untried Candidates:** Split into `Planned / Upcoming` events needing a post-event follow-up and a `Candidates Not Yet Tried` strong-fit backlog of recurring local series to test in future stacks.',
					'**7. Event & Feedback History:** Ground-truth log split into semantic buckets: `Attended & Enjoyed`, `Planned / Added to Calendar`, `Positive Interest`, `Logistical Pause / Not Right Now`, `Attended Previously (Mixed / Goal Mismatch)`, and `Rejected (Aesthetic / Fit Mismatch)`.'
				],
				code: {
					filename: 'preferences.md (evolved profile after 2 feedback rounds)',
					language: 'markdown',
					snippet: `## 1. Current Reframed Goal
> You want hands-on, indoor maker workshops and craft/artisan studios in Oakland/East Bay
> (sewing, ceramics, printmaking, woodwork, DIY repair) where you learn tactile skills
> alongside a small group of local makers, with tabletop games as a secondary social anchor.

## 2. Defaults & Hard Constraints
- **Default Location:** Oakland, CA (and nearby East Bay: Berkeley, Emeryville, Alameda)
- **Primary Goal:** Meet people / genuine social connection
- **Demographic Filter:** Adult-oriented (exclude kid/family holiday events)

## 3. Hard Exclusions (Semantic Category Filters)
- **Run clubs** / fitness social runs _(Explicit)_
- **Rooftop parties** / generic skyline or cocktail socials _(Explicit)_
- **Purely passive spectator events** (shows, concerts, tours where you don't talk) _(Strong dislike)_
- **Contrived group activities** (e.g., citywide bicycle scavenger hunt) _(Inferred from Round 1)_

## 4. Latent & Experiential Preferences (The "Why")
| Preference Dimension | Confidence | Origin | Supporting Evidence & Quotes |
|---|---|---|---|
| **Participatory (doing > watching)** | Strong (High) | Explicit + Attended | Liked *Free Oakland Up* and *The Crucible*; positive on *Beginner Sewing*. |
| **Small group (6-15 people)** | Strong (High) | Explicit + Inferred | Intimate studio sizes where talking to neighbors is natural. |
| **Shared task** | Strong (High) | Explicit + Inferred | Working on a physical object or game removes social friction. |
| **Outdoor Stewardship** | Nuanced (Hold) | Feedback Round 2 | "Not super into outdoor stewardship this week... keep for future." |

## 5. Positive Interests & Anchors
- **Social practice / creative reuse** (*Free Oakland Up*, *East Bay Depot for Creative Reuse*)
- **Maker spaces & workshops** (Woodworking, textiles/sewing, ceramics, printmaking, fixit clinics)
- **Tabletop & board game drop-ins** (*It's Your Move Games & Hobbies, Temescal*)

## 7. Event & Feedback History
- **Attended & Enjoyed:** *Free Oakland Up* ("neat"), *The Crucible Industrial Artisan Fair* ("cool")
- **Logistical Pause (Valid Later):** *Outdoor Stewardship* (passed for Oct 31 window only)
- **Attended Previously (Goal Mismatch):** *HellaFunny comedy* ("fun but not social; I don't talk to people")
- **Rejected (Do Not Repeat):** Round 1 passive concerts, tours, and bike scavenger hunt`
				}
			},
			{
				id: 'card-stack-ux',
				heading: '2. Why a Card Stack Instead of a Chatbot',
				summary:
					'Event triage is an action task. We moved from a CLI chat agent to a Risograph-styled single-card stack across three closed-loop workspaces.',
				paragraphs: [
					'We originally built Event Buddy as a conversational terminal CLI (`uv run buddy` in `mvp/cli.py` and `mvp/agent.py`) where a Gemini agent called `search_local_events` and `update_preferences` against a local `preferences.md` file. The conversational loop proved the thesis, and early user testing exposed two UX flaws.',
					'First, triaging events is an action-oriented decision task, not an open-ended chat. Typing "I like #2 and #5, skip #1 because I\'m busy Friday, and #3 sounds too corporate" into a chat input is tedious on desktop and painful on mobile. Second, dumping a grid of eight long event write-ups on screen at once causes cognitive overload. Users skim titles and miss the experiential details in "Why it fits you" and "Caveats".',
					'We designed the web app around a tactile Risograph and indie zine aesthetic (`#FAF5E8` cream paper, `#FFFDF7` ivory cards, `#1E242B` ink borders with hard offset shadows) that feels like flipping through hand-picked neighborhood flyers. The app runs as a closed loop across three workspaces:'
				],
				bullets: [
					'**1. My Taste (`/preferences`, `PreferencesStudio.svelte`):** New users (`needs_onboarding = true`) get a 3-question starter popup covering location/radius, favorite activities/vibes, and exclusions. Submitting it calls the Taste Profile Coach, which writes a complete 7-section `preferences.md`, auto-titles the profile, and shows a diff summary box. The coach follows a strict 1-question budget on Turn 1 and stops asking unprompted questions on Turn 2+ so users are never trapped in an interview.',
					'**2. Find Stuff (`/discover`, `DiscoverBoard.svelte`):** Shows the active profile pill and 1-sentence goal banner, accepts natural-language or voice-dictated prompts plus quick window chips (`This Weekend`, `Tonight`, `This Week`, `Surprise Me`), and streams a 4-stage SSE progress tracker (`Planning your search` -> `Searching for events` -> `Checking events` -> `Building your event stack`). Results are dealt one card at a time (`Option 1 of N`) with four semantic reaction buttons (`I\'m Going!`, `Save for Later`, `Bad Timing`, `Not for Me`) and an optional voice or text "Why?" note.',
					'**3. My Plans (`/schedule`, `ScheduleView.svelte`):** Closes the real-world loop across three tabs: `Going Next` (chronological schedule with 1-click Google Calendar export links), `Saved for Later` (backlog of events and recurring series), and `How Did It Go?` (post-event check-ins once `is_past_due` is true, recording `Attended & Enjoyed`, `Attended (Mixed / Not Social Enough)`, or `Didn\'t End Up Going` back into Sections 4 and 7 with highest weight).'
				],
				code: {
					filename: 'closed-loop-workflow.txt',
					language: 'text',
					snippet: `1. MY TASTE (/preferences)
   3-step starter -> Taste Profile Coach (1-question budget) -> preferences.md
   (Entity grounding looks up named local venues via Google Search + URL Context)
                 |
                 v
2. FIND STUFF (/discover)
   Prompt or date chip -> Plan -> Parallel Grounded Search -> Verify -> Card Stack (5-8)
   Per-card reaction: [I'm Going!] [Save for Later] [Bad Timing] [Not for Me] + "Why?" note
   End-of-stack Wrap-Up Card: "Update Profile Only" or "Update Profile & Deal Fresh Stack"
                 |
                 v
3. MY PLANS (/schedule)
   Going Next (1-click GCal) / Saved for Later / How Did It Go?
   Verified attendance outcomes feed back into Sections 4 & 7 with highest weight`
				},
				deepDive: {
					title: 'Deep Dive: Anatomy of a single event card in the stack',
					paragraphs: [
						'Every card in `DiscoverBoard.svelte` renders six structured elements so the user can judge the social and logistical fit in a few seconds:',
						'At the bottom of the stack, the final card is a Wrap-Up Summary showing all batch reactions and an overall steering note input. Clicking "Update Profile & Deal Fresh Stack" folds the batch evidence into `preferences.md`, shows the bulleted diff of what changed, and immediately launches a fresh search round using the updated goal, exclusions, and `already_seen` list.'
					],
					bullets: [
						'**Event Visual Banner (`EventVisual.svelte`):** The scraped venue flyer or OpenGraph image (or a Risograph illustration fallback) paired with a bucket badge (`Core Match`, `Adjacent Pick`, or `Wildcard Pick`).',
						'**Direct Hyperlinked Title:** Opens the canonical venue or event listing (`source_url`) in a new tab.',
						'**Logistics Strip:** Day and date label (`Saturday, Nov 7, 2026` or `Recurring Weekly`), start/end time, venue and neighborhood, and exact price (`Free`, `$20`, `Sliding scale $10-$25`).',
						'**What Happens (`description`):** Concrete, non-promotional copy (zero marketing buzzwords and zero em-dashes) explaining what you physically do and how conversation happens.',
						'**Why It Fits You (`why_it_fits`):** A 1 to 2 sentence tie-back to specific dimensions and anchors in the user\'s `preferences.md`.',
						'**Caveats & Verification (`caveats`):** Honest social or logistical friction, such as arriving 15 minutes early for a popular drop-in workbench or confirming a studio materials fee.'
					]
				}
			},
			{
				id: 'discovery-buckets',
				heading: '3. The 60 / 30 / 10 Discovery Split',
				summary:
					'Every stack is partitioned into Exploitation, Adjacent, and Wildcard so pure filter bubbles and random noise both get rejected.',
				paragraphs: [
					'I wanted the agent to avoid two opposite failure modes: pure exploitation creates a repetitive filter bubble where a user only sees pottery classes at the same studio every week, while pure random exploration feels broken and ignores their taste. Every `SearchPlanSchema` and `StructuredDiscoveryOutput` stack is partitioned across three discovery buckets:'
				],
				bullets: [
					'**60-70% Exploitation (`Core Match`):** High-confidence queries targeting explicit positive interests and known anchor venues from Section 5 of `preferences.md` (such as specific Oakland ceramics studios, creative reuse centers, and board game cafes).',
					'**20-30% Adjacent Exploration (`Adjacent Pick`):** Neighboring experiential domains that share the same social and physical mechanics from Section 4, even if the user has never named that medium. Someone who likes beginner sewing and tabletop games because they enjoy small groups of 6 to 15 people doing a shared tactile task gets a community linocut printmaking drop-in, a bookbinding night, or a neighborhood Fixit Clinic.',
					'**10% Plausible Wildcard (`Wildcard Pick`):** A serendipitous lateral leap outside the user\'s routine that still obeys every Hard Exclusion in Section 3 and carries a defensible hypothesis in `why_it_fits` (like an amateur astronomy lecture and telescope viewing or a community zine swap).'
				]
			},
			{
				id: 'four-workflows',
				heading: '4. Four Specialized Agent Workflows',
				summary:
					'Split interviewing, live search, profile editing, and classic chat into four Gemini workflows instead of one overloaded prompt.',
				paragraphs: [
					'Rather than forcing one monolithic prompt to handle interviewing, live web search, JSON card extraction, and profile editing all at once, we split the backend intelligence into four specialized workflows running on `gemini-3.8-flash` via the `google-genai` SDK:'
				],
				bullets: [
					'**A. Structured Discovery Pipeline (`execute_discovery_pipeline` on `POST /api/discovery/search/stream`):** Runs Stage 1 JSON query planning, Stage 2 parallel `GoogleSearch` workers, Stage 3 `StructuredDiscoveryOutput` card curation, and Stage 4 SSE delivery.',
					'**B. Taste Profile Onboarding Coach (`run_preferences_onboarding_turn` on `POST /api/profile/documents/{id}/chat`):** Strictly forbidden from recommending weekend event schedules. Its sole job is maintaining `preferences.md` via `OnboardingTurnSchema` (`reply`, `should_update_document`, `updated_markdown`, `change_summary`, `reframed_goal`, `updated_title`). It enables `google_search` and `url_context` only for entity lookup: if a user says "I loved going to Free Oakland Up and The Crucible", the coach looks up those local organizations on the web and populates Section 4 and Section 5 without asking "What is Free Oakland Up?".',
					'**C. Feedback & Outcome Synthesizer (`synthesize_feedback_into_preferences`):** Triggered by `/api/discovery/batches/{id}/apply-feedback/stream` and `/api/events/{id}/outcome`. Takes structured reaction reports and folds them into all seven sections (`PreferenceUpdateOutput`), streaming a human-readable `change_summary` diff back to the UI.',
					'**D. Autonomous Multi-Turn Tool-Calling Agent (`EventBuddyAgent` in `mvp/agent.py` and `UserScopedAgentRunner` in `api/app/services_agent.py`):** Powers the terminal CLI (`uv run buddy`) and Classic Chat (`/chat`) using a ReAct loop (up to 6 tool iterations per turn) with native function declarations (`search_local_events`, `update_preferences`, `read_preferences`) plus automatic `<current_preferences_md>` injection on every turn so manual user edits take effect immediately.'
				],
				code: {
					filename: 'discovery-pipeline-stages.txt',
					language: 'text',
					snippet: `Stage 0  already_seen dedupe (UserEvent saved + CandidateEvent rejected + Section 7)
Stage 1  Search planner -> SearchPlanSchema JSON
         (exploitation / adjacent / wildcard queries + concrete date_window)
Stage 2  Live Google Search grounding + vertexaisearch redirect resolution
Stage 3  StructuredDiscoveryOutput JSON (5-8 verified CandidateEvent rows)
         Anti-hallucination: source_url must exist in resolved grounding chunks
Stage 4  SSE cards_ready immediately, then async multi-tier flyer hydration`
				}
			},
			{
				id: 'discovery-pipeline-detail',
				heading: '5. Inside the Structured Discovery Pipeline',
				summary:
					'Plan queries from preferences.md, ground them with live Google Search, extract citation-backed cards, and hydrate flyers asynchronously over SSE.',
				paragraphs: [
					'When a user clicks Find Events on `/discover`, the backend runs `execute_discovery_pipeline` (`api/app/services_discovery.py` and `mvp/search.py`), parameterized by a `DiscoveryConfig` Pydantic model so production and offline evaluation call the exact same code path. Before Stage 1 even runs, the pipeline builds an `already_seen` deduplication list by combining saved `UserEvent` titles, rejected `CandidateEvent` rows (`reaction_status == "not_interested"`), and Section 7 of `preferences.md` so the agent never deals the same event twice.',
					'Stage 1 (`build_plan_prompt` -> `SearchPlanSchema`) reads `preferences.md`, `already_seen`, the user prompt, and the current local date. It resolves relative windows like "this weekend" or "tonight" into concrete calendar dates (`date_window`), writes a 1-sentence `reframed_goal` for this search, and generates targeted Google queries split across `exploitation_queries`, `adjacent_queries`, and `wildcard_queries`.',
					'Stage 2 (`execute_event_search`) executes live Gemini Grounding with Google Search (`types.Tool(google_search=types.GoogleSearch())`, plus optional `UrlContext` in 2-pass deep mode). It prioritizes independent venue calendars, maker spaces, creative reuse depots, community colleges, and local aggregators over generic ticket directories, then extracts `grounding_chunks` and resolves `https://vertexaisearch.cloud.google.com/grounding-api-redirect/...` URLs into canonical venue URLs (`GroundingSource.resolved_uri`) via parallel `httpx` workers.',
					'Stage 3 (`build_structure_prompt` -> `StructuredDiscoveryOutput`) curates 5 to 8 verified cards under strict rules: every `source_url` must come from the resolved grounding chunks, the venue must physically sit inside the target location and `date_window` (or be marked `is_recurring = true`), any candidate violating Section 3 Hard Exclusions or prompt constraints (budget, indoor, sober, daytime) is stripped, and intra-batch diversity enforces variety across venues and activity subtypes. The moment Stage 3 finishes, Stage 4 emits `event: cards_ready` over SSE and spawns background workers (`fetch_event_image_url`) to stream `event: card_image` updates as each flyer resolves.'
				],
				deepDive: {
					title: 'Deep Dive: How feedback reports and multi-strategy flyer scraping work',
					paragraphs: [
						'When a user finishes rating a stack, `synthesize_feedback_into_preferences` receives a structured report that separates strong positives from logistical pauses. That separation is why Section 7 works: passing on a Saturday morning habitat restoration because of rain never penalizes outdoor stewardship for future weeks.',
						'Similarly, scraping event flyers in Stage 4 required a 4-tier fallback chain in `fetch_event_image_url`: standard Chrome headers first, then a retry with `WhatsApp/2.23.20.0` link-preview bot headers for sites like Resident Advisor that return Cloudflare `403` to browsers, then a 1-hop outbound link extractor for plain-text aggregator tables like `19hz.info` using a title match, and finally a Microlink API fallback.'
					],
					code: {
						filename: 'feedback-report.txt',
						language: 'text',
						snippet: `Discovery Batch Query: What should I do this weekend? (Oakland, CA | Fri Nov 6 - Sun Nov 8, 2026)
Overall User Batch Note: Looking for more indoor tactile crafts and fewer outdoor walks.
- [GOING (Added to Schedule - Strong Positive)] Sunday Chess Drop-In (It's Your Move Games) | "Easy way to play casual games and chat"
- [INTERESTED (Saved to Backlog - Positive)] Beginner Linocut Printmaking (Kala Art Institute)
- [BAD TIMING / HOLD (Do NOT penalize activity type)] Sausal Creek Habitat Restoration | "Raining this Saturday, keep for spring"
- [NOT FOR ME (Rejected - Aesthetic / Social Mismatch)] Downtown First Friday Street Fest | "Too crowded and loud to actually meet anyone"`
					}
				}
			},
			{
				id: 'tech-stack',
				heading: '6. Technical Stack & Resilient SSE Streaming',
				summary:
					'SvelteKit 2 / Svelte 5 Runes SPA, FastAPI + SQLAlchemy on SQLite/Neon Postgres, _InflightStreamHub SSE coalescing, and single-container Cloud Run deploys.',
				paragraphs: [
					'The frontend (`web/`) is built with SvelteKit 2 and Svelte 5 Runes (`$state`, `$derived`, `$effect`), compiled via `@sveltejs/adapter-static` into a static SPA served directly by FastAPI in production. Native browser `SpeechRecognition` / `webkitSpeechRecognition` provides zero-latency voice dictation across search bars, card reaction notes, and onboarding chat.',
					'The backend (`api/` and `mvp/`) runs on Python 3.12, FastAPI, SQLAlchemy 2, and Alembic, using SQLite in `WAL` mode (`event_buddy.db`) for zero-config local development and Neon Serverless PostgreSQL in production (`users`, `preference_documents`, `discovery_batches`, `candidate_events`, `user_events`, `chat_sessions`). Auth uses Argon2id password hashing, SHA-256 `HttpOnly` session cookies, 6-digit Resend email verification codes, and per-user daily search guardrails.',
					'One piece of plumbing mattered a lot on mobile: `_InflightStreamHub` in `api/app/routers/discovery.py`. If a user refreshes their browser tab or their phone connection blips mid-search, `_InflightStreamHub` coalesces the reconnected SSE request onto the already-running background search thread and replays all emitted status, plan, and card events from memory so the search is never lost or double-billed.',
					'A single multi-stage `Dockerfile` (Node 22 Alpine frontend build -> Python 3.12 Slim + `uv` backend) powers three Google Cloud Run workloads: the `event-buddy` web service, the `event-buddy-migrate` Alembic job, and the `event-buddy-eval` benchmark job. Deployments run `./scripts/check-active-users.sh` before traffic cutover so an active user\'s SSE stream is never severed.'
				],
				code: {
					filename: 'system-architecture.txt',
					language: 'text',
					snippet: `SvelteKit 2 / Svelte 5 SPA (web/src/)  --REST + SSE-->  FastAPI Backend (api/app/)
  /discover, /preferences, /schedule, /chat               _InflightStreamHub SSE coalescing
  Web Speech API dictation + progressive cards            Argon2id + SHA-256 HttpOnly cookies
                                                                  |
                                        +-------------------------+-------------------------+
                                        v                                                   v
                        Core Agent & Search (mvp/)                          SQLAlchemy 2 (SQLite WAL / Neon PG)
                        services_discovery.py + mvp/search.py               users, preference_documents,
                        Gemini 3.8 Flash (GoogleSearch + UrlContext)        discovery_batches, candidate_events,
                        Parallel workers + 4-tier flyer scraper             user_events, chat_sessions`
				}
			},
			{
				id: 'why-hard-to-optimize',
				heading: '7. Why This System Was Uniquely Hard to Optimize',
				summary:
					'You cannot cache live local events across users, skip grounding, or broaden queries without destroying the hyper-local product.',
				paragraphs: [
					'Understanding what Go Do Stuff does makes it obvious why standard "make your LLM faster and cheaper" advice would have broken the product. First, you cannot cache live local events across users: every search depends on a user\'s specific 7-section `preferences.md` (their neighborhood, semantic exclusions, studio anchors, and the exact events they already rejected in Section 7) plus relative time windows like "tonight" or "this Saturday afternoon".',
					'Second, you cannot skip live web search grounding. An ungrounded model will happily hallucinate plausible pottery classes at real Oakland studios on dates that do not exist, or link to dead homepages. Every recommended card has to be backed by a live Google Search grounding chunk with a verified date, time, price, and resolved canonical URL.',
					'Third, broadening queries saves money right away while destroying the hyper-local magic. When we tried collapsing 8 to 10 specific queries into 4 broad `OR` queries, cost dropped 58% and latency dropped 32%, and the stack lost `11-1` in blind side-by-side judging because broad queries missed Section 5 neighborhood studio anchors and surfaced generic city-wide listings.',
					'How we built an automated 4-layer evaluation harness (`buddy-eval`) and re-architected the pipeline into a 1-worker-per-query parallel map-reduce system is covered in full in the companion write-up: [Optimizing the Go Do Stuff Agent](/posts/go-do-stuff-agent-optimization/).'
				]
			}
		],
		team: {
			human: 'Matt Toronto',
			aiCollaborator: 'Gemini 4 Argon',
			harness: 'Cursor'
		}
	},
	{
		slug: 'go-do-stuff-agent-optimization',
		title: 'Optimizing the Go Do Stuff Agent: 53% Faster, 20% Cheaper, Same Quality',
		date: '2026-11-10',
		readingTime: '16 min read',
		summary:
			'How we built buddy-eval, ran 34 experiments across four waves, and shipped a parallel per-query map-reduce pipeline that cut median search latency from 96.2s to 44.6s while tying baseline quality 15-15 in blind A/B.',
		liveUrl: 'https://go-do-stuff.com',
		liveLabel: 'go-do-stuff.com',
		tags: ['Agents', 'Eval', 'Latency', 'Gemini', 'Cloud Run'],
		overview: {
			label: 'TL;DR',
			bullets: [
				'**Problem:** Discovery stacks took 90-120+ seconds and cost about $0.18-$0.22 each at paid grounding rates. Fatal for cold Reddit traffic and a $5/mo membership.',
				'**Method:** Refactor into `execute_discovery_pipeline(... DiscoveryConfig)`, build a 4-layer eval harness (`buddy-eval`), then run 34 tracked experiments including zero-cost Stage 3 snapshot replay.',
				'**Result:** Shipped `parallel-per-query-lean-6q-fastext`. Median latency 96.2s -> 44.6s (-53.7%), cost $0.214 -> $0.172 (-20%), blind A/B exact 15-15 tie vs baseline on 30 stratified cases.',
				'**Rule we kept:** Prefer 20-40% gross margin with word-of-mouth-worthy stacks over an 80% software margin with mediocre recommendations.'
			]
		},
		sections: [
			{
				paragraphs: [
					'This is the engineering follow-up to [Go Do Stuff: A Living Taste Profile and Live-Search Event Agent](/posts/go-do-stuff-agent/). That post covers the product thesis and the 7-section `preferences.md` model. This post covers how we built an evaluation harness (`buddy-eval`), ran 34 experiments across four waves, and re-architected the search pipeline to cut median latency by 53.7% and marginal cost by 19.6% while tying baseline quality `15-15` in blind pairwise A/B testing.',
					'I wanted to move beyond biased friends-and-family testing by running geo-targeted Reddit ads in Oakland and East Bay subreddits (`r/oakland`, `r/berkeley` at ~$10/day for $100 to $200 of cold-traffic R&D) and supporting a flat $5 to $6/month membership. I rejected pay-per-search credit systems because credits create "slot-machine anxiety" whenever a user gets a stack they do not love.',
					'Before sending paid cold traffic into the app, two numbers forced an audit. First, clicking Scout for Events took 90 to 120+ seconds, which is fatal for a cold visitor staring at a spinner. Second, unit economics were tight because of how Google bills Gemini Grounding with Google Search: while `gemini-3.8-flash` LLM tokens (`$0.75/1M` input, `$3.75/1M` output and thinking) only cost `$0.02-$0.04` per stack, Google Search Grounding bills per individual web search query executed by the model (`$14.00 per 1,000 queries`, or `$0.014` per query after the 5,000 queries/month free tier). Our pipeline averaged `10.2` executed web queries locally (`11.9` on our 30-case benchmark), costing `$0.18-$0.21` per stack. On a `$5.00/mo` plan (`$4.55` net after Stripe\'s `2.9% + $0.30`), 5 to 10 stacks/month (`$0.90-$1.80`) works, unless an experiment accidentally balloons web queries to 17 or 18 per stack (`$0.30-$0.34`) and wipes out the margin.',
					'I set one non-negotiable rule before we changed a line of code: I would rather accept a 20 to 40% gross margin with diverse, word-of-mouth-worthy 7 to 8 card stacks than chase an 80% software margin with repetitive, generic recommendations. We needed a real yardstick first.'
				]
			},
			{
				id: 'baseline-audit',
				heading: '1. Baseline Audit: Where the 97 Seconds & $0.21 Went',
				summary:
					'The original sequential pipeline spent most of its time in one monolithic grounded search that wrote a long Markdown essay, then rewrote the same events into JSON.',
				paragraphs: [
					'Before touching prompts or parameters, we inspected `discovery_batches.telemetry_json` from our first six real discovery batches in SQLite and traced the code path end to end. The original four-stage pipeline was an "untyped prose relay" taking 95 to 135 seconds of wall time:'
				],
				code: {
					filename: 'original-pipeline.txt',
					language: 'text',
					snippet: `[Stage 1: Search Planner] (7.0-7.6s)
  Reads preferences.md + prompt -> SearchPlanSchema JSON (8-10 narrow queries)
          |
          v
[Stage 2: Monolithic Grounded Search + Essay Generation] (66.7-68.6s mean, up to 115s)
  All 8-10 queries stuffed into ONE generate_content() call
  Enabled BOTH GoogleSearch() AND UrlContext() in a try/except fallback
  Model runs serial multi-hop search turns -> writes 1,500-2,500 word Markdown essay
          |
          v
[Stage 2b: Eager Redirect Resolution] (3.1-8.0s)
  Resolves ALL 30-40 vertexaisearch redirect URLs via httpx (follow_redirects=True),
  opening TLS handshakes to 35+ external venue sites (even the ~30 URLs Stage 3 drops)
          |
          v
[Stage 3: Full Re-Read & JSON Re-Generation] (20.4-22.3s)
  Re-reads preferences.md + 12k-char essay + 35 URLs
  Spends 3,500-11,000 uncapped thinking tokens reconciling prose claims vs URLs
          |
          v
[Stage 4: Synchronous OpenGraph Image Scraping] (5.0-10.0s blocking SSE)
  Scrapes HTML of all 5-8 venue sites BEFORE emitting the SSE complete event`
				},
				bullets: [
					'**1. Accidental tool combo + silent retry risk (`google_search` + `url_context`):** Stage 2 passed both `GoogleSearch()` and `UrlContext()` inside a `try / except` that retried with `GoogleSearch()` alone on failure. Telemetry showed `deep_read_urls = 0` across all six batches.',
					'**2. Serial multi-hop search inside one monolithic call:** Passing 8 to 10 ultra-specific queries into a single `generate_content` call meant Gemini reasoned, searched a few queries, read snippets, reasoned again, and ran follow-up searches (`11.9` executed queries on average) before writing a single token of output.',
					'**3. Double LLM generation ("The Untyped Prose Relay"):** Stage 2 wrote a 1,500 to 2,500 word Markdown essay (8,500 to 15,300 characters), and Stage 3 read that entire essay plus `preferences.md` again to rewrite the exact same events into `StructuredDiscoveryOutput` JSON, paying output and thinking latency twice.',
					'**4. Full-chain redirect resolution (`follow_redirects=True`):** Our resolver called `httpx.Client(follow_redirects=True).head(uri)` with a `GET` fallback and `4.0s` timeout per URL, and deduplicated after network calls, waiting on slow third-party venue servers instead of just reading Google\'s edge `302 Location` header.',
					'**5. Blocking image scraping + uncapped reasoning budgets:** `fetch_event_images_parallel` blocked the SSE `complete` event for 5 to 10 seconds at the end, and neither Stage 1 nor Stage 3 set an explicit `thinking_budget`.'
				]
			},
			{
				id: 'pure-function-refactor',
				heading: '2. One Pure Function Shared by Production and Eval',
				summary:
					'DiscoveryConfig parameterized every experimental knob so buddy-eval and FastAPI called the exact same pipeline with stage-level telemetry.',
				paragraphs: [
					'A strict design requirement before writing any eval script was zero duplicated business logic. We did not want an evaluation script that re-implemented a test version of the prompts while the FastAPI app drifted separately. We refactored the production pipeline into a pure, database-independent function (`execute_discovery_pipeline`) parameterized by a single Pydantic model (`DiscoveryConfig`) that both FastAPI (`run_structured_discovery`) and `buddy-eval` call directly.',
					'Initially, our telemetry only tracked total tokens and Stage 2 elapsed seconds, making it impossible to tell if a Stage 2 tweak quietly hurt Stage 3. We expanded `SearchDiagnostics` to capture per-stage wall-clock seconds (`plan_seconds`, `search_seconds`, `redirect_seconds`, `extract_seconds`, `image_seconds`), per-stage `input_tokens`, `output_tokens`, and `thinking_tokens` (with `stage_token_telemetry_complete: bool` so Stage 3 snapshot replays can replace extraction token counts cleanly without double-counting), exact `executed_web_queries` from `candidate.grounding_metadata.web_search_queries`, and a 16-character SHA-256 `config_fingerprint` computed over canonical sorted JSON.'
				],
				code: {
					filename: 'DiscoveryConfig (mvp/search.py)',
					language: 'python',
					snippet: `class DiscoveryConfig(BaseModel):
    # 1. Model & Provider Mode
    model_name: str = "gemini-3.8-flash"
    provider_mode: str = "gemini"

    # 2. Stage 1: Query Generation (Planner) Knobs
    exploitation_query_range: tuple[int, int] = (3, 3)
    adjacent_query_range: tuple[int, int] = (2, 2)
    wildcard_query_range: tuple[int, int] = (1, 1)
    query_granularity_style: str = "hybrid"  # "specific" | "multi_yield_clusters" | "hybrid"
    plan_thinking_budget: int | None = 512

    # 3. Stage 2: Grounded Search & Synthesis Knobs
    enable_url_context_on_pass1: bool = False
    search_execution_mode: str = "parallel_per_query"  # "single_call" | "parallel_buckets" | "parallel_per_query"
    per_query_candidate_limit: int = 4
    single_search_per_worker: bool = True
    compact_worker_profile_digest: bool = True
    drop_ungrounded_worker_outputs: bool = True
    attach_per_query_sources_inline: bool = True
    single_hop_redirects: bool = True

    # 4. Stage 3 & 4: Selection Criteria, Extraction & Image Knobs
    target_card_range: tuple[int, int] = (5, 8)
    extract_thinking_budget: int | None = 512
    fetch_images: bool = True

    # 5. Marginal Cost Constants
    cost_per_web_query_usd: float = 0.014  # $14 / 1,000 grounded web queries
    cost_per_1m_input_tokens_usd: float = 0.75
    cost_per_1m_output_tokens_usd: float = 3.75`
				}
			},
			{
				id: 'buddy-eval',
				heading: '3. buddy-eval: Dataset, 4-Layer Rubric, Replay, & Cloud Ledger',
				summary:
					'A 100-case persona x prompt dataset with Latin-square sampling, four grading layers, zero-cost Stage 3 replay, GCS artifacts, and a 6-tab Google Sheets ledger.',
				paragraphs: [
					'Because live local events change every day, grading a live-search agent is much harder than grading static Q&A. We built `uv run buddy-eval` around a 100-case canonical dataset: 10 realistic 7-section `preferences.md` personas (1. Oakland maker/games, 2. SF intellectual salons, 3. Brooklyn offbeat arts, 4. Chicago culinary craft, 5. Portland stewardship/outdoors, 6. Austin sober weeknights, 7. Seattle cozy rainy weekend, 8. Minneapolis community maker, 9. Boulder smaller-market stress test, and 10. Denver cold-start sparse profile 30 seconds after onboarding) crossed with 10 relative-time prompt archetypes (`weekend`, `tonight`, `weeknight`, `budget under $20`, `solo Saturday`, `hands-on`, `surprise`, `indoor cozy`, `daytime done by 5pm`, and `deeper cut neighborhood spaces`) resolved dynamically against the runtime date.',
					'We structured execution into three tiers: a 2-case Dry Run (`--tier smoke --limit 2`, ~1 min, ~$0.30) to catch broken schemas, a 12-case Smoke Suite (`--tier smoke`, ~4 min, ~$2.00) spanning all 10 cities, and a 30-case Stratified Benchmark (`--tier full --limit 30 --seed 42`) using a deterministic seeded Latin-square sampler (`dataset_loader.py`) that guarantees every contender runs on the exact same 30 `(persona, prompt)` pairs with 3 prompts per city and 3 instances of each prompt archetype at 30% of the 100-case cost.',
					'Every case is graded across four layers:'
				],
				bullets: [
					'**Layer 1: Hard Deterministic Checks (`evals/metrics_deterministic.py`):** 100% code-verified checks for `citation_integrity_rate` (every `source_url` exists in `diagnostics.sources`), `deep_link_rate` (specific path/query vs bare domain), `temporal_valid_rate`, `in_target_card_range` (`5-8` cards), `field_completeness_rate`, `no_em_dash_rate`, `zero_repeat_rate` against Section 7, and `bucket_coverage_score` (`1.0` when all 3 discovery buckets are present).',
					'**Layer 2: Decomposed Structured LLM Judge (`evals/judge.py`):** Calls `gemini-3.8-flash` (`temperature=0.1`, `thinking_budget=512`, `BatchJudgeEvaluation` schema) to grade each card on `violates_hard_exclusion` (`exclusion_pass_rate`), `experiential_mechanics_fit` (`1-5`), `local_specificity_score` (`1-5`), `description_clarity_score` (`1-5`), and a 2 to 3 word `activity_archetype` (like `"wheel pottery"` or `"linocut printing"`) so `unique_archetype_ratio` catches 3 pottery classes mathematically. Combines these with `intra_batch_diversity_score` and `exploration_leap_quality` into a `0-100` weighted `composite_quality_score` (`25` exclusion + `25` fit + `20` diversity + `15` specificity + `15` exploration/overall).',
					'**Layer 3: Position-Debiased Blind Pairwise A/B (`buddy-eval compare <run_a> <run_b>`):** Deterministically hashes `case_id` (`int(md5(case_id), 16) % 2 == 1`) to swap `STACK_1` and `STACK_2` 50/50 across the dataset, eliminating first-position bias, and picks a winner on overall stack, fit, diversity, and specificity.',
					'**Layer 4: Zero-Search-Cost Stage 3 Snapshot Replay (`buddy-eval replay --from-run <tag>`):** Re-runs only Stage 3 extraction and Layer 1/2 judging against saved `diagnostics.raw_synthesis` and `diagnostics.sources` in ~30 seconds for `$0.00` in Google Search fees, isolating Stage 3 prompt and thinking-budget changes with zero live-web variance.'
				],
				deepDive: {
					title: 'Deep Dive: Cloud MLOps ledger (GCS + 6-tab Google Sheet + Cloud Run Jobs)',
					paragraphs: [
						'Running dozens of experiments locally created artifact sprawl, and a single flat CSV in Cloud Storage would hit race conditions when running parallel benchmark jobs. We built a 3-part cloud persistence stack:',
						'Before launching any cloud run, `uv run buddy-eval estimate-cost` prints expected executed queries, search grounding USD, token USD, judge USD, and wall-clock minutes. Then `./scripts/run-eval-job.sh` triggers the `event-buddy-eval` Cloud Run Job (`2 vCPU`, `2Gi` RAM, `3600s` timeout), which writes straight to GCS and updates the Google Sheet live.'
					],
					bullets: [
						'**Immutable JSON Artifacts in GCS (`gs://<project>-evals/evals/`):** Stores full-fidelity `runs/<tag>.json` and `configs/<tag>.json`. Calling `load_run_artifact(tag)` auto-downloads from GCS on local cache miss so cloud runs can be inspected (`show`), replayed (`replay`), or compared (`compare`) from a laptop immediately.',
						'**Normalized 6-Tab Google Sheets Workbook (`evals/sheets_export.py`):** Every run upserts into six normalized tabs: `Run Summary` (1 row/run executive dashboard), `Presets` (deduplicated 1 row per unique 16-char `config_fingerprint` across all 38 config fields), `Runs`, `Cases`, `Events` (1 row per recommended card with judge scores), and `Queries` (every planned and executed search string). Running `uv run buddy-eval rebuild-sheet` deterministically reconstructs all 6 tabs from GCS JSONs.'
					]
				}
			},
			{
				id: 'wave-1-ceiling',
				heading: '4. Wave 1: Why Prompt Tuning Inside a Monolith Hit a Wall',
				summary:
					'Fewer broader queries cut cost 58% and latency 32%, then lost 11-1 in blind A/B. Naive 2-bucket parallelism barely moved wall clock and collapsed SF to 2 cards.',
				paragraphs: [
					'Over four days (Nov 5 to 8, 2026), we executed 34 tracked evaluation runs and replays across four waves. Wave 1 tested whether we could solve latency and cost purely through prompt tuning inside the original monolithic architecture.',
					'Our first hypothesis (`fast-multi-yield`) asked Stage 1 for 4 broad `OR`-cluster queries (`2 Exploitation, 1 Adjacent, 1 Wildcard`, such as `"Oakland Berkeley (ceramics OR printmaking OR sewing OR woodworking) workshop class November 2026"`), disabled `url_context` on Pass 1, and asked Stage 2 for compact notes. That immediately hit our first surprise: on the initial 2-case dry run (`dryrun-fast-multi-yield`), Stage 1 planned `4.0` queries, yet Gemini decomposed those `OR` clauses into `8.5` institution-specific follow-up searches inside its tool loop and took `83.1s` (slower than baseline\'s `75.0s` dry run). After we added `search_execution_instructions` explicitly forbidding Gemini from decomposing `OR` queries into follow-up searches (`dryrun-fast-multi-yield-v2`), executed queries dropped to `4.0`, cost dropped to `$0.091`, latency dropped to `70.1s`, and composite quality hit `99.0/100`.',
					'Then came the second surprise: 2-case dry runs are operational gates, not quality proof. When we ran the full 12-case smoke suite (`2026-11-06-fast-multi-yield-smoke` vs `2026-11-06-baseline-smoke`), latency fell 32% (`100.6s -> 68.5s`), executed web queries fell 66% (`9.8 -> 3.3`), marginal cost fell 58% (`$0.182 -> $0.077`), and composite quality scored a respectable `92.3` vs `96.4`. Yet in blind pairwise A/B judging, `fast-multi-yield` won 1 and lost 11 (`8%` win rate). Broad `OR` queries missed specific Section 5 studio anchors, surfaced generic city-wide listings, and dropped intra-batch diversity from `4.67` to `4.17`.',
					'Next we tried a 6-query hybrid plan (`hybrid-6q-quality`: 2 precise anchor Exploitation + 1 constraint Exploitation + 1 precise Adjacent + 1 broad `OR` Adjacent + 1 Wildcard) and paired it with 2-thread bucket parallelism (`parallel_bucket_execution=True`, running `Exploitation` in Thread 1 and `Adjacent + Wildcard` in Thread 2). Sequential `hybrid-6q-quality` recovered quality (`97.3/100`, `1-1` blind A/B split vs baseline at `$0.109`/stack), while staying slow at `99.5s`. Turning on 2-bucket parallelism (`dryrun-parallel-hybrid-6q-quality`) cut Stage 2 search by 17% (`62.2s -> 51.5s`), only for Stage 3 extraction to blow up from `28.1s` to `37.7s` (net wall-clock gain `<1%`, `99.5s -> 98.6s`) while collapsing the San Francisco case to just 2 cards.'
				],
				deepDive: {
					title: 'Deep Dive: Diagnosing the 2-card SF collapse with $0 Stage 3 replays',
					paragraphs: [
						'Was Stage 3 being too strict, or was Stage 2 producing broken output? We ran five zero-search-cost Stage 3 replays (`replay-parallel-control`, `replay-parallel-min5`, `replay-parallel-compact`, `replay-parallel-budget2048`, `replay-sequential-hybrid-budget2048`) against the saved search evidence.',
						'Even when instructed harder to return at least 5 cards (`replay-parallel-min5`), Stage 3 spent `79.1s` and `11,016` thinking tokens on San Francisco and still returned 2 cards. Inspecting `raw_synthesis` exposed the smoking gun: Thread 1 wrote a prose essay claiming 11 SF events while citing bare ungrounded domains (`https://roxie.com`, `https://citylights.com/events`) that did not exist in `grounding_chunks`, whereas Thread 2 ran 4 searches and wrote: "Based on the executed search queries... only two candidate events meet every concrete verification requirement." Concatenating two independent prose essays with one URL list at the bottom handed Stage 3 a self-contradictory document. And when we tried capping `extract_thinking_budget=2048` on noisy prose (`replay-sequential-hybrid-budget2048`), Stage 3 dropped from `28.1s` to `12.9s` while SF quality tanked to `88.7`.'
					]
				}
			},
			{
				id: 'wave-2-map-reduce',
				heading: '5. Wave 2: 1-Worker-Per-Query Parallel Map-Reduce (E1-E5)',
				summary:
					'Architecture beat parameter tuning. Fire one grounded worker per planned query, emit terse candidates with inline canonical sources, and resolve redirects in a single hop.',
				paragraphs: [
					'Stepping back on Day 2, we realized we were sweeping parameters inside an inefficient architecture. Why run one monolithic call (or two bucket threads where queries still queue serially) when Python can spawn one dedicated worker per planned query at `t=0`?',
					'We engineered five structural changes (`E1` through `E5`) in `mvp/search.py`:'
				],
				bullets: [
					'**E1 (`search_execution_mode = "parallel_per_query"`):** Flatten all `N` planned queries into `N` tasks and launch all `N` workers simultaneously via `ThreadPoolExecutor(max_workers=len(query_tasks))`. Zero queries ever wait behind another query.',
					'**E2 (Structured Per-Query Candidate Records + Inline Sources):** Forbid workers from writing global introductions or essays. Each worker outputs only 1 to 4 terse, pipe-delimited records (`[Event Name] | [Exact Day, Date & Time] | [Venue & Address] | [Price] | [Bucket]`). Any worker output with zero `grounding_chunks` is dropped (`drop_ungrounded_worker_outputs=True`), and each worker\'s resolved `Verified Canonical Sources for Query k:` are attached inline directly below its candidate block (`attach_per_query_sources_inline=True`).',
					'**E3 (`single_hop_redirects = True`):** Deduplicate `raw_sources` before making network requests, share one `httpx.Client(follow_redirects=False, timeout=2.5)`, send a single `HEAD` request to `vertexaisearch.cloud.google.com`, and read `resp.headers["location"]` directly without opening TLS handshakes to 35 external venue servers. Benchmark on 32 redirect URLs: `4.54s -> 0.61s` (`-86.7%` locally, `0.25s` on Cloud Run).',
					'**E4 (Progressive SSE `cards_ready`):** Emit the full stack of cards to the browser the instant Stage 3 completes (`0s` image wait on the critical path) while scraping flyers asynchronously.',
					'**E5 (`plan_thinking_budget = 512`):** Capping Stage 1 planner thinking tokens cut Stage 1 latency from `7.0s` to `4.3s` (`-38.6%`) with zero loss in query specificity.'
				],
				code: {
					filename: 'mvp/search.py (parallel per-query + single-hop redirect)',
					language: 'python',
					snippet: `def resolve_redirect_url(uri: str, timeout: float = 2.5, single_hop: bool = True) -> str:
    if "vertexaisearch.cloud.google.com/grounding-api-redirect" not in (uri or ""):
        return uri
    if single_hop:
        with httpx.Client(follow_redirects=False, timeout=timeout) as hop_client:
            resp = hop_client.head(uri)
            loc = resp.headers.get("location", "").strip()
            if loc.startswith("http"):
                return loc
    return uri

with ThreadPoolExecutor(max_workers=len(query_tasks)) as pool:
    worker_results = list(pool.map(_exec_single_query, query_tasks))

for item in worker_results:
    w_text = item["text"]
    if not w_text or w_text.upper() == "NONE":
        continue
    if cfg.drop_ungrounded_worker_outputs and not item["raw_chunks"]:
        continue
    src_lines = "\\n".join(f"- [{s.title}]({s.resolved_uri})" for s in item["worker_sources"])
    synthesis_parts.append(
        f"### Query {item['idx']} [{item['bucket']}]: {item['query']}\\n"
        f"{w_text}\\n\\n"
        f"Verified Canonical Sources for Query {item['idx']}:\\n{src_lines}"
    )`
				},
				deepDive: {
					title: 'Deep Dive: Two Wave 2 bugs ("Output Only NONE" bailouts & missing worker anchors)',
					paragraphs: [
						'Our first `PER_QUERY_GROUNDING_PROMPT_TEMPLATE` ended with: "If zero qualifying events are found for this query, output only `NONE`." In `2026-11-07-parallel-per-query-baseline-smoke`, NYC budget quality crashed to `64.7` because 6 out of 9 parallel workers saw a narrow 10-word query string, ran 1 literal search, and took the easy escape hatch by outputting `NONE`. Replacing that bailout with instructions to broaden slightly to local studio or collective calendars when an exact phrase returns zero hits jumped NYC quality from `64.7` to `98.3`.',
						'Second, Stage 2 originally only received `plan_data.reframed_goal` (1 sentence) rather than `preferences.md`. When a parallel worker landed on a local roundup calendar, it had no idea which venues were the user\'s Section 5 Positive Anchors or Section 6 Untried Hypotheses. Injecting profile context into each worker (`2026-11-07-parallel-per-query-baseline-v2-smoke`) pushed 12-case Smoke Composite Quality to `97.8/100` (`4.97/5.0` local specificity) and hit a `6W-6L (50%-50%)` blind A/B tie against baseline while cutting mean latency from `100.6s` to `61.7s` (`131.8s -> 71.6s` p90).'
					]
				}
			},
			{
				id: 'wave-3-cost-cards',
				heading: '6. Wave 3: Fixing the Cost Spike, Card-Count Dip, & Stage 3 Latency',
				summary:
					'Removed the 1-event-per-query-block ceiling, added single-search worker budgets and compact digests, and stripped duplicate URL footers so Stage 3 thinking could be capped at 512.',
				paragraphs: [
					'Comparing our two Wave 2 winners exposed a sharp unit-economics tradeoff: `parallel-per-query-baseline-v2-smoke` achieved `97.8` quality and `7.2` cards/stack, yet because its 8 parallel workers broadened narrow queries into 2 searches each, executed web queries jumped to `17.6` per stack (`$0.338`/stack), which was far too expensive for a `$5/mo` subscription. Meanwhile, `parallel-per-query-hybrid-6q-v3-smoke` was faster (`56.7s`) and cheaper (`12.4` queries), yet only averaged `5.58` cards per stack instead of `7-8`.',
					'We ran three surgical experiments (`C1`, `C2+C3`, and Stage 3 deduplication) to get `~$0.17` cost and `7+` cards/stack at the same time:'
				],
				bullets: [
					'**Experiment C1 (Removing the `1-Event-Per-Query-Block` Ceiling, `replay-hybrid-6q-v3-7to8cards`):** Our Stage 3 prompt had a diversity rule stating "Select at most 1 event per `### Query` block." With 6 queries, `6 x 1 = 6` mathematically capped the stack at 6 cards. Changing that rule to "Select at most 1 event per venue and at most 1 event per narrow activity subtype" (allowing 2 distinct events from a rich calendar roundup found by 1 query) in a `$0.00` Stage 3 replay jumped average cards from `5.58` to `7.17` and improved blind A/B vs baseline from `3W-9L` to `6W-6L (50%-50%)`.',
					'**Experiment C2 + C3 (`single_search_per_worker = True` + Compact Profile Digest, `parallel-per-query-lean-6q-smoke`):** We instructed each of the 6 parallel workers to run 1 Google search for its query (only running a 2nd if the 1st returned zero local hits) and extract up to `per_query_candidate_limit = 4` candidates, and added `extract_compact_profile_digest()` to pass only Sections 2, 3, 5, and 6 of `preferences.md` (saving ~400 input tokens per worker x 6 workers). A quick dry run (`dryrun-parallel-per-query-lean-6q`) tested `search_thinking_budget=1024`, which cut Stage 2 to `9.0s` while causing a worker with `0` thinking tokens to pull Monday/Wednesday events for a weekend prompt and bloating Stage 3 to `64.8s`; keeping `search_thinking_budget=None` fixed it immediately. Across the 12-case smoke suite, `lean-6q` hit `55.2s` mean latency (`-45.1%`), `64.2s` p90 (`-51.3%`), `7.0` executed queries (`$0.170`/stack), and `97.8/100` quality with `5.00/5.0` diversity (`99.0%` unique archetypes).',
					'**Final Stage 3 Sweep (Stripping Duplicate URL Footers + `extract_thinking_budget = 512`):** Auditing the Stage 2 -> Stage 3 boundary revealed that `execute_event_search` appended `### Grounded Source URLs` at the bottom of `raw_synthesis` AND `build_structure_prompt` appended `Resolved Canonical Source URLs:` a second time even when inline per-query sources were already attached. Stripping both redundant footers (`replay-lean-6q-dedup-uncapped`) pushed 12-case smoke quality to `98.08/100` (`100.0%` unique archetypes, the highest score of the project). And because Stage 3 now read clean, pre-structured candidate records instead of messy prose, capping `extract_thinking_budget = 512` (`replay-lean-6q-dedup-ext512`) cut Stage 3 extraction in half (`32.2s -> 15.2s`), dropping 12-case mean latency to `44.4s` (`44.9s` p50, `49.8s` p90) at `$0.162`/stack and `7.0` cards/stack.'
				],
				code: {
					filename: 'extract_compact_profile_digest.py',
					language: 'python',
					snippet: `def extract_compact_profile_digest(preferences_markdown: str) -> str:
    """Keep Sections 2 (Defaults), 3 (Exclusions), 5 (Positive Anchors), and 6 (Untried Hypotheses)
    while omitting verbose Section 4 tables and Section 7 historical logs across 6 parallel workers.
    """
    keep_prefixes = ("## 2.", "## 3.", "## 5.", "## 6.")
    skip_prefixes = ("## 1.", "## 4.", "## 7.")
    kept_lines, keeping = [], False
    for line in preferences_markdown.splitlines():
        stripped = line.strip()
        if stripped.startswith(keep_prefixes):
            keeping = True
            kept_lines.append(line)
        elif stripped.startswith(skip_prefixes) or stripped.startswith("## "):
            keeping = False
        elif keeping:
            kept_lines.append(line)
    return "\\n".join(kept_lines).strip() or preferences_markdown.strip()`
				}
			},
			{
				id: 'wave-4-benchmark',
				heading: '7. Wave 4: The 30-Case Stratified Cloud Run Benchmark (seed=42)',
				summary:
					'Simultaneous seeded Cloud Run Jobs eliminated day-of-week drift and proved exact 15-15 blind A/B parity at 53.7% lower median latency and 19.6% lower cost.',
				paragraphs: [
					'Earlier smoke comparisons had a subtle temporal confounder: comparing a Saturday candidate run against Friday\'s saved `baseline-smoke` run caused unfair losses on "tonight or tomorrow night" prompts because Friday events were now in the past. To make our production ship decision with zero day-of-week drift, we queued all three contenders simultaneously on Sunday, Nov 8, 2026 via Google Cloud Run Jobs against the exact same 30 Latin-square stratified cases (`--tier full --limit 30 --seed 42 --workers 3`):',
					'Across 30 cases (216 recommended event cards spanning 10 cities and 10 prompt archetypes), a position-debiased blind pairwise judge preferred `parallel-per-query-lean-6q-fastext` (`19414f416e158235`) literally 50.0% of the time (`15-15`) against both the `96.9s` original `baseline` (`b0f3a599415f5bbf`) and the `63.2s` uncapped Stage 3 variant (`lean-6q-uncapped`, which itself beat `baseline` `16-14`):'
				],
				bullets: [
					'**Wall Latency Median (`p50`):** `96.25s` (`baseline`) -> `60.55s` (`uncapped`) -> **`44.59s` (`fastext`, `-53.7%`, `-51.7s` faster)**.',
					'**Wall Latency Mean & `p90`:** Mean dropped from `96.93s` to **`45.81s` (`-52.7%`)**; `p90` tail latency dropped from `108.08s` (or `131.8s` pre-redirect fix) to **`53.00s` (`-51.0%`)**.',
					'**Per-Stage Breakdown (`baseline` vs `fastext`):** Stage 1 Planner `7.64s -> 4.29s` (`-43.8%`); Stage 2 Grounded Search `68.56s -> 26.10s` (`-61.9%`); Stage 2b Redirects `0.25s` (down from `4.54s` pre-E3); Stage 3 Extraction `20.40s -> 15.11s` (`-25.9%`, and `-52.1%` vs `31.54s` uncapped).',
					'**Web Queries & Marginal Cost:** Planned/executed queries dropped from `7.90 / 11.90` (`357` total) to **`6.00 / 7.43` (`223` total, `-37.6%`)**, cutting paid-tier marginal cost from `$0.2140`/stack (`$6.43` run) to **`$0.1720`/stack (`$5.15` run, `-19.6%`)**.',
					'**Stack Completeness & Deterministic Checks:** `30 / 30` cases succeeded (`100%` in-range with `7.23` cards/stack), `100.0%` citation integrity (up from `99.5%`), `100.0%` temporal validity and zero repeats, and `100.0%` discovery bucket coverage across all 3 buckets (up from `92.2%`).',
					'**Judge Scores & Blind Pairwise A/B:** Intra-batch diversity improved from `4.40` (`89.5%` unique archetypes) to **`4.53` (`90.9%` unique)** (`4.80` on `uncapped`), composite quality held statistically flat (`95.55` vs `95.14` `fastext` and `96.96` `uncapped`), and blind A/B tied **`15-15` (`50%`)** against both `baseline` and `uncapped`.'
				],
				code: {
					filename: 'shipped-architecture.txt',
					language: 'text',
					snippet: `[Stage 1: Hybrid 6-Query Planner] (~4.3s, plan_thinking_budget=512)
  Emits 6 queries: 3 Exploitation (2 anchor-venue + 1 constraint)
                   2 Adjacent (1 specific + 1 multi-yield OR cluster)
                   1 Wildcard (lateral leap preserving social mechanics)
          |
          +---+---+---+---+---+  ThreadPoolExecutor(max_workers=6) at t=0
          v   v   v   v   v   v
[Stage 2: 6 Simultaneous Single-Query Grounded Workers] (~24-26s wall time total)
  Compact Profile Digest (Sections 2, 3, 5, 6 only) + 1-search budget
  Outputs 1-4 terse pipe-delimited candidate records (0 essay prose)
  Single-hop 302 redirect resolution (~0.25s) + inline canonical sources per query
          |
          v
[Stage 3: Deduplicated Curation & JSON Extraction] (~15.1s, extract_thinking_budget=512)
  Strips duplicate URL footers -> enforces 1 event/venue & 1 event/subtype -> 7-8 cards
          |
          +--> IMMEDIATELY emits SSE cards_ready (User starts reading Card #1)
          v
[Stage 4: Per-Card Async Image Hydration + Browser Preloading] (0s blocking wait)`
				}
			},
			{
				id: 'images-ux',
				heading: '8. Post-Benchmark Catch: Fixing 3/8 Missing Flyers & Next-Card Preloading',
				summary:
					'A real Oakland test exposed three image pipeline bugs across anti-bot 403s, text-only aggregator tables, and lazy DOM mounting. Fixing them took flyer resolution from 3/8 to 8/8.',
				paragraphs: [
					'When we promoted `parallel-per-query-lean-6q-fastext` to the local default and ran a live Oakland underground music search (`49.84s` end to end), the events and latency felt great, except only 3 out of 8 cards displayed flyer images and flyers on later cards popped in late when flipping through the stack. Inspecting that exact 8-card batch uncovered three bugs across scraping, SSE delivery, and browser DOM mounting:',
					'Combining those three backend fallbacks took that exact local batch from `3/8` (`37.5%`) to `8/8` (`100%`) resolved images. On the delivery side, we replaced the end-of-batch image barrier with `ThreadPoolExecutor` + `as_completed` (prioritizing Card #1 first), committing each URL and emitting an individual `event: card_image` (`{candidate_id, image_url}`) over SSE the millisecond each flyer resolves. In SvelteKit (`DiscoverBoard.svelte` and `EventVisual.svelte`), only `currentEvent` is mounted in the DOM, so `<img loading="lazy">` meant Cards #2 through #8 never started downloading bytes until the user clicked Next Card. Switching the active banner to `loading="eager"` + `fetchpriority="high"` and adding a reactive `$effect` preloader (`new Image()` with `referrerPolicy = "no-referrer"`) that warms the current card + next 2 cards first made flipping through the stack instant.'
				],
				bullets: [
					'**1. Cloudflare / Anti-Bot `403`s on Event Sites (`ra.co`):** Resident Advisor (`ra.co/events/...`) blocked standard Chrome `User-Agent` headers with `403 Forbidden`, yet returned `200 OK` with full OpenGraph flyer metadata when retried with link-preview bot headers (`User-Agent: WhatsApp/2.23.20.0`).',
					'**2. Text-Only Aggregator Tables (`19hz.info`) & Minimal Venue Shells (`tiat.place`):** Two cards cited `19hz.info/eventlisting_BayArea.php` (a bare HTML table with zero images, plus our old `fetch_event_images_parallel` keyed its dictionary by `source_url`, making it impossible for two cards sharing an aggregator URL to get distinct flyers), while `tiat.place` embedded `https://luma.com/tiat`. We added `_extract_outbound_event_url(html_text, title_hint=cand.title)` to locate the `<tr>`/`<li>` row matching the card\'s title (or embedded Luma/RA/Eventbrite/Dice/Partiful/TicketWeb links) and hop one step per candidate.',
					'**3. Hard Cloudflare Challenges (`crybaby.live`):** When both Chrome and WhatsApp headers returned `403`, `_fetch_microlink_fallback_image()` (`https://api.microlink.io?url=...` on `401/403/429/503`) cleanly extracted the underlying TicketWeb flyer (`https://i.ticketweb.com/...jpg`).'
				]
			},
			{
				id: 'production-deployment',
				heading: '9. Zero-Disruption Production Deployment on Cloud Run',
				summary:
					'One multi-stage Docker image powers the web service, Alembic migrator, and cloud eval job, guarded by pre-cutover active-user SSE checks.',
				paragraphs: [
					'After verifying the pipeline and image streaming locally (`30 passed` in `pytest` and `0 errors` in `svelte-check`), we shipped to production on Google Cloud (`us-central1`). A single multi-stage `Dockerfile` (`node:22-alpine` compiling the SvelteKit static SPA -> `python:3.12-slim` + `uv:0.6.3` bundling `api/`, `mvp/`, `evals/`, and `web/build/` under non-root `appuser`) powers all three cloud workloads: the `event-buddy` Cloud Run Service (`timeout=300s`), the `event-buddy-migrate` Alembic job, and the `event-buddy-eval` benchmark job.',
					'Because a live search holds an open SSE connection for ~45 seconds, `./scripts/deploy.sh` (`make deploy-fast`) validates that all GCP Secret Manager secrets have `ENABLED` versions and runs `./scripts/check-active-users.sh` twice (once before Cloud Build and once immediately before traffic cutover) so a deployment never severs an active user\'s in-flight search stream. Once Cloud Build finishes the immutable `<timestamp>-<git-sha>` image and Cloud Run cuts traffic over, the script polls `/api/health` and `/api/ready` (verifying live Neon Postgres connectivity) before completing in `2m 53s`.'
				]
			}
		],
		team: {
			human: 'Matt Toronto',
			aiCollaborator: 'Gemini 4 Argon',
			harness: 'Cursor'
		}
	},
{
		slug: 'how-this-site-works',
		title: 'How This Site Works: SvelteKit, GitHub Pages, and Cloudflare CLI',
		date: '2026-11-10',
		readingTime: '5 min read',
		summary:
			'How I set up this blog and shipped it from the terminal: static prerendering with SvelteKit 5, GitHub Actions CI/CD, and automated DNS and TLS provisioning across Namecheap, Cloudflare, and GitHub Pages.',
		repoUrl: 'https://github.com/mrtoronto/mrt-blog',
		repoName: 'mrtoronto/mrt-blog',
		tags: ['SvelteKit', 'GitHub Pages', 'Cloudflare', 'CI/CD', 'DNS'],
		overview: {
			label: 'Architecture at a Glance',
			bullets: [
				'**Static Build:** SvelteKit 5 with `@sveltejs/adapter-static` compiles all routes and typed post data from `src/lib/data/content.ts` into plain HTML at build time.',
				'**Zero-Click Deploys:** Pushing to `main` triggers a GitHub Actions workflow that builds and publishes the static bundle straight to GitHub Pages.',
				'**CLI-Provisioned DNS & TLS:** Domain registered on Namecheap (`m-r-t.xyz`), delegated to Cloudflare nameservers, and pointed at GitHub Pages via the Cloudflare REST API with enforced Let\'s Encrypt HTTPS.'
			]
		},
		sections: [
			{
				paragraphs: [
					'I wanted a simple place to document my side projects, explain why I built them, and keep notes on the technical trade-offs. I did not want to maintain a database or deal with a heavy CMS. This site is just a static SvelteKit 5 app that rebuilds on every `git push` and serves from `m-r-t.xyz`.',
					'Almost the entire setup was done straight from the terminal. We created the GitHub repository, provisioned the Cloudflare DNS zone, pushed the DNS records, and enabled HTTPS certificates without clicking around web dashboards.'
				]
			},
			{
				id: 'static-prerendering',
				heading: '1. Static Prerendering with SvelteKit 5',
				summary:
					'Compile every page to static HTML with @sveltejs/adapter-static and handle subpath vs. root path routing dynamically.',
				paragraphs: [
					'The site runs on Svelte 5 and SvelteKit using `@sveltejs/adapter-static`. Because `+layout.ts` exports `prerender = true` and `trailingSlash = "always"`, Vite compiles the whole app into static HTML, CSS, and small client chunks inside `build/`.',
					'When the site first went up on the default `github.io` project URL (`/mrt-blog`), it needed a subpath prefix. Once the custom domain (`m-r-t.xyz`) went live, it needed to serve from the root path (`/`). Reading `BASE_PATH` from the build environment let us switch between the two without touching any route links:'
				],
				code: {
					filename: 'svelte.config.js',
					language: 'javascript',
					snippet: `import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			strict: true
		}),
		paths: {
			base: process.argv.includes('dev') ? '' : (process.env.BASE_PATH ?? '')
		}
	}
};

export default config;`
				}
			},
			{
				id: 'content-as-code',
				heading: '2. Content as Code',
				summary:
					'Store projects and posts as typed TypeScript objects in src/lib/data/content.ts instead of using an external CMS.',
				paragraphs: [
					'I wanted to keep project cards and write-ups right next to the code. Instead of hooking up an external CMS, all projects and posts live in `src/lib/data/content.ts` as typed TypeScript objects.',
					'Adding a new project write-up takes three quick steps:'
				],
				bullets: [
					'**Project card:** Add an entry to the `projects` array in `src/lib/data/content.ts` with its GitHub repo URL, status, and stack tags.',
					'**Post content:** Add a post entry to the `posts` array with an `overview` card, sections, code snippets, and `team` credits.',
					'**Build-time discovery:** SvelteKit reads every post slug via an `entries()` generator and prerenders `/posts/[slug]/index.html` during `npm run build`.'
				]
			},
			{
				id: 'github-actions-cicd',
				heading: '3. CI/CD with GitHub CLI & GitHub Actions',
				summary:
					'Initialize the repo and Pages via the gh CLI and deploy automatically on every push to main.',
				paragraphs: [
					'We initialized the repository and turned on GitHub Pages from the terminal using the GitHub CLI (`gh repo create` and `gh api /repos/:owner/:repo/pages -f build_type=workflow`).',
					'On every push to `main`, `.github/workflows/deploy.yml` installs dependencies, checks `actions/configure-pages@v5` for the active `base_path`, runs the build, and deploys the static artifact:'
				],
				code: {
					filename: '.github/workflows/deploy.yml',
					language: 'yaml',
					snippet: `steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: 22
      cache: npm
  - run: npm ci
  - name: Configure GitHub Pages
    id: pages
    uses: actions/configure-pages@v5
  - name: Build static SvelteKit site
    env:
      BASE_PATH: \${{ steps.pages.outputs.base_path }}
    run: npm run build
  - uses: actions/upload-pages-artifact@v3
    with:
      path: 'build'
  - uses: actions/deploy-pages@v4`
				}
			},
			{
				id: 'custom-domain-dns',
				heading: '4. Custom Domain Setup: Namecheap to Cloudflare to GitHub Pages',
				summary:
					'Keep domain registration on Namecheap, delegate nameservers to Cloudflare for API control, and point DNS-only records at GitHub Pages.',
				paragraphs: [
					'I registered `m-r-t.xyz` on Namecheap, but I prefer keeping DNS management on Cloudflare so all of my domains are in one place and programmable from the CLI.',
					'Each layer in the chain handles one job:'
				],
				bullets: [
					'**Registrar (Namecheap):** Holds the domain registration and points custom nameservers to Cloudflare.',
					'**DNS Provider (Cloudflare):** Hosts the DNS zone and serves `A`, `AAAA`, and `CNAME` records pointing to GitHub Pages.',
					'**Origin & TLS (GitHub Pages / Fastly CDN):** Serves the static build based on `static/CNAME` and provisions a Let\'s Encrypt TLS certificate.'
				],
				deepDive: {
					title: 'Deep Dive: Bypassing the 60-day ICANN transfer lock',
					paragraphs: [
						'Newly registered domains have a mandatory 60-day ICANN lock before you can transfer the registrar itself to Cloudflare Registrar.',
						'You do not actually need to wait 60 days to use Cloudflare DNS. By leaving Namecheap as the registrar of record and updating the domain\'s custom nameservers to the pair assigned by Cloudflare, 100% of DNS management moves over to Cloudflare\'s API right away.'
					]
				}
			},
			{
				id: 'cloudflare-api-automation',
				heading: '5. Automating Cloudflare DNS via the REST API',
				summary:
					'Use a scoped Cloudflare API token in a shell script to create the zone and push all nine GitHub Pages DNS records.',
				paragraphs: [
					'Instead of manually entering nine DNS records in a dashboard, we put a scoped Cloudflare API token in a local, gitignored `.env` file (with `Zone:Edit` and `DNS:Edit` permissions) and scripted the zone setup with `curl`.',
					'We also set `proxied: false` (DNS-only mode) on every record. That lets GitHub Pages verify domain ownership directly against its Fastly edge IPs and issue its Let\'s Encrypt certificate without running into Cloudflare SSL proxy conflicts:'
				],
				code: {
					filename: 'provision-dns.sh (excerpt)',
					language: 'bash',
					snippet: `# 1. Create the zone in Cloudflare
curl -s -X POST "https://api.cloudflare.com/client/v4/zones" \\
  -H "Authorization: Bearer $CF_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  --data '{"name":"m-r-t.xyz","type":"full"}'

# 2. Point apex A & AAAA records + www CNAME to GitHub Pages
for ip in 185.199.108.153 185.199.109.153 185.199.110.153 185.199.111.153; do
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \\
    -H "Authorization: Bearer $CF_API_TOKEN" \\
    -H "Content-Type: application/json" \\
    --data "{\\"type\\":\\"A\\",\\"name\\":\\"m-r-t.xyz\\",\\"content\\":\\"$ip\\",\\"proxied\\":false}"
done

curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \\
  -H "Authorization: Bearer $CF_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  --data '{"type":"CNAME","name":"www","content":"mrtoronto.github.io","proxied":false}'`
				}
			},
			{
				id: 'verifying-propagation-https',
				heading: '6. Verifying Propagation & Enforcing HTTPS',
				summary:
					'Poll DNS propagation with dig and run a single gh api call to issue the TLS cert and enforce HTTPS.',
				paragraphs: [
					'After updating the nameservers on Namecheap, we just had to wait about 30 minutes for the `.xyz` TLD registry (CentralNic) to publish the `NS` delegation.',
					'Once the `A` records resolved publicly, we ran one GitHub API call to trigger certificate verification and enforce HTTPS redirects across the site:'
				],
				code: {
					filename: 'enable-https.sh',
					language: 'bash',
					snippet: `# Set custom domain and enforce HTTPS via GitHub CLI
gh api --method PUT /repos/mrtoronto/mrt-blog/pages \\
  -f cname="m-r-t.xyz" \\
  -F https_enforced=true \\
  -f build_type="workflow"`
				},
				deepDive: {
					title: 'Deep Dive: Why dig @a.nic.xyz NS +short looked empty during propagation',
					paragraphs: [
						'While polling the `.xyz` TLD server directly with `dig @a.nic.xyz m-r-t.xyz NS +short`, the output stayed completely blank even after delegation was live.',
						'That happens because TLD referral servers return delegated `NS` records in the `AUTHORITY` section of the DNS packet rather than the `ANSWER` section, and `+short` only prints the `ANSWER` section. Dropping `+short` (or querying a recursive resolver like `dig @1.1.1.1 m-r-t.xyz NS +short`) confirmed the Cloudflare nameservers were already active.'
					]
				}
			}
		],
		team: {
			human: 'Matt Toronto',
			aiCollaborator: 'Gemini 4 Argon',
			harness: 'Cursor'
		}
	}
];
