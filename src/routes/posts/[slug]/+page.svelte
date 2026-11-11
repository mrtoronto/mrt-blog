<script lang="ts">
	import { base } from '$app/paths';
	import { siteMeta } from '$lib/data/content';
	import { formatInline, highlightCode } from '$lib/utils/format';

	let { data } = $props();
	const post = $derived(data.post);
	const jumpSections = $derived(
		post.sections.filter((section) => section.heading && section.id)
	);
</script>

<svelte:head>
	<title>{post.title} | {siteMeta.author}</title>
	<meta name="description" content={post.summary} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content="{post.title} | {siteMeta.author}" />
	<meta property="og:description" content={post.summary} />
	<meta property="og:url" content="{siteMeta.siteUrl}/posts/{post.slug}/" />
	<meta property="og:image" content={siteMeta.ogImage} />
	<meta name="twitter:title" content="{post.title} | {siteMeta.author}" />
	<meta name="twitter:description" content={post.summary} />
	<meta name="twitter:image" content={siteMeta.ogImage} />
</svelte:head>

<article class="container article">
	<a href="{base}/" class="back-link">← Back to all projects &amp; posts</a>

	<header class="article-header">
		<div class="article-meta">
			<time datetime={post.date}>{post.date}</time>
			<span>&bull;</span>
			<span>{post.readingTime}</span>
		</div>

		<h1>{post.title}</h1>

		<p class="article-summary">{post.summary}</p>

		<div class="header-footer">
			<div class="tags">
				{#each post.tags as tag}
					<span class="tag">{tag}</span>
				{/each}
			</div>

			{#if post.repoUrl && post.repoName}
				<a
					href={post.repoUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="repo-callout"
				>
					<span>Project Repository:</span>
					<strong>{post.repoName} ↗</strong>
				</a>
			{:else if post.liveUrl && post.liveLabel}
				<a
					href={post.liveUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="repo-callout"
				>
					<span>Live App:</span>
					<strong>{post.liveLabel} ↗</strong>
				</a>
			{/if}
		</div>
	</header>

	{#if post.overview}
		<aside class="overview-card" aria-label={post.overview.label}>
			<div class="overview-header">
				<span class="overview-badge">{post.overview.label}</span>
			</div>

			<ul class="overview-bullets">
				{#each post.overview.bullets as bullet}
					<li>{@html formatInline(bullet)}</li>
				{/each}
			</ul>

			{#if jumpSections.length > 0}
				<details class="overview-toc">
					<summary>
						<span>Section Breakdown &amp; Jump Links ({jumpSections.length})</span>
					</summary>
					<ol class="toc-list">
						{#each jumpSections as sec}
							<li>
								<a href="#{sec.id}" class="toc-link">{sec.heading}</a>
								{#if sec.summary}
									<p class="toc-summary">{sec.summary}</p>
								{/if}
							</li>
						{/each}
					</ol>
				</details>
			{/if}
		</aside>
	{/if}

	<div class="article-body">
		{#each post.sections as section}
			<section class="article-section" id={section.id}>
				{#if section.heading}
					<h2>{section.heading}</h2>
				{/if}

				{#each section.paragraphs as paragraph}
					<p>{@html formatInline(paragraph)}</p>
				{/each}

				{#if section.bullets}
					<ul>
						{#each section.bullets as bullet}
							<li>{@html formatInline(bullet)}</li>
						{/each}
					</ul>
				{/if}

				{#if section.code}
					<div class="code-block">
						{#if section.code.filename}
							<div class="code-header">
								<span>{section.code.filename}</span>
								<span class="code-lang">{section.code.language}</span>
							</div>
						{/if}
						<pre class="code-pre"><code>{@html highlightCode(section.code.snippet, section.code.language)}</code></pre>
					</div>
				{/if}

				{#if section.deepDive}
					<details class="deep-dive">
						<summary>{section.deepDive.title}</summary>
						<div class="deep-dive-body">
							{#each section.deepDive.paragraphs as ddParagraph}
								<p>{@html formatInline(ddParagraph)}</p>
							{/each}

							{#if section.deepDive.bullets}
								<ul>
									{#each section.deepDive.bullets as ddBullet}
										<li>{@html formatInline(ddBullet)}</li>
									{/each}
								</ul>
							{/if}

							{#if section.deepDive.code}
								<div class="code-block">
									{#if section.deepDive.code.filename}
										<div class="code-header">
											<span>{section.deepDive.code.filename}</span>
											<span class="code-lang">{section.deepDive.code.language}</span>
										</div>
									{/if}
									<pre class="code-pre"><code>{@html highlightCode(section.deepDive.code.snippet, section.deepDive.code.language)}</code></pre>
								</div>
							{/if}
						</div>
					</details>
				{/if}
			</section>
		{/each}
	</div>

	{#if post.team}
		<footer class="team-footer" aria-label="Project Team">
			<div class="team-label">Project Team &amp; Colophon</div>
			<p class="team-note">
				Any references to "we" in this write-up refer to the human + AI pair that built the project:
			</p>
			<dl class="team-grid">
				<div class="team-item">
					<dt>Human</dt>
					<dd>{post.team.human}</dd>
				</div>
				<div class="team-item">
					<dt>AI Collaborator</dt>
					<dd>{post.team.aiCollaborator || 'AI Coding Agent'}</dd>
				</div>
				{#if post.team.harness}
					<div class="team-item">
						<dt>Harness</dt>
						<dd>{post.team.harness}</dd>
					</div>
				{/if}
			</dl>
		</footer>
	{/if}
</article>

<style>
	.article {
		min-width: 0;
	}

	.back-link {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.82rem;
		color: var(--text-muted);
		margin-bottom: 2rem;
	}

	.back-link:hover {
		color: var(--accent);
	}

	.article-header {
		padding-bottom: 2rem;
		margin-bottom: 2rem;
		border-bottom: 1px solid var(--border);
	}

	.article-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text-subtle);
		margin-bottom: 0.85rem;
	}

	h1 {
		font-size: clamp(1.6rem, 4.5vw, 2.4rem);
		line-height: 1.2;
		letter-spacing: -0.025em;
		margin-bottom: 1rem;
		overflow-wrap: break-word;
	}

	.article-summary {
		font-size: 1.1rem;
		color: var(--text-muted);
		margin-bottom: 1.5rem;
		overflow-wrap: break-word;
	}

	.header-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.repo-callout {
		display: inline-flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.45rem;
		max-width: 100%;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		padding: 0.4rem 0.75rem;
		border-radius: 8px;
		background: var(--accent-soft);
		border: 1px solid var(--accent-border);
		color: var(--text);
	}

	.repo-callout strong {
		color: var(--accent);
		overflow-wrap: anywhere;
	}

	/* Top-of-Post Overview Card */
	.overview-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-left: 3px solid var(--accent);
		border-radius: 10px;
		padding: 1.25rem 1.35rem;
		margin-bottom: 2.5rem;
		min-width: 0;
	}

	.overview-header {
		margin-bottom: 0.75rem;
	}

	.overview-badge {
		font-family: var(--font-mono);
		font-size: 0.76rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--accent);
	}

	.overview-bullets {
		margin-left: 1.2rem;
		color: var(--text-body);
		font-size: 0.96rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		overflow-wrap: break-word;
	}

	.overview-bullets li {
		min-width: 0;
	}

	.overview-toc {
		margin-top: 1rem;
		padding-top: 0.85rem;
		border-top: 1px solid var(--border);
	}

	.overview-toc summary {
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--sage);
		user-select: none;
		list-style: none;
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.overview-toc summary::-webkit-details-marker {
		display: none;
	}

	.overview-toc summary::before {
		content: '▸';
		display: inline-block;
		flex-shrink: 0;
		transition: transform 0.15s ease;
	}

	.overview-toc[open] summary::before {
		transform: rotate(90deg);
	}

	.overview-toc summary:hover {
		color: var(--text);
	}

	.toc-list {
		list-style: none;
		margin-top: 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.toc-link {
		font-family: var(--font-mono);
		font-size: 0.84rem;
		color: var(--text);
		font-weight: 500;
		overflow-wrap: break-word;
	}

	.toc-link:hover {
		color: var(--accent);
	}

	.toc-summary {
		font-size: 0.86rem;
		color: var(--text-muted);
		margin-top: 0.15rem;
		overflow-wrap: break-word;
	}

	/* Article Body */
	.article-body {
		display: flex;
		flex-direction: column;
		gap: 2.25rem;
		min-width: 0;
	}

	.article-section {
		scroll-margin-top: 4.75rem;
		min-width: 0;
		max-width: 100%;
	}

	.article-section h2 {
		font-size: 1.35rem;
		letter-spacing: -0.015em;
		margin-bottom: 0.9rem;
		color: var(--text);
		overflow-wrap: break-word;
	}

	.article-section p {
		color: var(--text-body);
		font-size: 1.02rem;
		margin-bottom: 1rem;
		overflow-wrap: break-word;
	}

	.article-section ul {
		margin: 0.5rem 0 1rem 1.35rem;
		color: var(--text-body);
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		overflow-wrap: break-word;
	}

	.article-section li {
		min-width: 0;
	}

	/* Inline formatting inside {@html} */
	.article :global(.inline-code) {
		font-family: var(--font-mono);
		font-size: 0.86em;
		padding: 0.14rem 0.4rem;
		border-radius: 5px;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		color: var(--ochre);
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.article :global(strong) {
		color: var(--text);
		font-weight: 600;
	}

	.article :global(.inline-link) {
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 3px;
		overflow-wrap: anywhere;
	}

	/* Code Blocks & Syntax Highlighting */
	.code-block {
		margin-top: 1rem;
		border-radius: 10px;
		border: 1px solid var(--border);
		background: var(--bg-code);
		overflow: hidden;
		max-width: 100%;
	}

	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		padding: 0.55rem 1rem;
		background: var(--bg-elevated);
		border-bottom: 1px solid var(--border);
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--text-muted);
	}

	.code-header span:first-child {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.code-lang {
		color: var(--ochre);
		flex-shrink: 0;
	}

	.code-pre {
		padding: 1.1rem 1.25rem;
		overflow-x: auto;
		overflow-y: hidden;
		-webkit-overflow-scrolling: touch;
		max-width: 100%;
		font-size: 0.85rem;
		line-height: 1.6;
		color: var(--text);
	}

	.code-pre :global(.tok-comment) {
		color: var(--text-subtle);
		font-style: italic;
	}

	.code-pre :global(.tok-keyword) {
		color: var(--accent);
		font-weight: 500;
	}

	.code-pre :global(.tok-string) {
		color: var(--sage);
	}

	.code-pre :global(.tok-property) {
		color: var(--ochre);
	}

	.code-pre :global(.tok-function) {
		color: #e8b86d;
	}

	.code-pre :global(.tok-variable) {
		color: var(--accent);
	}

	.code-pre :global(.tok-flag) {
		color: var(--ochre);
	}

	.code-pre :global(.tok-number) {
		color: #d4a373;
	}

	.code-pre :global(.tok-punctuation) {
		color: var(--text-muted);
	}

	/* Collapsible Deep Dives */
	.deep-dive {
		margin-top: 1.15rem;
		border-radius: 10px;
		border: 1px solid var(--border);
		background: var(--bg-elevated);
		overflow: hidden;
		max-width: 100%;
	}

	.deep-dive summary {
		cursor: pointer;
		padding: 0.75rem 1rem;
		font-family: var(--font-mono);
		font-size: 0.83rem;
		line-height: 1.45;
		font-weight: 500;
		color: var(--ochre);
		user-select: none;
		list-style: none;
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		overflow-wrap: break-word;
	}

	.deep-dive summary::-webkit-details-marker {
		display: none;
	}

	.deep-dive summary::before {
		content: '▸';
		display: inline-block;
		flex-shrink: 0;
		color: var(--accent);
		transition: transform 0.15s ease;
	}

	.deep-dive[open] summary {
		border-bottom: 1px solid var(--border);
	}

	.deep-dive[open] summary::before {
		transform: rotate(90deg);
	}

	.deep-dive summary:hover {
		background: rgba(244, 241, 222, 0.03);
	}

	.deep-dive-body {
		padding: 1rem 1.15rem;
		min-width: 0;
	}

	.deep-dive-body p {
		font-size: 0.95rem;
		margin-bottom: 0.75rem;
		overflow-wrap: break-word;
	}

	.deep-dive-body p:last-child {
		margin-bottom: 0;
	}

	/* Team / Colophon Footnote */
	.team-footer {
		margin-top: 3.5rem;
		padding: 1.35rem 1.5rem;
		border-radius: 10px;
		background: var(--bg-elevated);
		border: 1px solid var(--border);
	}

	.team-label {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted);
		margin-bottom: 0.35rem;
	}

	.team-note {
		font-size: 0.88rem;
		color: var(--text-subtle);
		margin-bottom: 1rem;
	}

	.team-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 0.85rem;
	}

	.team-item {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.65rem 0.85rem;
		min-width: 0;
	}

	.team-item dt {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--text-subtle);
		margin-bottom: 0.15rem;
	}

	.team-item dd {
		font-family: var(--font-mono);
		font-size: 0.86rem;
		color: var(--text);
		font-weight: 500;
		overflow-wrap: break-word;
	}

	@media (max-width: 600px) {
		.back-link {
			margin-bottom: 1.25rem;
		}

		.article-header {
			padding-bottom: 1.5rem;
			margin-bottom: 1.5rem;
		}

		.article-summary {
			font-size: 1rem;
			margin-bottom: 1.25rem;
		}

		.overview-card {
			padding: 1.05rem 1.1rem;
			margin-bottom: 2rem;
		}

		.overview-bullets {
			margin-left: 1.05rem;
			font-size: 0.92rem;
		}

		.article-body {
			gap: 1.85rem;
		}

		.article-section h2 {
			font-size: 1.2rem;
		}

		.article-section p,
		.article-section ul {
			font-size: 0.97rem;
		}

		.article-section ul {
			margin-left: 1.15rem;
		}

		.code-header {
			padding: 0.5rem 0.85rem;
			font-size: 0.73rem;
		}

		.code-pre {
			padding: 0.9rem 0.95rem;
			font-size: 0.78rem;
			line-height: 1.55;
		}

		.deep-dive summary {
			padding: 0.7rem 0.85rem;
			font-size: 0.78rem;
		}

		.deep-dive-body {
			padding: 0.85rem 0.95rem;
		}

		.team-footer {
			margin-top: 2.5rem;
			padding: 1.15rem;
		}
	}
</style>
