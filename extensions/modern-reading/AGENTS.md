# Modern Reading

Read `../../AGENTS.md` and `../../../AGENTS.md`. This product is a Chrome Manifest V3 extension, not a Next.js app. Keep it under `extensions/` and do not add it to the platform's Next.js server routing.

- Domain rules live in `src/model.ts`; DOM work belongs to `src/reader.ts`; Chrome integration remains separate.
- Copy lives in the shared i18n package's English/German `modern-reading` catalog and is bundled locally.
- Never upload page text or add remote executable code. Request HTTP/HTTPS host access at installation for automatic reading, as explicitly requested by the product owner.
- Preserve page text and existing elements. Test restoration, excluded content and dynamically added text.
- Build with `npm run build --workspace=@oskar-lab/modern-reading` from `frontend`; load `dist` as an unpacked extension.
