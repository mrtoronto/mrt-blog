.PHONY: help install dev preview build check clean deploy status

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

install: ## Install npm dependencies
	npm install

dev: ## Start local Vite dev server with hot reload (http://localhost:5173)
	npm run dev

preview: build ## Build static site and preview production bundle locally (http://localhost:4173)
	npm run preview

build: ## Build static site into ./build
	npm run build

check: ## Run SvelteKit sync and TypeScript/Svelte type checks
	npm run check

clean: ## Remove build artifacts and SvelteKit cache
	rm -rf build .svelte-kit

deploy: check build ## Verify types/build, then push current main branch to trigger GitHub Pages deploy
	git push origin main

status: ## Check live GitHub Pages & DNS status for m-r-t.xyz
	@echo "=== Public DNS A-Records (m-r-t.xyz) ==="
	@dig @1.1.1.1 m-r-t.xyz A +short
	@echo "=== GitHub Pages Status ==="
	@gh api /repos/mrtoronto/mrt-blog/pages --jq '{url: .html_url, cname: .cname, https_enforced: .https_enforced, status: .status, cert_state: .https_certificate.state}'
	@echo "=== Latest Deploy Workflow ==="
	@gh run list --workflow=deploy.yml --limit 1
