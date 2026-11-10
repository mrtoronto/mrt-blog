<script lang="ts">
	import { base } from '$app/paths';
	import { posts, projects, siteMeta } from '$lib/data/content';
</script>

<div class="container">
	<section class="hero">
		<div class="badge">@{siteMeta.githubHandle} &bull; Engineering Log</div>
		<h1>Projects, experiments, and write-ups.</h1>
		<p class="hero-subtitle">
			A home for the software projects I’m building on GitHub—pairing repositories with technical
			notes on how they work, architectural trade-offs, and lessons learned.
		</p>
		<div class="hero-actions">
			<a href="#posts" class="btn btn-primary">Read Latest Post</a>
			<a
				href={siteMeta.githubUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-secondary"
			>
				View GitHub Profile ↗
			</a>
		</div>
	</section>

	<section id="projects" class="section">
		<div class="section-header">
			<h2>Featured Projects</h2>
			<span class="section-count">{projects.length} repo{projects.length === 1 ? '' : 's'}</span>
		</div>

		<div class="projects-grid">
			{#each projects as project}
				<article class="project-card">
					<div class="project-top">
						<div>
							<span class="status-pill">{project.status}</span>
							<h3>
								<a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
									{project.title} ↗
								</a>
							</h3>
						</div>
					</div>
					<p class="project-description">{project.description}</p>
					<div class="project-footer">
						<div class="tags">
							{#each project.tags as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
						<div class="project-links">
							<a
								href={project.repoUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="card-link"
							>
								GitHub Repo ↗
							</a>
							{#if project.relatedPostSlug}
								<a href="{base}/posts/{project.relatedPostSlug}/" class="card-link accent">
									Read Write-up →
								</a>
							{/if}
						</div>
					</div>
				</article>
			{/each}
		</div>
	</section>

	<section id="posts" class="section">
		<div class="section-header">
			<h2>Project Write-ups &amp; Notes</h2>
			<span class="section-count">{posts.length} post{posts.length === 1 ? '' : 's'}</span>
		</div>

		<div class="posts-list">
			{#each posts as post}
				<article class="post-card">
					<div class="post-meta">
						<time datetime={post.date}>{post.date}</time>
						<span>&bull;</span>
						<span>{post.readingTime}</span>
						{#if post.repoName && post.repoUrl}
							<span>&bull;</span>
							<a
								href={post.repoUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="repo-badge"
							>
								{post.repoName} ↗
							</a>
						{/if}
					</div>
					<h3 class="post-title">
						<a href="{base}/posts/{post.slug}/">{post.title}</a>
					</h3>
					<p class="post-summary">{post.summary}</p>
					<div class="post-bottom">
						<div class="tags">
							{#each post.tags as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
						<a href="{base}/posts/{post.slug}/" class="read-more">Read article →</a>
					</div>
				</article>
			{/each}
		</div>
	</section>
</div>

<style>
	.hero {
		padding: 1rem 0 3.5rem;
		border-bottom: 1px solid var(--border);
	}

	h1 {
		font-size: clamp(2rem, 4.5vw, 2.85rem);
		line-height: 1.15;
		letter-spacing: -0.03em;
		margin: 1rem 0 1.1rem;
		font-weight: 700;
	}

	.hero-subtitle {
		font-size: 1.1rem;
		color: var(--text-muted);
		max-width: 640px;
		margin-bottom: 1.75rem;
	}

	.hero-actions {
		display: flex;
		gap: 0.85rem;
		flex-wrap: wrap;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.9rem;
		font-weight: 500;
		padding: 0.65rem 1.15rem;
		border-radius: 8px;
		transition: all 0.15s ease;
	}

	.btn-primary {
		background: var(--accent);
		color: #082f49;
		font-weight: 600;
	}

	.btn-primary:hover {
		filter: brightness(1.08);
	}

	.btn-secondary {
		background: var(--bg-elevated);
		color: var(--text);
		border: 1px solid var(--border);
	}

	.btn-secondary:hover {
		border-color: var(--border-hover);
	}

	.section {
		padding-top: 3.25rem;
	}

	.section-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}

	.section-header h2 {
		font-size: 1.35rem;
		letter-spacing: -0.02em;
	}

	.section-count {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text-subtle);
	}

	.projects-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.25rem;
	}

	.project-card,
	.post-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.5rem;
		transition: border-color 0.15s ease, transform 0.15s ease;
	}

	.project-card:hover,
	.post-card:hover {
		border-color: var(--border-hover);
	}

	.status-pill {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: #34d399;
		background: rgba(52, 211, 153, 0.1);
		border: 1px solid rgba(52, 211, 153, 0.25);
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		margin-bottom: 0.5rem;
	}

	.project-card h3 {
		font-size: 1.2rem;
		font-family: var(--font-mono);
		margin-bottom: 0.5rem;
	}

	.project-card h3 a:hover {
		color: var(--accent);
	}

	.project-description {
		color: var(--text-muted);
		font-size: 0.96rem;
		margin-bottom: 1.25rem;
	}

	.project-footer,
	.post-bottom {
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

	.project-links {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.card-link {
		color: var(--text-muted);
	}

	.card-link:hover {
		color: var(--text);
	}

	.card-link.accent,
	.read-more {
		color: var(--accent);
		font-size: 0.88rem;
		font-weight: 500;
	}

	.posts-list {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.post-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.55rem;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--text-subtle);
		margin-bottom: 0.65rem;
	}

	.repo-badge {
		color: var(--accent);
	}

	.repo-badge:hover {
		text-decoration: underline;
	}

	.post-title {
		font-size: 1.3rem;
		line-height: 1.35;
		margin-bottom: 0.65rem;
	}

	.post-title a:hover {
		color: var(--accent);
	}

	.post-summary {
		color: var(--text-muted);
		font-size: 0.96rem;
		margin-bottom: 1.25rem;
	}
</style>
