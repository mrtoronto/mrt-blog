<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import { siteMeta } from '$lib/data/content';

	let { children } = $props();
</script>

<svelte:head>
	<title>{siteMeta.title}</title>
	<meta name="description" content={siteMeta.description} />
</svelte:head>

<header class="site-header">
	<div class="container header-inner">
		<a href="{base}/" class="brand">
			<span class="brand-mark">M</span>
			<span class="brand-text">{siteMeta.author}</span>
		</a>
		<nav class="nav-links">
			<a href="{base}/#projects">Projects</a>
			<a href="{base}/#posts">Writing</a>
			<a
				href={siteMeta.githubUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="github-link"
			>
				GitHub ↗
			</a>
		</nav>
	</div>
</header>

<main class="site-main">
	{@render children()}
</main>

<footer class="site-footer">
	<div class="container footer-inner">
		<p>Built with SvelteKit &bull; Hosted on GitHub Pages</p>
		<p>
			<a href="https://github.com/mrtoronto/mrt-blog" target="_blank" rel="noopener noreferrer">
				mrtoronto/mrt-blog ↗
			</a>
		</p>
	</div>
</footer>

<style>
	.site-header {
		border-bottom: 1px solid var(--border);
		background: rgba(11, 15, 23, 0.85);
		backdrop-filter: blur(10px);
		position: sticky;
		top: 0;
		z-index: 20;
	}

	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 4rem;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		font-weight: 600;
		font-size: 1rem;
		letter-spacing: -0.01em;
	}

	.brand-mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.85rem;
		height: 1.85rem;
		border-radius: 7px;
		background: var(--accent-soft);
		color: var(--accent);
		border: 1px solid var(--accent-border);
		font-family: var(--font-mono);
		font-weight: 600;
		font-size: 0.9rem;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		font-size: 0.9rem;
		color: var(--text-muted);
	}

	.nav-links a {
		transition: color 0.15s ease;
	}

	.nav-links a:hover {
		color: var(--text);
	}

	.github-link {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		padding: 0.35rem 0.7rem;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--bg-elevated);
	}

	.github-link:hover {
		border-color: var(--border-hover);
	}

	.site-main {
		flex: 1;
		padding: 3.5rem 0 5rem;
	}

	.site-footer {
		border-top: 1px solid var(--border);
		padding: 2rem 0;
		color: var(--text-subtle);
		font-size: 0.85rem;
	}

	.footer-inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.footer-inner a {
		font-family: var(--font-mono);
		color: var(--text-muted);
	}

	.footer-inner a:hover {
		color: var(--accent);
	}
</style>
