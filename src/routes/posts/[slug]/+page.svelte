<script lang="ts">
	import { base } from '$app/paths';
	import { siteMeta } from '$lib/data/content';

	let { data } = $props();
	const post = $derived(data.post);
</script>

<svelte:head>
	<title>{post.title} — {siteMeta.author}</title>
	<meta name="description" content={post.summary} />
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
			{/if}
		</div>
	</header>

	<div class="article-body">
		{#each post.sections as section}
			<section class="article-section">
				{#if section.heading}
					<h2>{section.heading}</h2>
				{/if}

				{#each section.paragraphs as paragraph}
					<p>{paragraph}</p>
				{/each}

				{#if section.bullets}
					<ul>
						{#each section.bullets as bullet}
							<li>{bullet}</li>
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
						<pre><code>{section.code.snippet}</code></pre>
					</div>
				{/if}
			</section>
		{/each}
	</div>
</article>

<style>
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
		margin-bottom: 2.5rem;
		border-bottom: 1px solid var(--border);
	}

	.article-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text-subtle);
		margin-bottom: 0.85rem;
	}

	h1 {
		font-size: clamp(1.75rem, 4vw, 2.4rem);
		line-height: 1.2;
		letter-spacing: -0.025em;
		margin-bottom: 1rem;
	}

	.article-summary {
		font-size: 1.1rem;
		color: var(--text-muted);
		margin-bottom: 1.5rem;
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
		gap: 0.45rem;
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
	}

	.article-body {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.article-section h2 {
		font-size: 1.35rem;
		letter-spacing: -0.015em;
		margin-bottom: 0.9rem;
		color: var(--text);
	}

	.article-section p {
		color: #cbd5e1;
		font-size: 1.02rem;
		margin-bottom: 1rem;
	}

	.article-section ul {
		margin: 0.5rem 0 1rem 1.35rem;
		color: #cbd5e1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.code-block {
		margin-top: 1rem;
		border-radius: 10px;
		border: 1px solid var(--border);
		background: var(--bg-code);
		overflow: hidden;
	}

	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.55rem 1rem;
		background: var(--bg-elevated);
		border-bottom: 1px solid var(--border);
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--text-muted);
	}

	.code-lang {
		color: var(--text-subtle);
	}

	pre {
		padding: 1.1rem 1.25rem;
		overflow-x: auto;
		font-size: 0.85rem;
		line-height: 1.6;
		color: #e2e8f0;
	}
</style>
