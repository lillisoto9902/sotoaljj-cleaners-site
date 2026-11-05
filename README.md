# SotoALJJ LLC Cleaners — local website

Static website retaining the original logo and navy, blue, teal, green, and white branding. `index.html` contains Home, About, Services & Pricing, Contact, and Booking sections.

## Current state

Owner confirmed on November 5, 2026: sotoaljj@gmail.com; Cumberland County area including ZIP 08332; $100 applies to standard residential cleaning up to 875 square feet only. Larger properties require custom quotes. Other residential tiers require confirmed quotes; every commercial job requires custom pricing. Hours and the existing Core business-facing phone are unverified.

Online submission and payment are intentionally unavailable. The form is for local planning only and sends/stores nothing. Email is the public fallback. All jobs require full payment before work starts; this website does not enforce backend work states or process payments.

The prior speculative API adapter was removed after inspecting the existing Core contract. Core's tenant-authenticated `/intake` route rejects the old frontend schema and its bearer credential must never be embedded here. No second backend is provided. Adding an API URL cannot enable bookings.

## Files

- `index.html`: customer content and planning form.
- `styles.css`: original branding and layout.
- `accessibility.css`: responsive, focus, contrast, reduced motion, and updated section styles.
- `app.js`: service switching, nonbinding price guidance, public details, guarded disabled submission.
- `config.js`: verified public display values only, never credentials.
- `assets/sotoaljj-logo.png`: unchanged original; smaller derived PNG used for display, separate favicon.

## Review and validation

In the parent workspace, `owner-review/` holds the integration evidence, unpublished policy draft, internal profitability measurement template, and implementation report. Keep that folder outside any deployment or public repository. Completed profitability records must stay in authorized private storage.

The parent `.qa/validate.cjs` uses Playwright, the installed local Chrome, and axe-core to test browser behavior and automated accessibility. Run `node .qa/validate.cjs` from the parent workspace after installing its local `.qa` dependencies. These tools are not production dependencies. Automated results do not constitute a complete accessibility certification.

No build is needed. For local preview, serve this directory as static files. The supplied folder originally had no Git metadata; a local repository was prepared for review against the existing remote history. The parent internal materials remain outside this repository.

## Publication gate

Owner explicitly prohibited pushing to GitHub, enabling live payments, or changing production Core configuration without authorization. Nothing has been pushed or deployed. Publish only this website directory after approval, never the parent workspace or owner-review files. Before actual booking/payment launch, complete and verify the existing Core customer workflow described in the integration review. Preserve all existing tenant, service, commercial, cancellation, security, and provider-gate rules.
