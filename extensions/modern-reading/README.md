# Modern Reading

A local-first Chrome Manifest V3 extension for adjustable word-prefix highlighting, inspired by Bionic Reading. This is an independent implementation, not the official Bionic Reading product or algorithm. It makes no promise of increased reading speed or comprehension.

## Install the development version

From `frontend`:

```powershell
npm.cmd install
npm.cmd run build --workspace=@oskar-lab/modern-reading
```

1. Open `chrome://extensions` in desktop Chrome.
2. Enable **Developer mode** in the top right.
3. Choose **Load unpacked** and select `frontend/extensions/modern-reading/dist`.
4. Pin **Modern Reading** using Chrome's Extensions menu.
5. Open a normal website, click the extension, and enable reading on that page.

The build already produces the complete installable directory. No server, account, API key or backend is required. After source changes, rebuild and click **Reload** on Chrome's extension card, then reload your test website. This extension has not been published to the Chrome Web Store.

## Use

- **Enable on this page** toggles the current document. A manual choice lasts until navigation/reload; it takes precedence over automatic mode in that document.
- **Highlighted part** controls the first 20–70% of each word, rounded to complete graphemes. The preview updates immediately; website changes are saved when the slider is released.
- **Minimum paragraph length** defaults to 120 characters. Text blocks below that threshold stay untouched.
- **Automatically on websites** requests optional HTTP/HTTPS host access and registers a persistent content script. Existing accessible tabs and future pages receive it. Switching it off restores connected pages and removes future automatic injection. Chrome's grant remains until revoked in the extension's site-access settings.
- **Exclude this website** stores the exact origin (scheme, hostname and port), not all its subdomains. It prevents automatic mode on that origin. Manual activation still works.
- Changing the automatic mode or website exclusions clears temporary manual overrides in open pages. **Reset reading settings** disables automation, clears exclusions and restores defaults; it preserves the selected UI language and switches off the current document.
- Language initially follows Chrome's English/German locale, with English as fallback. Preferences are stored locally, not synced to a remote service.

## How it works

Chrome reads `manifest.json` to discover the popup, permissions and background worker. The popup is ordinary HTML/CSS with bundled TypeScript. A content script runs in an isolated JavaScript world but can modify the page DOM. The service worker registers or unregisters automatic injection and reconciles revoked permissions.

`src/model.ts` validates persisted settings and splits Unicode words using `Intl.Segmenter`. `src/reader.ts` adds presentation-only spans to eligible text nodes without replacing surrounding elements or event handlers. It restores original text nodes on disable, preserves site edits inside its spans, and observes added/changed text. Processing yields between blocks. No remote scripts, analytics, page-text storage or uploads are used.

This extension lives in the existing npm workspace under `extensions/*`, separately from the Next.js applications in `apps/*`. It has no platform server route. Translations are exported from `@oskar-lab/i18n/modern-reading`; there are no sibling-app imports.

## Scope and limitations

- Works with ordinary top-level HTML text in paragraphs, list items, quotes and other common text containers.
- Skips code, navigation, headers/footers, form controls, editable regions and explicitly hidden content.
- Chrome internal pages, browser PDF viewers, the Chrome Web Store and other protected pages reject injection. Embedded frames, shadow roots, canvas text and image text are not processed. Local `file://` pages are outside the requested permissions.
- An individual text node above 20,000 characters is skipped to avoid a long synchronous transform. Rendering and segmentation costs still depend on page size.
- Some heavily scripted sites may replace or manage their own text nodes. Disable the reader on those sites if their editor or rendering conflicts with DOM highlighting. Website compatibility is best-effort, not a guarantee for every URL.
- Chrome desktop is the install target; the popup also supports narrow widths. This is not an Android Chrome extension.

## Verify

From `frontend`:

```powershell
npm.cmd run check
npm.cmd run test --workspace=@oskar-lab/modern-reading
npx.cmd playwright install chromium
npm.cmd run test:browser --workspace=@oskar-lab/modern-reading
```

The browser check loads a disposable copy in an isolated persistent Chromium profile. Because automated popup tabs do not receive a toolbar activeTab grant and cannot handle native host-permission dialogs, only the test copy is pre-granted host access and its active-tab query targets the local fixture. All storage, content-script injection, registration, messaging and page changes use real extension APIs. Production permissions stay optional. Screenshots are written to ignored `test-results/`.

`MODERN_READING_BROWSER=msedge` can use an installed Edge version that still supports sideloading flags; otherwise use Playwright Chromium. Native Chrome toolbar activation, granting/denying optional access and revoking site access should additionally be checked manually in the unpacked production build.

## Related reading approaches

- Word-prefix fixation: [Bionic Reading](https://bionic-reading.com/).
- Line color gradients: [BeeLine Reader](https://www.beelinereader.com/).
- Line focus, spacing, syllables and read-aloud highlighting: [Microsoft Immersive Reader](https://support.microsoft.com/en-us/accessibility/word/use-immersive-reader-in-word).
- One-word-at-a-time presentation (RSVP): [Spritz Reader](https://www.spritzreader.com/about).

Only adjustable prefix highlighting is implemented in this first version. The other approaches are possible future modes.
