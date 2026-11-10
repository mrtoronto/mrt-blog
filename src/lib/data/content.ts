export interface Project {
	title: string;
	slug: string;
	description: string;
	repoUrl: string;
	liveUrl?: string;
	tags: string[];
	status: 'Active' | 'In Progress' | 'Shipped';
	relatedPostSlug?: string;
}

export interface PostSection {
	heading?: string;
	paragraphs: string[];
	code?: {
		filename?: string;
		language: string;
		snippet: string;
	};
	bullets?: string[];
}

export interface BlogPost {
	slug: string;
	title: string;
	date: string;
	readingTime: string;
	summary: string;
	repoUrl?: string;
	repoName?: string;
	tags: string[];
	sections: PostSection[];
}

export const siteMeta = {
	title: 'Matt Toronto — Projects & Engineering Notes',
	author: 'Matt Toronto',
	githubHandle: 'mrtoronto',
	githubUrl: 'https://github.com/mrtoronto',
	description:
		'A collection of software projects, architecture write-ups, and engineering experiments.'
};

export const projects: Project[] = [
	{
		title: 'mrt-blog',
		slug: 'mrt-blog',
		description:
			'Static project blog and engineering notebook built with SvelteKit 5 and deployed automatically via GitHub Actions to GitHub Pages.',
		repoUrl: 'https://github.com/mrtoronto/mrt-blog',
		tags: ['SvelteKit', 'TypeScript', 'GitHub Actions', 'GitHub Pages'],
		status: 'Active',
		relatedPostSlug: 'how-this-site-works'
	}
];

export const posts: BlogPost[] = [
	{
		slug: 'how-this-site-works',
		title: 'How This Site Works: SvelteKit Static Builds & GitHub Pages CI/CD',
		date: '2026-11-10',
		readingTime: '4 min read',
		summary:
			'A walkthrough of how this blog is architected using SvelteKit with adapter-static, structured TypeScript content, and automated GitHub Actions workflows for zero-friction publishing.',
		repoUrl: 'https://github.com/mrtoronto/mrt-blog',
		repoName: 'mrtoronto/mrt-blog',
		tags: ['SvelteKit', 'GitHub Pages', 'CI/CD', 'Architecture'],
		sections: [
			{
				paragraphs: [
					'Every side project eventually needs a place where you can document what you built, why you built it, and what broke along the way. Instead of reaching for a heavy CMS or an over-engineered database setup, this site is built to be as fast and low-maintenance as possible: a static SvelteKit app hosted on GitHub Pages and rebuilt automatically on every push to main.'
				]
			},
			{
				heading: '1. Static Prerendering with SvelteKit',
				paragraphs: [
					'Under the hood, the site runs on Svelte 5 and SvelteKit using @sveltejs/adapter-static. Because every route is prerendered at build time, Vite compiles the entire site into plain HTML, CSS, and minimal JavaScript bundles inside the build/ directory.',
					'To make sure the site works seamlessly on a GitHub Pages project subpath (/mrt-blog) today—and on a root custom domain later—svelte.config.js reads a BASE_PATH environment variable injected during the CI build:'
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
			fallback: '404.html'
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
				heading: '2. Linking Projects & Write-ups Together',
				paragraphs: [
					'The primary goal of this blog is to pair GitHub repositories with deep-dive write-ups. Content lives right in the repository under src/lib/data/content.ts.',
					'Each project card on the landing page links directly to its GitHub repository and can optionally point to a companion blog post. Conversely, each blog post carries metadata for the repository it covers, so readers can jump straight from the narrative to the source code.'
				],
				bullets: [
					'Add a project entry to the projects array in src/lib/data/content.ts with its GitHub repo URL and tech stack tags.',
					'Add a post entry to the posts array with structured sections, code snippets, and a link to the project repo.',
					'SvelteKit automatically discovers every post slug via entries() and prerenders static HTML pages at build time.'
				]
			},
			{
				heading: '3. Automated Builds with GitHub Actions',
				paragraphs: [
					'Publishing a new post or adding a project only requires a git push. The repository is configured with GitHub Pages set to the GitHub Actions build type, driven by .github/workflows/deploy.yml.',
					'On every push to main, the workflow installs dependencies, dynamically computes the base path from actions/configure-pages, builds the static output, and deploys the artifact directly to GitHub Pages:'
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
  - name: Configure Pages
    id: pages
    uses: actions/configure-pages@v5
  - name: Build static site
    env:
      BASE_PATH: \${{ steps.pages.outputs.base_path }}
    run: npm run build
  - uses: actions/upload-pages-artifact@v3
    with:
      path: build
  - uses: actions/deploy-pages@v4`
				}
			},
			{
				heading: '4. Ready for a Custom Domain Later',
				paragraphs: [
					'Because actions/configure-pages@v5 automatically outputs the right base_path for the repository—and outputs an empty string as soon as a custom domain is configured in GitHub settings—switching to a custom domain later requires zero code changes. All internal links use SvelteKit’s base path helper so routes and assets resolve cleanly in both environments.'
				]
			}
		]
	}
];
