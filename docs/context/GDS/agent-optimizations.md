# Go Do Stuff (Event Buddy) — Complete Agent Optimization & Evaluation Source Dossier

> **Purpose of this artifact:** Raw, exhaustive engineering notes, architecture details, code snippets, experiment tables, dead ends, root-cause analyses, and deployment mechanics for writing a technical blog post on cutting an AI agent's latency by **53%** (`96.9s` $\rightarrow$ `45.8s` mean; `96.2s` $\rightarrow$ `44.6s` p50) and marginal cost by **20%** (`$0.214` $\rightarrow$ `$0.172`/stack) while holding recommendation quality constant (`15–15` exact tie in blind pairwise A/B evaluation across 30 stratified test cases, plus a `16–14` win on an uncapped variant).
>
> **Note on privacy:** The source repository is private, so self-contained code snippets, schemas, prompts, and architecture diagrams are included inline below so the blog post can quote or adapt any part without linking to the repo.

---

## 1. Product Context & Why Generic Optimization Advice Would Break the Product

### What the App Does
**Go Do Stuff** (internal slug: `event-buddy`) is a hyper-local event discovery web app (FastAPI + SQLAlchemy/Postgres + SvelteKit static SPA) built around a transparent, user-editable plain-text Markdown taste profile (`preferences.md`).

Instead of acting like an SEO directory or keyword filter (Eventbrite, Meetup, Luma), the agent:
1. Conducts a brief 3-question onboarding (or learns continuously from card reactions like `I'm Going!`, `Save for Later`, `Bad Timing`, `Not for Me` + free-text `"Why?"` notes).
2. Maintains a structured 7-section `preferences.md` file capturing:
   - **Section 1:** Current Reframed Goal (1-sentence synthesis)
   - **Section 2:** Defaults & Hard Constraints (location, travel radius, demographic filter)
   - **Section 3:** Hard Exclusions — *semantic* category filters (e.g., excluding `"run clubs"`, `"rooftop cocktail mixers"`, or `"passive spectator shows"` means filtering out `"5k social jog"` or `"skyline sunset party"`, not just exact keyword matches)
   - **Section 4:** Latent & Experiential Preferences ("The Why" — e.g., participatory doing vs. passive watching, small-group shared physical task where conversation happens naturally vs. loud bars)
   - **Section 5:** Positive Interests & Anchors (specific local studios, creative reuse centers, maker spaces, board game cafes)
   - **Section 6:** Uncertain Hypotheses to Test Next
   - **Section 7:** Event & Feedback History (distinguishing aesthetic/fit rejections from logistical `"busy Friday"` rejections)
3. Deals a focused **stack of 5–8 verified local event cards** split across three intentional discovery buckets:
   - **60–70% Exploitation:** High-confidence matches for known taste and anchor venues.
   - **20–30% Adjacent Exploration:** Neighboring experiential domains sharing the same social/physical mechanics (e.g., someone who likes beginner sewing + tabletop games gets a linocut printmaking drop-in or community repair clinic).
   - **10% Plausible Wildcard:** A serendipitous lateral leap with a defensible hypothesis (e.g., an amateur astronomy lecture or volunteer urban forestry morning).

### What Triggered This Optimization Effort
We wanted to move beyond biased friends-and-family testing by running geo-targeted **Reddit Ads** (starting with Oakland / East Bay subreddits like `r/oakland` and `r/berkeley` at ~$10/day for $100–$200 of R&D user research) and eventually supporting a **$5–$6/month flat membership** (rejecting pay-per-search credit systems because credits create "slot-machine anxiety" if a user gets a stack they don't love).

Before sending paid cold traffic into the app, two concrete problems forced us to audit the agent:
1. **Latency Problem (`90–120+ seconds` per stack):** Early testers reported that clicking **Scout for Events** took 90 to 120+ seconds to return cards. For a cold visitor clicking through from a Reddit ad, staring at a spinner for two minutes is fatal.
2. **Unit Economics & Margin Problem (`~$0.18–$0.22` per stack at paid-tier search rates):**
   - The backend uses `gemini-3.8-flash` with **Grounding with Google Search**.
   - Late-2026 Gemini pricing:
     - **LLM Tokens:** `$0.75 / 1M` input tokens, `$3.75 / 1M` output + thinking tokens (`~$0.02–$0.04` per stack).
     - **Google Search Grounding (The Primary Cost Driver):** Google bills **per individual web search query executed by the model**, not per API request. After a **5,000 queries/month free tier** per GCP project (~first 500 stacks/month free), paid grounding costs **`$14.00 per 1,000 queries` (`$0.014` per web query)**.
   - Our original pipeline executed **8 to 13 web queries per stack** (`10.2` average in local SQLite `event_buddy.db`, `11.9` average on a 30-case benchmark), costing **`~$0.18–$0.21` per stack** at scale.
   - On a **$5.00/month** subscription (`$4.55` net after Stripe's `2.9% + $0.30`), 5–10 stacks/month is healthy (`~$0.90–$1.80` cost), **unless** an optimization accidentally balloons web queries to 17–18 per stack (`$0.30–$0.34`/stack), which wipes out subscription margin.

### The Non-Negotiable Product Rule
We established an explicit rule before changing a single line of code:
> **We would rather accept a 20–40% gross margin with stellar, diverse, word-of-mouth-worthy recommendations (7–8 cards per stack) than chase an 80% software margin with repetitive, generic, or mediocre recommendations.**

We could not just change a prompt, eyeball two stacks in localhost, say *"looks fast and pretty good,"* and ship it. We needed a rigorous, automated evaluation harness first.

---

## 2. Baseline Audit: Where Were the 90–120 Seconds & $0.21 Actually Going?

Before touching prompts or parameters, we inspected `discovery_batches.telemetry_json` from our first 6 real discovery batches in SQLite and traced the code path end to end.

### Original Four-Stage Monolithic Architecture (`95–135s` total wall time)

```text
Original Sequential "Untyped Prose Relay" Pipeline (~97–120s)
=============================================================
[Stage 1: Search Planner] (7.0–7.6s)
  └─> Reads preferences.md + user prompt
  └─> Outputs SearchPlanSchema JSON:
      • 3–5 Exploitation queries
      • 2–3 Adjacent queries
      • 1–2 Wildcard queries (8–10 narrow queries total)
          │
          ▼
[Stage 2: Monolithic Grounded Search + Essay Generation] (66.7–68.6s mean, up to 115s!)
  ├─> All 8–10 queries stuffed into ONE generate_content() call
  ├─> Enabled BOTH GoogleSearch() AND UrlContext() in a try/except fallback
  ├─> Model runs multi-turn search hops serially inside its black-box tool loop
  └─> Model writes a 1,500–2,500 word Markdown prose essay (8,500–15,300 chars)
          │
          ▼
[Stage 2b: Eager Redirect Resolution] (3.1–8.0s)
  └─> Resolves ALL 30–40 vertexaisearch.cloud.google.com redirect URLs via httpx
      with follow_redirects=True (opening TLS handshakes to 35+ external venue sites,
      even the ~30 URLs Stage 3 will throw away!)
          │
          ▼
[Stage 3: Full Re-Read & Structured JSON Re-Generation] (20.4–22.3s)
  ├─> Re-reads preferences.md + entire 12k-char Markdown essay + 35 source URLs
  ├─> Spends 3,500–11,000 uncapped thinking tokens reconciling prose claims vs URLs
  └─> Re-writes the winning 5–8 events from scratch into StructuredDiscoveryOutput JSON
          │
          ▼
[Stage 4: Synchronous OpenGraph Image Scraping] (5.0–10.0s blocking SSE)
  └─> Scrapes HTML of all 5–8 venue websites BEFORE emitting the `complete` SSE event
```

### Five Specific Bottlenecks Uncovered in the Baseline Audit
1. **Accidental Tool Combo + Silent Retry Risk (`google_search` + `url_context`):** Stage 2 passed both `GoogleSearch()` and `UrlContext()` in the same `generate_content` call inside a `try / except` that retried with `GoogleSearch()` alone on failure. Telemetry showed `deep_read_urls = 0` across all 6 batches, meaning `url_context` wasn't adding value in fast mode while encouraging multi-hop latency.
2. **Serial Multi-Hop Search Inside One Monolithic LLM Call:** Passing 8–10 ultra-specific queries (e.g., `"Oakland hand bookbinding paper marbling textile craft workshop November 2026"`) into a single `generate_content` call meant Gemini reasoned, searched a few queries, read snippets, reasoned again, ran follow-up searches (`11.9` executed queries on average), and only then started writing output.
3. **Double LLM Generation ("The Untyped Prose Relay"):** Stage 2 wrote a polished 1,500–2,500 word Markdown essay describing 8–12 events, and then Stage 3 read that entire essay plus `preferences.md` again to rewrite the exact same events into JSON—paying output and thinking token latency twice.
4. **Full-Chain Redirect Resolution (`follow_redirects=True`):** Grounding chunks from Gemini return `https://vertexaisearch.cloud.google.com/grounding-api-redirect/...` URLs. Our resolver called `httpx.Client(follow_redirects=True).head(uri)` (with a `GET` fallback and `4.0s` timeout each) and deduplicated *after* network calls—waiting on slow third-party venue servers instead of just reading Google's `302 Location` header.
5. **Synchronous Blocking Image Scraping + Uncapped Reasoning Budgets:** `fetch_event_images_parallel` blocked the SSE `complete` event for 5–10s at the very end, and neither Stage 1 nor Stage 3 set an explicit `thinking_budget` on `gemini-3.8-flash`.

---

## 3. Refactoring for Scientific Experimentation: One Pure Function Shared by Production & Eval

A critical design requirement before writing any eval script was **zero duplicated business logic**. We did not want an eval script that re-implemented a "test version" of the prompts or Gemini calls while the FastAPI app drifted separately.

We refactored the production pipeline into a pure, database-independent function parameterized by a single Pydantic config model (`DiscoveryConfig`):

```text
execute_discovery_pipeline(preferences_markdown, prompt, already_seen, config: DiscoveryConfig)
    -> DiscoveryPipelineResult(events, plan, diagnostics, image_map, config)
```

Both:
- **Production (`run_structured_discovery` in FastAPI)**, and
- **Offline/Cloud Evaluation (`buddy-eval`)**
call `execute_discovery_pipeline(...)` directly.

### Complete `DiscoveryConfig` Schema (Every Experimental Knob)

```python
class DiscoveryConfig(BaseModel):
    """Parameterized configuration for `algo(preferences_md, prompt, config) -> stack` experiments."""

    # 1. Model & Provider Mode
    model_name: str = "gemini-3.8-flash"
    provider_mode: str = "gemini"  # "gemini" | "gemini-deep"

    # 2. Stage 1: Query Generation (Planner) Knobs
    exploitation_query_range: tuple[int, int] = (3, 3)
    adjacent_query_range: tuple[int, int] = (2, 2)
    wildcard_query_range: tuple[int, int] = (1, 1)
    query_granularity_style: str = "hybrid"  # "specific" | "multi_yield_clusters" | "hybrid"
    planner_extra_instructions: str = DEFAULT_PLANNER_EXTRA_INSTRUCTIONS
    plan_prompt_template: str | None = None
    plan_temperature: float = 0.3
    plan_thinking_budget: int | None = 512

    # 3. Stage 2: Grounded Search & Synthesis Knobs
    enable_url_context_on_pass1: bool = False
    parallel_bucket_execution: bool = False
    search_execution_mode: str = "parallel_per_query"  # "single_call" | "parallel_buckets" | "parallel_per_query"
    per_query_candidate_limit: int = 4
    single_search_per_worker: bool = True
    compact_worker_profile_digest: bool = True
    drop_ungrounded_worker_outputs: bool = True
    attach_per_query_sources_inline: bool = True
    single_hop_redirects: bool = True
    synthesis_verbosity: str = "compact"  # "detailed" | "compact"
    search_execution_instructions: str = ""
    search_candidate_target_range: tuple[int, int] = (10, 14)
    search_prompt_template: str | None = None
    search_temperature: float = 0.3
    search_thinking_budget: int | None = None
    max_sources_to_resolve: int = 30
    redirect_timeout_sec: float = 2.5

    # 4. Stage 3 & 4: Selection Criteria, Extraction & Image Knobs
    target_card_range: tuple[int, int] = (5, 8)
    selection_criteria_rules: list[str] | None = None
    extra_selection_instructions: str = DEFAULT_EXTRA_SELECTION_INSTRUCTIONS
    structure_prompt_template: str | None = None
    extract_temperature: float = 0.2
    extract_thinking_budget: int | None = 512
    extraction_synthesis_char_limit: int | None = None
    fetch_images: bool = True

    # 5. Cost Estimation Constants (Paid Tier Marginal Rates for Eval Comparisons)
    cost_per_web_query_usd: float = 0.014  # $14 / 1,000 grounded search queries
    cost_per_1m_input_tokens_usd: float = 0.75
    cost_per_1m_output_tokens_usd: float = 3.75
```

### Fine-Grained Stage-Level Telemetry (`SearchDiagnostics`)
Initially, our diagnostics only tracked total tokens and Stage 2 elapsed seconds, which made it impossible to tell whether a change helped Stage 2 only to hurt Stage 3. We expanded `SearchDiagnostics` to capture:
- **Per-Stage Wall-Clock Seconds:** `plan_seconds`, `search_seconds`, `redirect_seconds`, `extract_seconds`, `image_seconds`, `total_elapsed_seconds`.
- **Per-Stage Token Breakdown:**
  - `plan_input_tokens`, `plan_output_tokens`, `plan_thinking_tokens`
  - `search_input_tokens`, `search_output_tokens`, `search_thinking_tokens`
  - `extract_input_tokens`, `extract_output_tokens`, `extract_thinking_tokens`
  - `stage_token_telemetry_complete: bool` (so Stage 3 replays can replace extraction token counts cleanly without double-counting)
- **Exact Search Footprint:** `planned_exploitation_queries`, `planned_adjacent_queries`, `planned_wildcard_queries`, `executed_web_queries` (extracted directly from `candidate.grounding_metadata.web_search_queries`), and `sources` (`raw_uri` + `resolved_uri`).
- **Config Reproducibility:** `config_snapshot` (the exact JSON dump of `DiscoveryConfig`) plus a **16-character SHA-256 `config_fingerprint`** computed over canonical sorted JSON so every run's exact parameter set is uniquely identifiable even if preset names evolve.

---

## 4. Building the Evaluation Harness (`buddy-eval`): Dataset, Metrics, Replay, & Cloud Observability

Because live web events change daily, building an eval for a live-search agent is much trickier than grading static Q&A. We built a dedicated CLI package (`uv run buddy-eval`) with four layers of evaluation, zero-search-cost snapshot replay, and cloud-backed persistence.

### 4.1 The Two-Tier Canonical Dataset (`10 Personas × 10 Prompt Archetypes = 100 Cases`)

To prevent overfitting to a single "Oakland maker" profile, we authored **10 realistic 7-section `preferences.md` personas** spanning major metros, smaller cities with thinner event inventory, strict lifestyle constraints, and cold-start onboarding:

1. **`01_oakland_maker_games`** (*Oakland / East Bay, CA*): Indoor tactile maker workshops (ceramics, printmaking, sewing, woodwork, repair cafes) + tabletop games; excludes run clubs, rooftop cocktail parties, yoga in the park, and passive spectator shows.
2. **`02_sf_intellectual_salons`** (*San Francisco, CA*): Independent history/science lectures, community darkrooms, letterpress/book arts, micro-cinema Q&As; excludes tech founder/VC networking mixers and nightclubs.
3. **`03_nyc_brooklyn_offbeat_arts`** (*Brooklyn / NYC, NY*): Participatory zine jams, figure drawing drop-ins, indie game playtests, creative reuse; budget-conscious; excludes Midtown paint-and-pour tourist traps.
4. **`04_chicago_culinary_craft`** (*Chicago, IL*): Hands-on fermentation/baking/dumpling workshops, neighborhood tool libraries, acoustic jam circles; excludes loud sports bars and expensive tasting menus.
5. **`05_portland_stewardship_outdoors`** (*Portland, OR*): Urban forestry/habitat restoration volunteer crews, foraging/mycology walks, bike co-op wrench nights, board game cafes.
6. **`06_austin_sober_weeknights`** (*Austin, TX*): Strictly alcohol-free weeknight social activities (gongfu tea circles, late-night coffeehouse games, community choir/improv, clay studios); strictly excludes 6th Street bars and concerts.
7. **`07_seattle_cozy_rainy_weekend`** (*Seattle, WA*): Cozy indoor rainy-weekend craft circles, visible mending/sashiko, museum studio workshops, puzzle/board game drop-ins.
8. **`08_minneapolis_community_maker`** (*Minneapolis / St. Paul, MN*): Glassblowing/metalworking tasters, folk school classes, book arts, curling/casual community rec.
9. **`09_boulder_smaller_market`** (*Boulder / Front Range, CO*): Smaller-city stress test where local inventory is much sparser—tests whether the agent broadens gracefully along the Front Range without hallucinating fake events.
10. **`10_cold_start_sparse_profile`** (*Denver, CO — Cold Start*): Simulates a brand-new user 30 seconds after finishing the 3-question onboarding modal (sparse profile: city + 2 beginner interests + 2 exclusions, zero history in Section 7).

Each persona is paired with **10 relative-time prompt archetypes** (resolved dynamically against the runtime date so the benchmark never rots as calendar dates pass):
- `p01_weekend`: *"What should I do this weekend?"*
- `p02_tonight`: *"Anything good happening tonight or tomorrow night?"*
- `p03_weeknight`: *"Find me something for a weeknight this coming week."*
- `p04_budget`: *"Show me free or under-$20 options for this weekend."*
- `p05_solo`: *"I'm going solo this Saturday and want somewhere easy to talk to people naturally."*
- `p06_hands_on`: *"I want to make or build something physical with my hands this week."*
- `p07_surprise`: *"Surprise me with something outside my usual routine that still fits my social vibe."*
- `p08_indoor_cozy`: *"Keep it strictly indoors and low-key this weekend."*
- `p09_daytime`: *"What's happening Saturday or Sunday morning or afternoon (done by 5pm)?"*
- `p10_deeper_cut`: *"Skip the most obvious venues and dig deeper into smaller community or neighborhood spaces this week."*

#### Execution Tiers & Seeded Latin-Square Stratified Sampling
- **Dry Run (`--tier smoke --limit 2`):** 2 cases (~1 min, ~$0.30) to catch broken prompts/schemas before spending money.
- **Smoke Suite (`--tier smoke`):** **12 flagship cases** spanning all 10 cities and diverse constraints (~3–5 min, ~$2.00).
- **Stratified Mid-Scale Benchmark (`--tier full --limit 30 --seed 42`):** Running all 100 cases for 3 contenders would cost ~$55 and take hours. Instead, we implemented a **deterministic seeded Latin-square sampler** in `dataset_loader.py`:
  ```python
  rng = random.Random(seed)
  persona_ids = list(by_persona.keys())
  rng.shuffle(persona_ids)
  prompt_indices = list(range(num_prompts))
  rng.shuffle(prompt_indices)

  stratified = []
  for r_idx in range(num_prompts):
      for p_idx, pid in enumerate(persona_ids):
          p_cases = by_persona[pid]
          q_idx = prompt_indices[(p_idx + r_idx) % len(p_cases)]
          chosen = p_cases[q_idx]
          if chosen not in stratified:
              stratified.append(chosen)
              if len(stratified) >= limit:
                  break
  ```
  With `limit=30, seed=42`, every contender runs on the **exact same 30 `(persona, prompt)` pairs**, guaranteed to include **exactly 3 prompts for each of the 10 cities** and **3 instances of each of the 10 prompt archetypes**—giving apples-to-apples paired comparisons at 30% of the 100-case cost!

---

### 4.2 Four-Layer Grading Rubric (Why Single 1–10 LLM Scores Aren't Enough)

Every case in `buddy-eval` is graded across four distinct layers:

#### Layer 1: Hard Deterministic Checks (`evals/metrics_deterministic.py` — 100% Code-Verified)
Zero LLM subjectivity:
- **`citation_integrity_rate`:** Verifies every card's normalized `source_url` (or domain) actually exists in `diagnostics.sources` (`grounding_chunks`) so Stage 3 cannot hallucinate URLs.
- **`deep_link_rate`:** Checks whether `source_url` has a specific path/query rather than a bare homepage domain.
- **`temporal_valid_rate`:** Verifies `start_date_iso` (`YYYY-MM-DD`) is valid and in the current/next year (or `is_recurring=True`).
- **`in_target_card_range` & `field_completeness_rate`:** Checks that the stack has `5–8` cards and every required field (`title`, `source_url`, `date_label`, `time_label`, `venue`, `price`, `description`, `why_it_fits`, `caveats`) is non-empty.
- **`no_em_dash_rate`:** Verifies zero `—` characters (enforcing non-AI-sounding copy).
- **`zero_repeat_rate`:** Ensures zero overlap with `already_seen` titles from Section 7 of the persona's profile.
- **`bucket_coverage_score`:** Fraction of the 3 discovery buckets (`Exploitation`, `Adjacent`, `Wildcard`) present in the stack (`1.0` = all three represented).

#### Layer 2: Decomposed Structured LLM-as-a-Judge (`evals/judge.py`)
Calls `gemini-3.8-flash` (`temperature=0.1`, `thinking_budget=512`, structured output schema `BatchJudgeEvaluation`) requiring evidence-based `brief_rationale` per card before scoring:
- **Per-Card Metrics:**
  1. `violates_hard_exclusion` (`bool` $\rightarrow$ `exclusion_pass_rate`): Strict semantic check against Sections 2 & 3 of `preferences.md` + prompt constraints (budget, indoor, sober, daytime).
  2. `experiential_mechanics_fit` (`1–5`): Does the social/activity format match Section 4 ("The Why")?
  3. `local_specificity_score` (`1–5`): Concrete scheduled workshop/event at a named local venue (`5`) vs. generic "go walk in Golden Gate Park anytime" filler (`1–3`).
  4. `description_clarity_score` (`1–5`): Concrete, factual description and honest caveats (`5`) vs. promotional hype (`1`).
  5. `activity_archetype` (`str`): Short 2–3 word label (e.g., `"wheel pottery"`, `"linocut printing"`). If a stack has 3 pottery classes, the judge assigns `"wheel pottery"` to all 3 so repetition is caught mathematically!
- **Stack-Level Metrics:**
  - `unique_archetype_ratio`: `len(distinct_archetypes) / len(events)`.
  - `intra_batch_diversity_score` (`1–5`): Variety across mediums, venues, and days.
  - `exploration_leap_quality` (`1–5`): How thoughtful and defensible the `Adjacent` and `Wildcard` picks are.
  - `overall_stack_score` (`1–5`).
- **Weighted `composite_quality_score` (`0–100`):**
  ```python
  composite = (
      (exclusion_pass_rate * 25.0)
      + ((avg_fit / 5.0) * 25.0)
      + ((intra_batch_diversity_score / 5.0) * 20.0)
      + ((avg_spec / 5.0) * 15.0)
      + (((exploration_leap_quality + overall_stack_score) / 10.0) * 15.0)
  )
  ```

#### Layer 3: Position-Debiased Blind Pairwise A/B Judge (`buddy-eval compare <run_a> <run_b>`)
As we discovered in Wave 1, **absolute composite scores compress huge real-world quality differences** (a run scoring `92.3` lost `11–1` to a run scoring `96.4`!).
- `compare_stacks_blind_ab` takes every shared `case_id` between Run A and Run B.
- To eliminate LLM position bias (`STACK_1` preference), it deterministically hashes `case_id` (`int(md5(case_id), 16) % 2 == 1`) so Run A and Run B are assigned to `STACK_1` vs. `STACK_2` 50/50 across the dataset.
- Both stacks display their own `Resolved Target Window` header so the judge evaluates temporal fit fairly, and declares `'STACK_1'`, `'STACK_2'`, or `'TIE'` on `better_stack`, `fit_winner`, `diversity_winner`, and `specificity_winner` with a 2–3 sentence comparative rationale.

#### Layer 4: Zero-Search-Cost Stage 3 Snapshot Replay (`buddy-eval replay --from-run <tag>`)
Because every live run saves `diagnostics.raw_synthesis` and `diagnostics.sources` inside `evals/runs/<tag>.json`, we built `buddy-eval replay` to re-run **only Stage 3 (card selection & JSON extraction) + Layer 1/2 judging** against saved search evidence:
- **$0.00 Google Search Grounding cost**,
- Runs 12 cases in ~30 seconds (4 concurrent replay workers),
- Isolates Stage 3 prompt, deduplication, card-count, and `extract_thinking_budget` changes with **zero live-web variance**!

---

### 4.3 Cloud Artifact Storage (GCS) + Normalized 6-Tab Google Sheets Ledger + Cloud Run Jobs

Running dozens of experiments locally quickly created artifact sprawl, and a single flat CSV in Cloud Storage would have race-condition conflicts when running parallel jobs. We built a clean three-part MLOps/eval persistence stack:

1. **Canonical Immutable JSON Artifacts in GCS (`gs://<project>-evals/evals/`):**
   - Bucket configured with uniform bucket-level access and object versioning.
   - Layout:
     - `runs/<tag>.json`: Full-fidelity source of truth (persona Markdown snapshot, prompt, config, search plan, raw synthesis, grounded sources, extracted cards, stage-by-stage token/latency telemetry, deterministic checks, and full judge rationales).
     - `configs/<tag>.json`: Lightweight standalone config manifest + case list.
     - `dataset/cases.json` & `dataset/personas/*.md`: Canonical inputs.
   - `load_run_artifact(tag)` automatically pulls `runs/<tag>.json` from GCS on cache miss—so a run executed in the cloud can be immediately inspected (`buddy-eval show`), replayed (`buddy-eval replay`), or compared (`buddy-eval compare`) from a laptop with zero manual file copying.

2. **Normalized 6-Tab Google Sheets Monitoring Workbook (`evals/sheets_export.py`):**
   - Instead of maintaining a single conflict-prone CSV in GCS, every `run` or `replay` automatically upserts into a shared Google Sheet (authenticating locally via service-account impersonation of `event-buddy-eval@...iam.gserviceaccount.com`, and natively via attached service account on Cloud Run).
   - **Why 6 normalized tabs instead of 1 giant sheet:**
     1. **`Run Summary`:** Compact 1-row-per-run executive dashboard sorted newest-first (`run_tag`, `preset`, `tier`, `sample_seed`, `sample_limit`, `latency_mean/p50/p90`, `avg_executed_web_queries`, `avg_cost_per_stack_usd`, `avg_composite_quality_score`, `fit`, `specificity`, `diversity`, `config_fingerprint`, `gcs_run_uri`).
     2. **`Presets`:** Deduplicated **1-row-per-unique-`config_fingerprint`** catalog tracking every distinct set of algorithm parameters ever tested, how many runs used it (`run_count`), associated `preset_names` and `run_tags`, `first_seen_utc` / `last_seen_utc`, and all 38 config fields side-by-side.
     3. **`Runs`:** Full run metadata + config columns + aggregate metrics.
     4. **`Cases`:** 1 row per `(run_tag, case_id)` with per-stage seconds, per-stage tokens, deterministic scores, and judge summaries.
     5. **`Events`:** 1 row per recommended event card across all runs, paired with its per-card judge scores (`activity_archetype`, `violates_hard_exclusion`, `fit`, `specificity`, `rationale`).
     6. **`Queries`:** 1 row per `planned` or `executed` web search query for auditing query expansion.
   - Also built `./scripts/rebuild-eval-sheet.sh` (`uv run buddy-eval rebuild-sheet`) to wipe all 6 tabs and deterministically reconstruct the entire Google Sheet from the GCS `runs/*.json` objects at any time.

3. **Pre-Flight Cost Estimator & Unattended Cloud Run Jobs (`event-buddy-eval`):**
   - Added `uv run buddy-eval estimate-cost` (and `--estimate-cost` flag on `run`) to compute expected executed queries, search grounding USD, LLM token USD, judge USD, free-tier USD, and wall-clock minutes **before** spending a cent.
   - Bundled `mvp`, `api`, and `evals` into the same multi-stage `Dockerfile` and created `./scripts/deploy-eval-job.sh` (deploys Cloud Run Job `event-buddy-eval` with `2 vCPU`, `2Gi` RAM, `3600s` timeout, Secret Manager `GEMINI_API_KEY`, and GCS/Sheets env vars) and `./scripts/run-eval-job.sh` (prints the pre-flight cost estimate locally, normalizes CLI flags with custom gcloud delimiter `^|^`, and triggers `gcloud run jobs execute --async` or `--wait`).
   - Verified end-to-end with a 2-case cloud dry run (`2026-11-08-cloudrun-dryrun-fastext`: `42.7s` mean, `$0.164`/stack) that wrote directly from Cloud Run into GCS and appeared live as a new row in the Google Sheet before launching the three 30-case benchmarks concurrently.

---

## 5. Chronological Narrative of All 4 Experiment Waves (Including Dead Ends & Surprises)

Over 4 days (Nov 5–8, 2026), we executed **34 tracked evaluation runs & replays** across 4 distinct waves. Every dead end taught us something critical about how reasoning + search-grounded LLMs behave.

---

### Wave 1: Parameter Sweeps Inside the Monolithic Architecture — Why Prompt Tuning Hit a Ceiling

#### Hypothesis 1A: Fewer, Broader "Multi-Yield Cluster" Queries (`fast-multi-yield`)
- **Idea:** Instead of 8–10 hyper-narrow needle-in-a-haystack queries, ask Stage 1 for **4 broad `OR`-cluster queries** (`2 Exploitation, 1 Adjacent, 1 Wildcard`, e.g., `"Oakland Berkeley (ceramics OR printmaking OR sewing OR woodworking) workshop class November 2026"`), disable `url_context` on Pass 1, and ask Stage 2 for compact notes instead of an essay.
- **First Surprise — The Model Ignored the Query Budget Until Prompt-Engineered:**
  - On our very first 2-case dry run (`dryrun-fast-multi-yield`), Stage 1 planned `4.0` queries, **but Gemini decomposed those `OR` queries into `8.5` institution-specific follow-up searches inside its tool loop**, taking `83.1s` (slower than baseline's `75.0s` dry run!).
  - Rather than slapping a `thinking_budget` cap on search right away, we added an explicit `search_execution_instructions` string to `DiscoveryConfig` instructing Gemini: *"Execute AT MOST {planned_query_count} Google Search tool calls total... Do NOT decompose them into institution-specific follow-up searches."*
  - Re-running the 2-case dry run (`dryrun-fast-multi-yield-v2`) dropped executed queries from `8.5` $\rightarrow$ **`4.0`**, cost to **`$0.091`**, latency to **`70.1s`**, and scored an astonishing **`99.0 / 100`** composite quality!
- **Second Surprise — Why 2-Case Dry Runs Are Operational Gates, NOT Quality Proof (`11–1` Blind A/B Loss!):**
  - Excited by `99.0/100` on 2 cases, we ran the full **12-case smoke suite** on both `baseline` (`2026-11-06-baseline-smoke`) and `fast-multi-yield` (`2026-11-06-fast-multi-yield-smoke`):
    - **Latency:** `100.6s` $\rightarrow$ `68.5s` (**-32%**)
    - **Executed Web Queries:** `9.8` $\rightarrow$ `3.3` (**-66%**)
    - **Marginal Cost:** `$0.182` $\rightarrow$ `$0.077`/stack (**-58%**)
    - **Composite Quality Score:** `96.4` $\rightarrow$ `92.3` (-4.1 pts)
    - **Blind Pairwise A/B Verdict:** **`fast-multi-yield` WON 1, LOST 11 (`8%` win rate)!**
  - **Why it lost 11–1:** Broad `OR` queries missed specific anchor studios in Section 5 of `preferences.md`, returned generic/placeholder venues, violated tight time/radius constraints, and dropped intra-batch diversity from `4.67` down to `4.17`. Meanwhile, looking only at the aggregate score (`92.3` vs `96.4`) would have hidden how badly users preferred baseline!

#### Hypothesis 1B: 6-Query Hybrid Strategy (`hybrid-6q-quality`) + Naive 2-Thread Bucket Parallelism (`parallel-hybrid-6q-quality`)
- **Idea:** Combine precision and breadth in 6 queries (`2` precise anchor-venue Exploitation + `1` constraint-bearing Exploitation + `1` precise Adjacent + `1` broad `OR` Adjacent + `1` Wildcard), then run `Exploitation` and `Adjacent + Wildcard` concurrently in **2 parallel threads** (`parallel_bucket_execution=True`).
- **What Happened (`dryrun-hybrid-6q-quality` vs. `dryrun-parallel-hybrid-6q-quality` on SF Weeknight + Portland Daytime):**
  - Sequential `hybrid-6q-quality` recovered quality (`97.3/100`, `5.0/5` diversity, `1–1` blind A/B split with baseline at `$0.109`/stack), **but stayed slow at `99.5s`** (`7%` faster than baseline's `106.8s` on those 2 cases), and prompt-only instructions still couldn't enforce exact query count (planned 6, executed 3 and 5).
  - Turning on 2-bucket parallelism (`dryrun-parallel-hybrid-6q-quality`) cut Stage 2 search by `17%` (`62.2s` $\rightarrow$ `51.5s`), **but Stage 3 extraction blew up from `28.1s` to `37.7s`**, net wall-clock latency improved by `<1%` (`99.5s` $\rightarrow$ `98.6s`), and **the San Francisco case collapsed to only 2 cards!**
- **Using Zero-Cost Stage 3 Replays to Diagnose the 2-Card Collapse (`replay-parallel-*`):**
  - Was Stage 3 being too strict, or was Stage 2 broken? We ran 5 zero-search-cost Stage 3 replays (`replay-parallel-control`, `replay-parallel-min5`, `replay-parallel-compact`, `replay-parallel-budget2048`, `replay-sequential-hybrid-budget2048`):
    - Even when instructed harder to return at least 5 cards (`replay-parallel-min5`), Stage 3 spent **79.1 seconds and 11,016 thinking tokens** on SF and *still* returned 2 cards!
    - Inspecting the saved `raw_synthesis` revealed the smoking gun: Thread 1 wrote a standalone prose essay claiming 11 SF events citing bare ungrounded domains (`https://roxie.com`, `https://citylights.com/events`) **absent from `grounding_chunks`**, while Thread 2 ran 4 searches and wrote: *"Based on the executed search queries... only two candidate events meet every concrete verification requirement."* Concatenating two independent prose essays with one URL list at the bottom handed Stage 3 a self-contradictory document!
    - Furthermore, capping Stage 3 `extract_thinking_budget=2048` on noisy prose (`replay-sequential-hybrid-budget2048`) cut Stage 3 from `28.1s` to `12.9s` but tanked SF quality to `88.7`.

---

### Wave 2: Architectural Breakthrough — 1-Worker-Per-Query Parallel Map-Reduce (E1–E5)

Stepping back on Day 2, we asked: *Are we sweeping parameters inside a fundamentally inefficient architecture?* Yes. Why run 1 monolithic call—or even 2 bucket calls where queries still queue behind each other—when Python can fire **1 dedicated worker per planned query simultaneously**?

We engineered five structural changes (`E1` through `E5`):
1. **E1 — `search_execution_mode = "parallel_per_query"`:** Flatten all $N$ planned queries into $N$ tasks and fire **all $N$ workers simultaneously** via `ThreadPoolExecutor(max_workers=len(query_tasks))`. Zero queries ever wait for another query to finish.
2. **E2 — Structured Per-Query Candidate Records + Inline Canonical Sources (`PER_QUERY_GROUNDING_PROMPT_TEMPLATE`):**
   - Forbid workers from writing global introductions, conclusions, or exclusion essays. Each worker outputs **only 1–4 terse, pipe-delimited candidate records** (`[Event Name] | [Exact Day, Date & Time] | [Venue & Address] | [Price] | [Bucket]`).
   - Drop any worker output whose response had zero `grounding_chunks` (`drop_ungrounded_worker_outputs=True`).
   - Resolve each worker's `grounding_chunks` immediately and attach `Verified Canonical Sources for Query k:` **inline directly underneath that worker's candidate block** (`attach_per_query_sources_inline=True`), eliminating cross-worker URL confusion.
3. **E3 — Single-Hop Parallel Redirect Resolution (`single_hop_redirects=True`):**
   - Deduplicate `raw_sources` *before* making HTTP requests, share one `httpx.Client(follow_redirects=False, timeout=2.5)`, send a single `HEAD` request to `vertexaisearch.cloud.google.com`, and read `resp.headers["location"]` directly without connecting to slow third-party venue servers.
   - Verified benchmark on 32 redirect URLs: **`4.54s` $\rightarrow$ `0.61s` (-86.7%)** (and `0.25s` inside GCP Cloud Run!).
4. **E4 — Progressive SSE Streaming (`cards_ready`):** Emit the full stack of cards to the browser the instant Stage 3 finishes (`0s` image wait on the critical path) while hydrating images asynchronously.
5. **E5 — Stage 1 Planner Thinking Cap (`plan_thinking_budget = 512`):** Cut Stage 1 latency from **`7.0s` $\rightarrow$ `4.3s` (-38.6%)** with zero loss in query specificity.

#### Two Crucial Bugs Caught & Fixed During Wave 2 Iteration
1. **The `"Output Only NONE"` Bailout Trap:**
   - Our first `PER_QUERY_GROUNDING_PROMPT_TEMPLATE` ended with: *"If zero qualifying events are found for this query, output only `NONE`."*
   - In `2026-11-07-parallel-per-query-baseline-smoke`, NYC budget quality crashed to `64.7` because **6 out of 9 parallel workers saw a narrow 10-word query string, ran 1 literal search, and took the easy escape hatch by outputting `NONE`!**
   - Removing the `NONE` escape hatch and replacing it with *"If the exact query phrase is too narrow to return scheduled events for the target dates, broaden the search query slightly (or check relevant local studio/collective calendars and recurring weekly/monthly open studios in {location}) so you surface 1 to {per_query_candidate_limit} real, source-backed candidate events"* eliminated the bailouts completely—NYC quality jumped from **`64.7` $\rightarrow$ `98.3`**!
2. **Missing Taste Profile Anchors Inside Parallel Workers:**
   - Originally, Stage 2 only received `plan_data.reframed_goal` (1 sentence), not `preferences.md`. When a parallel worker landed on a local roundup calendar, it didn't know which studios were the user's explicit Section 5 Positive Anchors or Section 6 Untried Hypotheses! Injecting profile context into each worker (`2026-11-07-parallel-per-query-baseline-v2-smoke`) pushed 12-case Smoke Composite Quality to **`97.8 / 100`** (`4.97/5.0` local specificity) and achieved a **`6W – 6L (50%–50%)` Blind A/B Tie** against baseline while cutting latency from **`100.6s` $\rightarrow$ `61.7s` (-39%)** (`131.8s` $\rightarrow$ `71.6s` p90)!

---

### Wave 3: Solving the Cost Spike & Card-Count Dip Without Losing Quality (C1–C3 + Stage 3 Isolation)

Looking closely at the two Wave 2 winners revealed a new business tradeoff:
- `parallel-per-query-baseline-v2-smoke` had phenomenal quality (`97.8`) and `7.2` cards/stack, **but** because its 8 parallel workers broadened narrow queries into 2 searches each, **executed web queries jumped to `17.6` per stack (`$0.338`/stack)**—nearly `$0.30+` per search, way too expensive for a `$5/mo` subscription!
- Meanwhile, `parallel-per-query-hybrid-6q-v3-smoke` was faster (`56.7s`) and cheaper (`12.4` queries), **but only averaged `5.58` cards per stack** instead of the `7–8` cards we wanted.

We ran three surgical experiments to get **both** `~$0.17` cost **and** `7+` cards/stack:

1. **Experiment C1 — Removing the Artificial `1-Event-Per-Query-Block` Ceiling (`replay-hybrid-6q-v3-7to8cards`):**
   - **Root cause found:** Our Stage 3 prompt contained a diversity rule saying *"Select at most 1 event per `### Query` block."* With 6 queries, `6 × 1 = 6` mathematically capped the stack at $\le 6$ cards!
   - Changing that rule to *"Select at most 1 event per venue and at most 1 event per narrow activity subtype"* (allowing 2 distinct events from a rich calendar roundup found by 1 query) via a `$0.00` Stage 3 replay immediately jumped average cards from **`5.58` $\rightarrow$ `7.17` cards/stack** and jumped Blind A/B vs. baseline from **`3W–9L` $\rightarrow$ `6W–6L (50%–50%)`!**
2. **Experiment C2 + C3 — Single-Search-Per-Worker + Compact Profile Digest (`parallel-per-query-lean-6q`):**
   - Added `single_search_per_worker = True` (instructing each of the 6 parallel workers to run **1 Google search** for its query—only running a 2nd if the 1st returned zero local results—and extract up to `per_query_candidate_limit = 4` candidates).
   - Added `extract_compact_profile_digest()` to pass only Sections 2, 3, 5, and 6 of `preferences.md` to workers (skipping the verbose Section 4 Markdown table and Section 7 history logs, saving ~400 input tokens per worker $\times$ 6 workers).
   - *(Side test that failed fast: `dryrun-parallel-per-query-lean-6q` tested `search_thinking_budget=1024`, which cut Stage 2 to `9.0s` but caused a worker with `0` thinking tokens to pull Monday/Wednesday events for a weekend prompt, bloating Stage 3 to `64.8s`. Keeping `search_thinking_budget=None` solved it immediately.)*
   - **12-Case Smoke Result (`2026-11-07-parallel-per-query-lean-6q-smoke`):**
     - **Mean Latency:** `100.6s` $\rightarrow$ **`55.2s` (-45.1%)**, p90 `131.8s` $\rightarrow$ **`64.2s` (-51.3%)**
     - **Executed Web Queries:** `9.8` $\rightarrow$ **`7.0` (-28.2% vs baseline, -60% vs v2's 17.6!)**
     - **Marginal Cost:** `$0.182` $\rightarrow$ **`$0.170`/stack**
     - **Composite Quality:** **`97.8 / 100`** with **`5.00 / 5.0` Intra-Batch Diversity (`99.0%` unique archetypes)**!
3. **Final Architecture Sweep — Stage 3 Duplicate-URL Fix & `extract_thinking_budget = 512` Isolation (`replay-lean-6q-dedup-*`):**
   - Before promoting to production, we audited the prompt boundary one last time and spotted a subtle redundancy: `execute_event_search` appended `### Grounded Source URLs` at the bottom of `raw_synthesis`, AND `build_structure_prompt` appended `Resolved Canonical Source URLs:` *again*—even when inline per-query sources were already attached!
   - Stripping both duplicate footer lists when inline sources are present (`replay-lean-6q-dedup-uncapped`) pushed 12-case Smoke Quality to **`98.08 / 100`** (`100.0%` unique archetypes across all 12 cases—the highest quality score of the entire project).
   - And unlike Wave 1 (where capping Stage 3 thinking on messy prose hurt quality), **capping `extract_thinking_budget = 512` on clean, pre-structured per-query candidate records (`replay-lean-6q-dedup-ext512`) worked cleanly**:
     - Stage 3 extraction dropped in half: `32.2s` $\rightarrow$ **`15.2s`** (`15.9s` at `ext=1024`).
     - Total 12-case mean latency dropped to **`44.4s` (`44.9s` p50, `49.8s` p90 — sub-50s p90!)** at **`$0.162`/stack**, **`7.0` cards/stack**, and **`96.3 / 100` quality** (matching baseline's `96.4`).

---

### Wave 4: The Final 30-Case Seeded Stratified Cloud Run Benchmark (`seed=42`)

Earlier smoke comparisons had a subtle temporal confounder: comparing a Saturday candidate run against Friday's saved `baseline-smoke` run caused unfair losses on `"tonight or tomorrow night"` prompts because Friday events were now in the past.

To make our production ship decision with high statistical rigor and zero day-of-week drift, we queued **all three contenders simultaneously on Sunday, Nov 8, 2026 via Google Cloud Run Jobs** on the **exact same 30 Latin-square stratified cases (`--tier full --limit 30 --seed 42 --workers 3`)**:
1. **`2026-11-08-baseline-30c-s42`** — Original monolithic `baseline` (`b0f3a599415f5bbf`)
2. **`2026-11-08-lean-6q-uncapped-30c-s42`** — `parallel-per-query-lean-6q` (Uncapped Stage 3)
3. **`2026-11-08-lean-6q-fastext-30c-s42`** — `parallel-per-query-lean-6q-fastext` (`extract_thinking_budget=512`, `19414f416e158235`)

#### Head-to-Head 30-Case Benchmark Results (Same Day, Same 30 Cases, 3 Cities × 10Personas × 10 Archetypes)

| Metric (30 Stratified Cases, `seed=42`) | Original `baseline` | `lean-6q` (Uncapped Stage 3) | **`lean-6q-fastext` (Shipped Default)** | Delta (`fastext` vs `baseline`) |
|---|---:|---:|---:|---:|
| **Cases Succeeded** | `30 / 30` | `30 / 30` | **`30 / 30`** | `0` failures |
| **Wall Latency Median (`p50`)** | `96.25s` | `60.55s` (-37.1%) | **`44.59s`** | **-53.7% (-51.7s faster)** |
| **Wall Latency Mean** | `96.93s` | `63.16s` (-34.8%) | **`45.81s`** | **-52.7% (-51.1s faster)** |
| **Wall Latency `p90`** | `108.08s` | `77.26s` (-28.5%) | **`53.00s`** | **-51.0% (-55.1s faster)** |
| **Stage 1: Planner Mean** | `7.64s` | `4.43s` | **`4.29s`** | **-43.8%** |
| **Stage 2: Grounded Search Mean** | `68.56s` | `26.89s` | **`26.10s`** | **-61.9%** |
| **Stage 2b: Redirect Resolution Mean** | `0.28s`* | `0.25s` | **`0.25s`** | *(down from `4.54s` pre-E3)* |
| **Stage 3: Card Extraction Mean** | `20.40s` | `31.54s` | **`15.11s`** | **-25.9%** (-52.1% vs uncapped) |
| **Avg Planned / Executed Web Queries** | `7.90 / 11.90` (`357` tot) | `6.00 / 6.90` (`207` tot) | **`6.00 / 7.43` (`223` tot)** | **-37.6% web queries** |
| **Marginal Cost / Stack (Paid Rate)** | `$0.2140` (`$6.43` run) | `$0.1770` (`$5.31` run) | **`$0.1720` (`$5.15` run)** | **-19.6% cost/stack** |
| **Avg Cards / Stack (In-Range `5–8` %)** | `7.53` (`100%`) | `6.87` (`100%`) | **`7.23` (`100%`)** | Full 7+ card stacks |
| **Citation Integrity Rate** | `99.5%` | `100.0%` | **`100.0%`** | **+0.5 pp** |
| **Temporal Validity / Zero Repeats** | `100.0% / 100.0%` | `100.0% / 100.0%` | **`100.0% / 100.0%`** | `100%` |
| **Discovery Bucket Coverage (All 3)** | `92.2%` | `100.0%` | **`100.0%`** | **+7.8 pp** |
| **Hard Exclusion Pass Rate** | `100.0%` | `100.0%` | **`99.1%`** (`214/216` cards) | -0.9 pp |
| **Experiential Mechanics Fit (`1–5`)** | `4.68` | `4.65` | **`4.61`** | -0.07 |
| **Local Specificity (`1–5`)** | `4.97` | `4.91` | **`4.90`** | -0.07 |
| **Intra-Batch Diversity (`1–5`)** | `4.40` (`89.5%` uniq) | `4.80` (`96.7%` uniq) | **`4.53` (`90.9%` uniq)** | **+0.13 (+1.4 pp uniq)** |
| **Exploration Leap Quality (`1–5`)** | `4.87` | `4.93` | **`4.83`** | -0.04 |
| **Composite Quality Score (`0–100`)** | `95.55` | `96.96` (+1.41) | **`95.14`** | -0.41 (statistically flat) |
| **Blind Pairwise A/B vs. `baseline`** | — | **Won `16 – 14` (`53%`)** | **Tied `15 – 15` (`50%`)** | **Exact parity in blind A/B** |
| **Blind Pairwise A/B: `fastext` vs `uncapped`** | — | **Tied `15 – 15` (`50%`)** | **Tied `15 – 15` (`50%`)** | **Exact parity in blind A/B** |

*\*Note: `baseline` preset in `evals/presets.py` inherited `single_hop_redirects=True` during the cloud run; pre-optimization redirect resolution in `2026-11-06-baseline-smoke` averaged `4.54s` (making the true end-to-end latency reduction from original app behavior `~101–108s` $\rightarrow$ `~45s`).*

#### Why `parallel-per-query-lean-6q-fastext` Won the Production Default
- Across 30 diverse cases (216 total event cards), a blind pairwise judge preferred `lean-6q-fastext` **literally 50.0% of the time (`15–15`)** against both the `96.9s` original baseline and the `63.2s` uncapped variant.
- It cut median search wait time by **more than half (`96.2s` $\rightarrow$ `44.6s`)**, improved `p90` tail latency from **`108.1s` (or `131.8s` pre-redirect fix) down to `53.0s`**, increased discovery bucket coverage (`92.2%` $\rightarrow$ `100.0%`) and intra-batch diversity (`4.40` $\rightarrow$ `4.53`), maintained `7.23` cards per stack, and cut web search queries by **38% (`11.9` $\rightarrow$ `7.43`)**.

---

### Complete Chronological Ledger of All 34 Tracked Runs & Replays

| # | Timestamp (UTC) | Run Tag | Preset | Cases | Mean `s` | `p50 s` | `p90 s` | Plan / Search / Redir / Ext (`s`) | Plan / Exec Queries | Cost / Stack | Avg Cards | Quality (`0–100`) | Diversity (`1–5`) |
|---:|---|---|---|---:|---:|---:|---:|---|---:|---:|---:|---:|---:|
| 1 | `11-07 06:40` | `dryrun-baseline` | `baseline` | 2 | 75.0 | 75.0 | 87.0 | `8.0 / 40.2 / 4.4 / 22.3` | `8.0 / 7.0` | `$0.132` | 7.50 | 90.2 | 4.00 |
| 2 | `11-07 06:42` | `dryrun-fast-multi-yield` | `fast-multi-yield` | 2 | 83.1 | 83.1 | 91.1 | `5.0 / 56.1 / 6.3 / 15.6` | `4.0 / 8.5` | `$0.156` | 7.00 | 96.7 | 4.50 |
| 3 | `11-07 06:55` | `dryrun-fast-multi-yield-v2` | `fast-multi-yield` | 2 | 70.1 | 70.1 | 76.6 | `10.1 / 34.9 / 3.2 / 21.9` | `4.0 / 4.0` | `$0.091` | 7.00 | 99.0 | 5.00 |
| 4 | `11-07 07:53` | `2026-11-06-fast-multi-yield-smoke` | `fast-multi-yield` | 12 | 68.5 | 64.0 | 71.1 | `8.7 / 35.2 / 2.4 / 22.0` | `4.0 / 3.3` | `$0.077` | 6.83 | 92.3 | 4.17 |
| 5 | `11-07 07:56` | `2026-11-06-baseline-smoke` | `baseline` | 12 | 100.6 | 95.3 | 131.8 | `7.0 / 66.7 / 4.5 / 22.3` | `8.7 / 9.8` | `$0.182` | 7.58 | 96.4 | 4.67 |
| 6 | `11-07 08:10` | `dryrun-hybrid-6q-quality` | `hybrid-6q-quality` | 2 | 99.5 | 99.5 | 103.7 | `6.7 / 62.2 / 2.4 / 28.1` | `6.0 / 4.0` | `$0.109` | 6.00 | 97.3 | 5.00 |
| 7 | `11-07 08:15` | `dryrun-parallel-hybrid-6q-quality` | `parallel-hybrid-6q-quality` | 2 | 98.6 | 98.6 | 103.3 | `6.2 / 51.5 / 3.2 / 37.7` | `6.0 / 5.0` | `$0.142` | 4.50 | 95.5 | 4.50 |
| 8 | `11-07 08:21` | `replay-parallel-control` | `parallel-hybrid-6q-quality` | 2 | 93.5 | 93.5 | 97.4 | `6.2 / 51.5 / 3.2 / 32.6` | `6.0 / 5.0` | `$0.142` | 4.50 | 94.9 | 4.50 |
| 9 | `11-07 08:24` | `replay-parallel-min5` | `parallel-hybrid-extract-min5` | 2 | 114.9 | 114.9 | 134.0 | `6.2 / 51.5 / 3.2 / 54.0` | `6.0 / 5.0` | `$0.142` | 4.50 | 94.9 | 4.50 |
| 10 | `11-07 08:25` | `replay-parallel-compact` | `parallel-hybrid-extract-compact` | 2 | 90.9 | 90.9 | 91.2 | `6.2 / 51.5 / 3.2 / 30.0` | `6.0 / 5.0` | `$0.142` | 4.00 | 92.9 | 4.00 |
| 11 | `11-07 08:26` | `replay-parallel-budget2048` | `parallel-hybrid-extract-budget` | 2 | 72.0 | 72.0 | 76.9 | `6.2 / 51.5 / 3.2 / 11.1` | `6.0 / 5.0` | `$0.142` | 4.50 | 92.3 | 4.00 |
| 12 | `11-07 08:28` | `replay-sequential-hybrid-budget2048` | `parallel-hybrid-extract-budget` | 2 | 84.2 | 84.2 | 89.2 | `6.7 / 62.2 / 2.4 / 12.9` | `6.0 / 4.0` | `$0.109` | 6.00 | 93.7 | 4.50 |
| 13 | `11-07 22:16` | `dryrun-parallel-per-query-hybrid-6q` | `parallel-per-query-hybrid-6q` | 2 | 64.4 | 64.4 | 77.2 | `8.3 / 36.3 / 0.7 / 19.0` | `6.0 / 13.5` | `$0.251` | 7.00 | 94.6 | 4.50 |
| 14 | `11-07 22:18` | `dryrun-parallel-per-query-hybrid-6q-fastplan` | `parallel-per-query-hybrid-6q-fastplan` | 2 | 85.0 | 85.0 | 104.1 | `4.2 / 52.1 / 0.6 / 28.0` | `6.0 / 5.0` | `$0.156` | 5.50 | 90.7 | 4.00 |
| 15 | `11-07 22:22` | `dryrun-parallel-per-query-hybrid-6q-v2` | `parallel-per-query-hybrid-6q-fastplan` | 2 | 42.3 | 42.3 | 43.1 | `4.5 / 16.4 / 0.6 / 20.7` | `6.0 / 8.0` | `$0.162` | 6.00 | 94.7 | 4.50 |
| 16 | `11-07 22:28` | `2026-11-07-parallel-per-query-hybrid-6q-smoke` | `parallel-per-query-hybrid-6q-fastplan` | 12 | 48.5 | 49.3 | 57.3 | `4.4 / 19.7 / 0.6 / 23.7` | `6.0 / 6.3` | `$0.142` | 5.83 | 93.3 | 4.42 |
| 17 | `11-07 22:36` | `2026-11-07-parallel-per-query-baseline-smoke` | `parallel-per-query-baseline` | 12 | 50.2 | 48.9 | 56.3 | `7.1 / 20.1 / 0.6 / 22.3` | `8.7 / 9.5` | `$0.203` | 6.58 | 90.5 | 3.92 |
| 18 | `11-07 22:40` | `dryrun-parallel-per-query-no-none-bailout` | `parallel-per-query-baseline` | 2 | 54.6 | 54.6 | 56.5 | `6.1 / 28.3 / 0.7 / 19.5` | `7.0 / 12.5` | `$0.259` | 7.00 | 90.3 | 3.50 |
| 19 | `11-07 22:42` | `replay-per-query-strict-diversity` | `parallel-per-query-baseline` | 2 | 62.4 | 62.4 | 63.1 | `6.1 / 28.3 / 0.7 / 27.3` | `7.0 / 12.5` | `$0.264` | 6.50 | 94.4 | 4.50 |
| 20 | `11-07 22:49` | `2026-11-07-parallel-per-query-hybrid-6q-v3-smoke` | `parallel-per-query-hybrid-6q-fastplan` | 12 | 56.7 | 56.4 | 66.9 | `4.3 / 24.1 / 0.6 / 27.7` | `6.0 / 12.4` | `$0.245` | 5.58 | 97.5 | 5.00 |
| 21 | `11-07 23:00` | `2026-11-07-parallel-per-query-baseline-v2-smoke` | `parallel-per-query-baseline` | 12 | 61.7 | 62.0 | 71.6 | `6.8 / 24.3 / 0.6 / 29.9` | `8.0 / 17.6` | `$0.338` | 7.17 | 97.8 | 4.92 |
| 22 | `11-07 23:48` | `replay-hybrid-6q-v3-7to8cards` | `parallel-per-query-hybrid-6q-fastplan` | 12 | 59.4 | 59.2 | 64.7 | `4.3 / 24.1 / 0.6 / 30.4` | `6.0 / 12.4` | `$0.246` | 7.17 | 96.4 | 4.83 |
| 23 | `11-07 23:53` | `dryrun-parallel-per-query-lean-6q` | `parallel-per-query-lean-6q` | 2 | 78.6 | 78.6 | 99.7 | `4.0 / 9.0 / 0.7 / 64.8` | `6.0 / 7.0` | `$0.155` | 7.50 | 93.8 | 4.50 |
| 24 | `11-07 23:55` | `replay-lean-6q-ext4096` | `parallel-per-query-lean-6q` | 2 | 56.7 | 56.7 | 60.5 | `4.0 / 9.0 / 0.7 / 43.0` | `6.0 / 7.0` | `$0.143` | 6.00 | 98.2 | 5.00 |
| 25 | `11-07 23:58` | `dryrun-parallel-per-query-lean-5q-uncapped` | `parallel-per-query-lean-6q` | 2 | 67.0 | 67.0 | 80.0 | `4.9 / 27.0 / 0.7 / 34.3` | `5.0 / 13.0` | `$0.254` | 7.00 | 96.3 | 4.50 |
| 26 | `11-08 00:00` | `dryrun-parallel-per-query-lean-6q-v2` | `parallel-per-query-lean-6q` | 2 | 54.5 | 54.5 | 61.5 | `4.9 / 22.0 / 0.6 / 27.0` | `6.0 / 7.0` | `$0.168` | 7.00 | 97.6 | 5.00 |
| 27 | `11-08 00:16` | `2026-11-07-parallel-per-query-lean-6q-smoke` | `parallel-per-query-lean-6q` | 12 | 55.2 | 54.1 | 64.3 | `4.5 / 24.0 / 0.7 / 26.0` | `6.0 / 7.0` | `$0.170` | 6.83 | 97.8 | 5.00 |
| 28 | `11-08 02:27` | `replay-lean-6q-dedup-ext512` | `parallel-per-query-lean-6q-fastext` | 12 | 44.4 | 44.9 | 49.8 | `4.5 / 24.0 / 0.7 / 15.2` | `6.0 / 7.0` | `$0.162` | 7.00 | 96.3 | 4.58 |
| 29 | `11-08 02:37` | `replay-lean-6q-dedup-ext1024` | `parallel-per-query-lean-6q-ext1024` | 12 | 45.1 | 46.1 | 50.5 | `4.5 / 24.0 / 0.7 / 15.9` | `6.0 / 7.0` | `$0.163` | 7.42 | 95.7 | 4.50 |
| 30 | `11-08 02:40` | `replay-lean-6q-dedup-uncapped` | `parallel-per-query-lean-6q` | 12 | 61.3 | 63.2 | 69.1 | `4.5 / 24.0 / 0.7 / 32.2` | `6.0 / 7.0` | `$0.173` | 6.83 | **98.1** | **5.00** |
| 31 | `11-08 18:23` | `2026-11-08-cloudrun-dryrun-fastext` | `parallel-per-query-lean-6q-fastext` | 2 | 42.7 | 42.7 | 43.1 | `4.9 / 21.5 / 0.3 / 15.9` | `6.0 / 7.0` | `$0.164` | 7.50 | 92.3 | 4.00 |
| 32 | `11-08 19:03` | **`2026-11-08-lean-6q-fastext-30c-s42`** | **`parallel-per-query-lean-6q-fastext`** | **30** | **45.8** | **44.6** | **53.0** | **`4.3 / 26.1 / 0.3 / 15.1`** | **`6.0 / 7.4`** | **`$0.172`** | **7.23** | **95.1** | **4.53** |
| 33 | `11-08 19:06` | **`2026-11-08-lean-6q-uncapped-30c-s42`** | **`parallel-per-query-lean-6q`** | **30** | **63.2** | **60.6** | **77.3** | **`4.4 / 26.9 / 0.3 / 31.5`** | **`6.0 / 6.9`** | **`$0.177`** | **6.87** | **97.0** | **4.80** |
| 34 | `11-08 19:12` | **`2026-11-08-baseline-30c-s42`** | **`baseline`** | **30** | **96.9** | **96.3** | **108.1** | **`7.6 / 68.6 / 0.3 / 20.4`** | **`7.9 / 11.9`** | **`$0.214`** | **7.53** | **95.6** | **4.40** |

---

## 6. Deep Dive: The Winning Production Architecture & Key Code Snippets

### New End-to-End Flow (`~44.6s` p50 to `cards_ready` SSE + Instant Per-Card Image Streaming)

```text
Shipped Parallel Per-Query Map-Reduce Architecture (`lean-6q-fastext`)
======================================================================
[Stage 1: Hybrid 6-Query Planner] (~4.3s, plan_thinking_budget=512)
  └─> Emits exactly 6 queries:
      • 3 Exploitation (2 anchor-venue specific + 1 constraint-bearing)
      • 2 Adjacent (1 neighboring-interest specific + 1 multi-yield OR cluster)
      • 1 Wildcard (defensible lateral leap preserving social mechanics)
          │
          ├───┬───┬───┬───┬───┐  (ThreadPoolExecutor(max_workers=6) — ALL 6 fire at t=0)
          ▼   ▼   ▼   ▼   ▼   ▼
[Stage 2: 6 Simultaneous Single-Query Grounded Workers] (~24–26s wall time total)
  ├─> Each worker receives Compact Profile Digest (Sections 2, 3, 5, 6 only)
  ├─> Strict single-search budget (1 Google Search call unless 0 local hits)
  ├─> Outputs ONLY 1–4 terse pipe-delimited candidate records (zero essay fluff)
  ├─> Drops any worker output with 0 grounding_chunks
  └─> Resolves vertexaisearch 302s via single-hop HEAD (~0.25s) & attaches
      "Verified Canonical Sources for Query k" INLINE right below its candidates
          │
          ▼
[Stage 3: Deduplicated Curation & JSON Extraction] (~15.1s, extract_thinking_budget=512)
  ├─> Strips duplicate footer URL lists so inline sources are clean & unambiguous
  ├─> Enforces 1 event/venue, 1 event/narrow activity subtype, and all 3 buckets
  └─> Emits 7–8 verified StructuredDiscoveryOutput cards
          │
          ├──> IMMEDIATELY emits SSE `cards_ready` to browser! (User starts reading Card #1)
          ▼
[Stage 4: Per-Card Async Image Hydration + Browser Preloading] (0s blocking wait)
  ├─> Card #1 image fetched with top priority, rest in parallel via as_completed()
  ├─> Multi-strategy scraper: Chrome UA -> WhatsApp/2.23.20.0 bot retry on 403 ->
  │   title-matched outbound ticket link (19hz/Luma/RA) -> Microlink API fallback
  ├─> Streams individual SSE `card_image` events as each flyer resolves
  └─> SvelteKit preloads current card + next 2 cards + remaining stack into browser cache
```

### Key Code Snippet 1: Parallel Per-Query Map-Reduce Execution (`mvp/search.py`)

```python
if exec_mode == "parallel_per_query" and query_tasks:
    # Spawn 1 dedicated worker per query, launching ALL queries simultaneously in a single parallel batch
    def _exec_single_query(task: tuple[int, str, str]) -> dict[str, Any]:
        q_idx, b_label, q_text = task
        sub_prompt = _build_per_query_grounding_prompt(
            current_date_str=current_date_str,
            current_year=now.year,
            location=location,
            date_window=date_window,
            search_goal=search_goal,
            exclusions=exclusions,
            seen_events=seen_events,
            bucket_label=b_label,
            query_text=q_text,
            cfg=cfg,
        )
        resp = _run_single_grounded_call(client=client, model=model, prompt=sub_prompt, cfg=cfg)
        in_t, out_t, th_t = extract_token_usage(resp)
        wq, rc, uc = _extract_grounding_info(resp)

        worker_sources: list[GroundingSource] = []
        if rc and cfg.attach_per_query_sources_inline:
            worker_sources = resolve_sources_parallel(
                rc,
                timeout=cfg.redirect_timeout_sec,
                max_sources=cfg.max_sources_to_resolve,
                single_hop=cfg.single_hop_redirects,
            )
        return {
            "idx": q_idx,
            "bucket": b_label,
            "query": q_text,
            "in_toks": in_t,
            "out_toks": out_t,
            "think_toks": th_t,
            "web_queries": wq or ([q_text] if rc else []),
            "raw_chunks": rc,
            "worker_sources": worker_sources,
            "text": (resp.text or "").strip(),
        }

    with ThreadPoolExecutor(max_workers=len(query_tasks)) as pool:
        worker_results = list(pool.map(_exec_single_query, query_tasks))

    for item in worker_results:
        w_text = item["text"]
        if not w_text or w_text.upper() == "NONE":
            continue
        if cfg.drop_ungrounded_worker_outputs and not item["raw_chunks"]:
            continue

        src_lines = "\n".join(f"- [{s.title}]({s.resolved_uri})" for s in item["worker_sources"])
        block = (
            f"### Query {item['idx']} [{item['bucket']}]: {item['query']}\n"
            f"{w_text}\n\n"
            f"Verified Canonical Sources for Query {item['idx']}:\n{src_lines}"
        )
        synthesis_parts.append(block)
```

### Key Code Snippet 2: Single-Hop Google Grounding Redirect Resolver (`4.5s` $\rightarrow$ `0.25s`)

```python
def resolve_redirect_url(uri: str, timeout: float = 2.5, single_hop: bool = True) -> str:
    if "vertexaisearch.cloud.google.com/grounding-api-redirect" not in (uri or ""):
        return uri
    if single_hop:
        # Stop at Google's edge 302 Location header instead of opening TLS connections to 35 slow venue sites!
        with httpx.Client(follow_redirects=False, timeout=timeout) as hop_client:
            resp = hop_client.head(uri)
            loc = resp.headers.get("location", "").strip()
            if loc.startswith("http"):
                return loc
    return uri
```

### Key Code Snippet 3: Compact Profile Digest for Workers (Saving Tokens While Keeping Anchors)

```python
def extract_compact_profile_digest(preferences_markdown: str) -> str:
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
    return "\n".join(kept_lines).strip() or preferences_markdown.strip()
```

---

## 7. Post-Benchmark Real-World UX Catch: Fixing Missing Card Images & Next-Card Preloading

When we promoted `parallel-per-query-lean-6q-fastext` to the local app default and tested a real Oakland underground music search locally (`49.84s` end-to-end), speed and event quality felt great—**except only 3 out of 8 cards displayed event flyer images, and images on later cards loaded late when flipping through the stack.**

Inspecting that exact 8-card local batch revealed three distinct bugs across backend scraping, SSE delivery, and browser DOM mounting:

### 1. Why 5 of 8 Venue/Listing Pages Returned Blank Images (And How We Reached `8/8` Resolution)
- **Cloudflare / Anti-Bot `403`s on Event Sites (`ra.co`):** Resident Advisor (`ra.co/events/...`) blocked standard Chrome `User-Agent` headers with `403 Forbidden`—**but returned `200 OK` with full OpenGraph flyer metadata when retried with link-preview bot headers (`User-Agent: WhatsApp/2.23.20.0`)!**
- **Text-Only Aggregator Tables (`19hz.info`) & Minimal Venue Shells (`tiat.place`):** Two cards cited `19hz.info/eventlisting_BayArea.php` (a bare HTML table with zero images on the listing page itself, plus our old `fetch_event_images_parallel` keyed its dict by `source_url`, making it impossible for two cards sharing an aggregator URL to get distinct images!). And `tiat.place` was a minimal page embedding `https://luma.com/tiat`.
  - **Fix:** Added `_extract_outbound_event_url(html_text, title_hint=cand.title)` to locate the `<tr>`/`<li>` row matching the card's title (or embedded Luma/RA/Eventbrite/Dice/Partiful/TicketWeb links) and hop one step to fetch the real event flyer—resolving each candidate individually with its own `title_hint`.
- **Hard Cloudflare Challenges (`crybaby.live`):** Direct HTTP and WhatsApp UA both got `403`, so we added `_fetch_microlink_fallback_image()` (`https://api.microlink.io?url=...` on `401/403/429/503`), which cleanly pulled the exact TicketWeb flyer (`https://i.ticketweb.com/...jpg`).
- **Result on that exact local batch:** Image resolution jumped from **`3/8` (`37.5%`) $\rightarrow$ `8/8` (`100%`)** (7 exact event/venue flyers + 1 generic Eventbrite logo that our frontend aspect/logo detector gracefully styles over the Risograph artwork fallback).

### 2. Per-Card SSE Streaming (`card_image`) Instead of Waiting for the Slowest Scrape
Previously, after emitting `cards_ready`, the backend waited for *all 8* image scrapes to finish before emitting `complete`. We switched to `ThreadPoolExecutor` + `as_completed` (prioritizing Card #1 first), committing each image and streaming an individual `event: card_image` (`{candidate_id, image_url}`) over SSE the millisecond each flyer resolves.

### 3. Next-Card Browser Image Preloading + Eager Banner Priority
In SvelteKit (`DiscoverBoard.svelte` & `EventVisual.svelte`):
- Only `currentEvent` is mounted in the DOM, and `<img loading="lazy">` meant Cards #2–#8 never even started downloading bytes until the user clicked **Next Card**.
- We changed the active card banner to `loading="eager"` + `fetchpriority="high"`, and added a reactive `$effect` preloader in `DiscoverBoard.svelte` that warms `new Image()` (`referrerPolicy = 'no-referrer'`) in priority order: **current card + next 2 cards first, then the rest of the stack** (plus immediately preloading any incoming `card_image` SSE URL). Flipping to the next card is now instantaneous.

---

## 8. Production Deployment Setup (Cloud Build + Cloud Run + Active-User Guardrails)

After verifying the full pipeline and image streaming locally (`30 passed` pytest suite + `0 errors` in `svelte-check`), we deployed to production on Google Cloud (`us-central1`):

- **Single Multi-Stage Container (`Dockerfile`):**
  - Stage 1 (`node:22-alpine`): Compiles the SvelteKit static SPA (`npm ci && npm run build`).
  - Stage 2 (`python:3.12-slim` + `uv:0.6.3`): Installs locked Python dependencies (`uv sync --frozen --no-dev`) and bundles `api/`, `mvp/`, `evals/`, and static `web/build/` under non-root user `appuser`.
  - This **single container image** powers all three cloud workloads:
    1. **`event-buddy` Cloud Run Service:** Serves FastAPI + static SPA (`uvicorn api.app.main:app`, `timeout=300s`, Secret Manager bindings for `DATABASE_URL`, `SESSION_SECRET`, `GEMINI_API_KEY`, Telegram alerts, and Resend email).
    2. **`event-buddy-migrate` Cloud Run Job:** Runs `alembic upgrade head` using a dedicated migrator service account before traffic cutover.
    3. **`event-buddy-eval` Cloud Run Job:** Runs `buddy-eval` benchmarks asynchronously in the cloud using its own `event-buddy-eval` service account, writing artifacts to GCS and metrics to Google Sheets.
- **Zero-Disruption Deployment Script (`./scripts/deploy.sh` / `make deploy-fast`):**
  - Validates all required GCP Secret Manager secrets have `ENABLED` versions.
  - Runs `./scripts/check-active-users.sh` **twice** (pre-build and pre-cutover) so we don't sever an active user's in-flight SSE search stream during traffic migration.
  - Builds immutable tagged image `<timestamp>-<git-sha>` via Cloud Build, deploys the new Cloud Run revision, and polls `/api/health` and `/api/ready` (verifying live Postgres connectivity) before declaring success (`2m 53s` total deploy time).

---

## 9. Distilled Takeaways & Story Arcs for the Blog Post

1. **"Don't Touch Prompts Until You Build the Yardstick":** Refactoring the app into `execute_discovery_pipeline(preferences_md, prompt, DiscoveryConfig)` meant zero drift between eval and production, and tracking stage-level tokens + timings exposed bottlenecks we never would have guessed.
2. **2-Case "Vibe Checks" Lie; Blind Pairwise A/B Tells the Truth:** Our first 4-query experiment (`fast-multi-yield`) scored `99.0/100` on a 2-case dry run and `92.3/100` on 12 cases—numbers that looked totally fine on a dashboard—yet **lost `11 to 1` in blind side-by-side judging** against baseline because broad `OR` queries lost hyper-local venue anchors.
3. **Snapshot Replay (`$0` Search Cost) Turns Debugging Into Science:** Saving `raw_synthesis` + `sources` let us run 12-case Stage 3 experiments in 30 seconds for `$0` in search fees—proving immediately that naive 2-bucket parallelism failed because of contradictory prose synthesis, not overly strict JSON extraction, and later uncovering the `1-event-per-query-block` rule that was artificially capping stacks at 5.6 cards.
4. **Architecture Beat Parameter Tuning (Monolithic Essay Relay $\rightarrow$ 1-Worker-Per-Query Map-Reduce):** Prompt-tuning query counts inside one monolithic LLM call hit a hard wall (`~68–99s`). Spawning **1 parallel worker per query** with **single-search budgets**, **compact profile digests**, **inline canonical URLs**, and **single-hop `302` redirect resolution** unlocked **both** specific local search depth and `~25s` search speed—and made Stage 3 clean enough that `extract_thinking_budget=512` shaved another `16s` with zero blind A/B loss.
5. **Mind the Prompt Escape Hatches (`"Output Only NONE"`):** Giving parallel search workers an easy `"output NONE"` bailout caused 6 of 9 workers in NYC to give up on narrow queries (`64.7` quality). Instructing them to broaden slightly to local studio calendars on a zero-hit query jumped NYC quality to `98.3`.
6. **Control Live-Web Temporal Confounders with Simultaneous Seeded Stratified Runs:** Running all contenders at the exact same hour on Cloud Run Jobs using a **seeded Latin-square 30-case sample (`seed=42`)** eliminated Friday-vs-Saturday event inventory drift and proved exact `15–15` quality parity at **53% lower latency (`96.9s` $\rightarrow$ `45.8s`)** and **20% lower cost (`$0.214` $\rightarrow$ `$0.172`)**.
7. **Perceived Speed Doesn't Stop at the LLM:** Streaming `cards_ready` before image scraping, bypassing Cloudflare `403`s with link-preview bot fallbacks + outbound aggregator link hopping (`3/8` $\rightarrow$ `8/8` images), streaming per-card `card_image` SSE updates, and preloading the next 2 cards in the browser made flipping through the stack feel instant.



