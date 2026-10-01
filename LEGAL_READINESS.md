# Legal and privacy release status

Reviewed 2026-10-01. This is an engineering inventory, not a legal clearance. The legal pages are implemented locally; their presence does not make the deployed service compliant. Do not describe the privacy draft as complete or deploy it as a final notice before resolving the relevant gaps below.

## Implemented

- English and German operator notice, processing disclosures and existing account terms; shared links across applications and standalone redirects.
- Operator information supplied by the owner, without inventing a company, registration number or telephone number.
- Legal pages render without JavaScript. Name, address and email remain accessible text.
- `noindex` metadata and HTTP headers, `data-nosnippet`, and selected crawler exclusions. General crawlers can read the pages to see `noindex`. These are voluntary indexing signals, not protection against copying or access.
- Existing free-service terms retained. No paid-service contract, subscription terms or liability immunity is implied.

## Evidence and release blockers

| Area | Evidence | Required next action |
| --- | --- | --- |
| Hosting | Owner's supplied server record identifies Hetzner, Nuremberg. Owner confirms Cloudflare proxy disabled. | Confirm which live services and databases use this host, any additional providers, actual log rotation and backup retention. A read-only SSH attempt failed because the supplied key could not be parsed; production configuration was not verified. |
| Processor contracts | No signed agreements inspected. | Owner must check applicable Article 28 agreements, subprocessors and international transfer safeguards for hosting, Google and other recipients. |
| Additional contact channel | Email supplied; owner prefers an alternative to publishing a phone number. | A genuinely monitored web inquiry form can qualify under CJEU C-298/07. Configure reliable server-side delivery, test receipt and replies, handle delivery failures and abuse, and establish prompt human responses before treating this as resolved. No working mail transport was established; no pretend form was added. Consider separate phone duties if selling services. |
| Authentication | Account records, hashed passwords/tokens, Google sign-in, session cookies and seven-day backend token validity observed in source. | Verify production configuration and deletion jobs. Expiry is not deletion. Establish identity-checked access/export/deletion requests, including backups. |
| Workout | Stored workouts, weights, repetitions and history observed. | Assess whether actual use involves health data and an Article 9 condition, and implement any required explicit consent before the affected public processing. |
| ClothLab | Photos pass through frontend/backend to the model worker. Wrapper processing is in memory; model dependencies may behave differently. | Verify worker location, third-party retention/temp files, access control, upload limits, model/dependency licensing and actual deletion before public uploads. Do not claim all processing is transient or licensed without evidence. |
| Contact email | Owner supplied a Gmail inbox. | Verify account suitability, applicable processor/transfer arrangements and actual email retention. Publish retention criteria that match practice. |
| Payments | External support links are contemplated. | Review actual Patreon/Ko-fi tiers, rewards and commissions separately. Hobby status and free access do not settle tax, trade or consumer-law obligations. Do not copy account terms to paid services without review. |
| Public release | No deployment performed in this change. | Resolve applicable gaps, replace the visible draft warning with complete factual disclosures, verify deployed headers and links on every app and mobile layout, then obtain case-specific legal review if legal assurance is required. |

## Maintenance

For every new integration, record purpose, data categories, legal basis, recipients, location, retention/deletion and consent requirements before enabling it. Keep `packages/i18n/src/legal.ts` aligned with actual behavior. Avoid unnecessary analytics, embeds and remote resources. Never commit credentials or operational user data as evidence.

## Primary references

- [DDG section 5](https://www.gesetze-im-internet.de/ddg/__5.html)
- [CJEU C-298/07: additional contact means](https://eur-lex.europa.eu/legal-content/DE/ALL/?uri=CELEX%3A62007CJ0298)
- [GDPR, especially Articles 5, 6, 9, 13, 28 and 44–49](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679)
- [TDDDG section 25](https://www.gesetze-im-internet.de/ttdsg/__25.html)
- [DL-InfoV](https://www.gesetze-im-internet.de/dlinfov/)
- [Google: allow crawling for noindex to work](https://developers.google.com/search/docs/crawling-indexing/block-indexing)

