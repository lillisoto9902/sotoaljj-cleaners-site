# SotoALJJ LLC Cleaners — local website

Static website retaining the original logo and navy, blue, teal, green, and white branding. `index.html` contains Home, About, Services & Pricing, Contact, and Booking sections.

## Current state

Owner confirmed on November 5, 2026: sotoaljj@gmail.com; Cumberland County, New Jersey including ZIP 08332, subject to confirmed address coverage. Standard cleaning up to 875 sq. ft. is $100 before tax / $106.63 with NJ tax. Deep cleaning up to 875 sq. ft. is $250 before tax / $266.56 with NJ tax. Above 875 sq. ft., every tier requires a custom quote. Move-in/out, recurring arrangements, and all commercial services require an agreed quote; no discounts, fees, or other prices are assumed. Hours and the existing Core business-facing Twilio phone are unverified.

Online submission and payment are intentionally unavailable. The form is for local planning only and sends/stores nothing. Email is the public fallback. A validated eligible request requires a 20% deposit credited to the agreed total, with the remaining 80% due upon arrival. Full payment must be verified before cleaning starts. Standard split: $21.33 + $85.30; deep split: $53.31 + $213.25. These are rounded portions of the tax-inclusive total, not additional purchases.

The owner-provided PayPal links are retained as inactive review data in config.js. No PayPal link is exposed as an active customer checkout. Neither opening a link nor a success query parameter can establish payment. Link checkout amounts, correct merchant, booking matching, and server-side reconciliation remain unverified. No live charge or chargeable test has been performed.

The New York date/time picker displays a 48-hour minimum for new customers. Display helpers account for elapsed time across DST; backend enforcement is still required. Selecting recurring service does not grant a verification exception. Verified recurring requests within 48 hours need actual availability and authorized manual approval through Core. The 24-hour confirmation target begins only after both a completed request and a verified deposit. It never grants automatic confirmation.

Revised cancellation/refund wording stays in the private owner-review draft until final owner approval. The public page discloses that approved terms must be reviewed before deposit collection. Earlier blanket nonrefund wording and earlier standard-only pricing reports are superseded by the current owner instructions.

The prior speculative API adapter was removed after inspecting the existing Core contract. Core's tenant-authenticated `/intake` route rejects the old frontend schema and its bearer credential must never be embedded here. No second backend is provided. Adding an API URL cannot enable bookings.

## Files

- `index.html`: customer content and planning form.
- `styles.css`: original branding and layout.
- `accessibility.css`: responsive, focus, contrast, reduced motion, and updated section styles.
- `app.js`: service switching, nonbinding price guidance, public details, guarded disabled submission.
- `booking-rules.js`: display-only integer-cent price/tax splits and New York date/time guidance; never an authoritative booking or payment engine.
- `config.js`: verified public display values only, never credentials.
- `assets/sotoaljj-logo.png`: unchanged original; smaller derived PNG used for display, separate favicon.

## Review and validation

In the parent workspace, `owner-review/` holds the integration evidence, unpublished policy draft, internal profitability measurement template, and implementation report. Keep that folder outside any deployment or public repository. Completed profitability records must stay in authorized private storage.

The parent `.qa/validate.cjs` uses Playwright, the installed local Chrome, and axe-core to test browser behavior and automated accessibility. Run `node .qa/validate.cjs` and `node --test .qa/booking-guidance.test.cjs` from the parent workspace. These tools are not production dependencies. Automated results do not constitute a complete accessibility certification or genuine Core/PayPal end-to-end acceptance.

No build is needed. For local preview, serve this directory as static files. The supplied folder originally had no Git metadata; a local repository was prepared for review against the existing remote history. The parent internal materials remain outside this repository.

## Publication gate

Owner explicitly prohibited pushing to GitHub, enabling live payments, or changing production Core configuration without authorization. Nothing has been pushed or deployed. Publish only this website directory after approval, never the parent workspace or owner-review files. Before actual booking/payment launch, complete and verify the existing Core customer workflow described in the integration review. Preserve all existing tenant, service, commercial, cancellation, security, and provider-gate rules.
