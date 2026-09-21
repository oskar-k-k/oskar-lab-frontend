# Frontend Agent Rules

Read and follow `../AGENTS.md` before changing frontend code.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Workspace boundaries

- `apps/*` are independent Next.js applications with their own root layouts, configurations and builds.
- `packages/core` contains framework-independent logic; `packages/ui` contains reusable components and tokens.
- `packages/platform-shell` composes the optional Oskar Lab header; platform branding and account integration do not belong in `ui`.
- Never import source from a sibling app. Use package exports; do not add app-specific aliases to shared packages.
- Use plain anchors for navigation between apps. The platform proxies `/apps/<slug>` to independent servers.
- Keep app-local resources base-path aware with `appPath`. Both integrated and standalone builds must work.
- Put app tests inside their app and package tests inside their package. Run `npm run check` at the workspace root.
- Environment files live in their owning app. Do not duplicate central Google credentials into product apps.
- `/apps/core-design` documents the real package source and previews shared components.
