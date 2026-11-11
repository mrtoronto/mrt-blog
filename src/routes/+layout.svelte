<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import { siteMeta } from '$lib/data/content';

	let { children } = $props();
</script>

<svelte:head>
	<title>{siteMeta.title}</title>
	<meta name="description" content={siteMeta.description} />
	<meta property="og:site_name" content={siteMeta.author} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={siteMeta.title} />
	<meta property="og:description" content={siteMeta.description} />
	<meta property="og:url" content={siteMeta.siteUrl} />
	<meta property="og:image" content={siteMeta.ogImage} />
	<meta property="og:image:width" content="1376" />
	<meta property="og:image:height" content="768" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={siteMeta.title} />
	<meta name="twitter:description" content={siteMeta.description} />
	<meta name="twitter:image" content={siteMeta.ogImage} />
</svelte:head>

<header class="site-header">
	<div class="container header-inner">
		<a href="{base}/" class="brand">
			<img src="{base}/logo.svg" alt="MR. T" class="brand-logo" width="108" height="30" />
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
		background: rgba(20, 18, 16, 0.88);
		backdrop-filter: blur(10px);
		position: sticky;
		top: 0;
		z-index: 20;
	}

	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		height: 4rem;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		font-weight: 600;
		font-size: 1rem;
		letter-spacing: -0.01em;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.brand-logo {
		height: 1.75rem;
		width: auto;
		display: block;
		flex-shrink: 0;
		transition: transform 0.15s ease;
	}

	.brand:hover .brand-logo {
		transform: translateY(-1px);
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		font-size: 0.9rem;
		color: var(--text-muted);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.nav-links a {
		display: inline-flex;
		align-items: center;
		min-height: 2.25rem;
		transition: color 0.15s ease;
	}

	.nav-links a:hover {
		color: var(--text);
	}

	.github-link {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		padding: 0.35rem 0.7rem;
		min-height: 0 !important;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--bg-elevated);
	}

	.github-link:hover {
		border-color: var(--border-hover);
	}

	.site-main {
		flex: 1;
		width: 100%;
		min-width: 0;
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
		gap: 0.75rem 1rem;
	}

	.footer-inner a {
		font-family: var(--font-mono);
		color: var(--text-muted);
	}

	.footer-inner a:hover {
		color: var(--accent);
	}

	@media (max-width: 600px) {
		.header-inner {
			height: 3.5rem;
			gap: 0.5rem;
		}

		.brand-text {
			display: none;
		}

		.brand-logo {
			height: 1.45rem;
		}

		.nav-links {
			gap: 0.75rem;
			font-size: 0.82rem;
		}

		.github-link {
			font-size: 0.74rem;
			padding: 0.26rem 0.5rem;
		}

		.site-main {
			padding: 2rem 0 3.5rem;
		}

		.site-footer {
			padding: 1.5rem 0;
			font-size: 0.8rem;
		}
	}
</style>
