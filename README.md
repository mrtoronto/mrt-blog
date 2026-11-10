# mrt-blog

Personal project blog and engineering log built with **SvelteKit 5** (`@sveltejs/adapter-static`) and deployed automatically to **GitHub Pages** via GitHub Actions.

## Local Development

```bash
npm install
npm run dev
```

## Adding Projects & Blog Posts

All project cards and blog posts are defined in [`src/lib/data/content.ts`](src/lib/data/content.ts):

- **`projects`**: Add a project with its GitHub `repoUrl`, `tags`, `status`, and optional `relatedPostSlug`.
- **`posts`**: Add a blog post with its `slug`, `title`, `date`, `repoUrl`, and `sections`.

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the static site into `build/` and deploys it to GitHub Pages.
