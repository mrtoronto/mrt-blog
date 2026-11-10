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
			'Static project blog and engineering notebook built with SvelteKit 5, deployed via GitHub Actions to GitHub Pages, and served on a custom domain through Cloudflare DNS.',
		repoUrl: 'https://github.com/mrtoronto/mrt-blog',
		liveUrl: 'https://m-r-t.xyz',
		tags: ['SvelteKit', 'TypeScript', 'GitHub Actions', 'Cloudflare DNS'],
		status: 'Active',
		relatedPostSlug: 'how-this-site-works'
	}
];

export const posts: BlogPost[] = [
	{
		slug: 'how-this-site-works',
		title: 'How This Site Works: From Zero to Live with SvelteKit, GitHub Pages & Cloudflare CLI',
		date: '2026-11-10',
		readingTime: '6 min read',
		summary:
			'A complete walkthrough of how this blog was built and shipped directly from the terminal: static prerendering with SvelteKit 5, GitHub Actions CI/CD, and automated DNS & TLS provisioning across Namecheap, Cloudflare, and GitHub Pages.',
		repoUrl: 'https://github.com/mrtoronto/mrt-blog',
		repoName: 'mrtoronto/mrt-blog',
		tags: ['SvelteKit', 'GitHub Pages', 'Cloudflare', 'CI/CD', 'DNS'],
		sections: [
			{
				paragraphs: [
					'Every side project eventually needs a place where you can document what you built, why you built it, and the interesting technical trade-offs along the way. Instead of reaching for a heavy CMS or a database-backed server, this site is designed for speed, simplicity, and zero maintenance: a static SvelteKit 5 application rebuilt on every git push and served on m-r-t.xyz.',
					'Even better, virtually the entire stack—from creating the GitHub repository to provisioning the Cloudflare DNS zone, records, and HTTPS certificates—was configured directly from the command line.'
				]
			},
			{
				heading: '1. Static Prerendering with SvelteKit 5',
				paragraphs: [
					'Under the hood, the site runs on Svelte 5 and SvelteKit using @sveltejs/adapter-static. Every route is prerendered at build time (+layout.ts exports prerender = true and trailingSlash = "always"), so Vite compiles the entire application into plain HTML, CSS, and lightweight client chunks inside the build/ directory.',
					'When the site first launched on the default github.io project URL (/mrt-blog), it needed a subpath prefix. Once the custom domain (m-r-t.xyz) went live, it needed to serve from the root path (/). Reading BASE_PATH from the build environment made that transition seamless without changing a single route:'
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
				heading: '2. Content as Code: Pairing Repos with Write-ups',
				paragraphs: [
					'The main goal of this site is to pair GitHub repositories with deep-dive engineering write-ups. Rather than managing an external headless CMS, all project cards and posts live directly in the repository inside src/lib/data/content.ts as typed TypeScript objects.',
					'Each project card links to its source repository and companion post, and SvelteKit discovers every post slug at build time using an entries() generator:'
				],
				bullets: [
					'Add a project entry to the projects array in src/lib/data/content.ts with its GitHub repo URL, status, and tech stack tags.',
					'Add a post entry to the posts array with structured sections, code snippets, and repository metadata.',
					'SvelteKit automatically prerenders /posts/[slug]/index.html for every post during npm run build.'
				]
			},
			{
				heading: '3. Zero-Click CI/CD with GitHub CLI & GitHub Actions',
				paragraphs: [
					'The repository itself was initialized and enabled for GitHub Pages from the terminal using the GitHub CLI (gh repo create and gh api /repos/:owner/:repo/pages -f build_type=workflow).',
					'On every push to main, .github/workflows/deploy.yml installs dependencies, queries actions/configure-pages@v5 for the current base path (/mrt-blog before the custom domain was attached, and "" afterward), builds the static bundle, and deploys the artifact:'
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
				heading: '4. Custom Domain Architecture: Namecheap → Cloudflare → GitHub Pages',
				paragraphs: [
					'The domain m-r-t.xyz was registered on Namecheap, but to keep DNS management consolidated alongside other projects—and programmable from the CLI—DNS authority was delegated to Cloudflare.',
					'Because newly registered domains have a standard 60-day ICANN registrar transfer lock, you do not actually need to transfer the registrar to manage DNS in Cloudflare. Instead, you keep Namecheap as the registrar and point the domain’s custom nameservers to the pair assigned by Cloudflare. From that point onward, 100% of DNS management happens through Cloudflare’s API.'
				],
				bullets: [
					'Registrar (Namecheap): Holds domain registration and delegates NS records to Cloudflare nameservers.',
					'DNS Provider (Cloudflare): Hosts the DNS zone and serves A, AAAA, and CNAME records pointing to GitHub Pages.',
					'Origin & TLS (GitHub Pages / Fastly CDN): Serves the static build from static/CNAME and automatically provisions a Let’s Encrypt TLS certificate.'
				]
			},
			{
				heading: '5. Automating Cloudflare DNS via the REST API',
				paragraphs: [
					'Instead of clicking through dashboards to add nine separate DNS records, we used a scoped Cloudflare API token stored in a local, gitignored .env file (with Zone:Edit and DNS:Edit permissions) to create the zone and populate all records directly from the shell.',
					'One important detail when pairing Cloudflare with GitHub Pages: setting proxied: false (DNS-only mode) on the records allows GitHub Pages to verify domain ownership directly against its Fastly edge IPs and issue/renew its Let’s Encrypt certificate without SSL proxy conflicts:'
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
				heading: '6. Verifying Propagation & Enforcing HTTPS',
				paragraphs: [
					'After updating the nameservers at the registrar, the main wait is the TLD registry (.xyz / CentralNic) publishing the NS delegation to its authoritative servers, which took roughly 30 minutes.',
					'One fun DNS quirk we ran into while polling: querying the TLD server directly with dig @a.nic.xyz m-r-t.xyz NS +short looks empty even after delegation is live, because TLD referral servers return NS records in the AUTHORITY section rather than the ANSWER section. Querying a public recursive resolver (dig @1.1.1.1 m-r-t.xyz NS +short) immediately confirmed the delegation was active.',
					'Once the A records resolved publicly, a single GitHub API call triggered certificate approval and enabled strict HTTPS redirects across the site:'
				],
				code: {
					filename: 'enable-https.sh',
					language: 'bash',
					snippet: `# Set custom domain and enforce HTTPS via GitHub CLI
gh api --method PUT /repos/mrtoronto/mrt-blog/pages \\
  -f cname="m-r-t.xyz" \\
  -F https_enforced=true \\
  -f build_type="workflow"`
				}
			}
		]
	}
];
