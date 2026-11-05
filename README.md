# SotoALJJ LLC Cleaners — Website

GitHub Pages-ready static website using the original logo and its blue/teal/green branding.

## Publish fastest
1. Create a **new, separate public GitHub repository** named `sotoaljj-cleaners-site`.
2. Upload the files in this folder to the repo root (including `assets/`). Commit.
3. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and Save.
4. The website will be available at `https://YOUR_USERNAME.github.io/sotoaljj-cleaners-site/` once GitHub Pages deploys.

## Critical: connect existing Receptionist Core, no new backend
The site previews without a backend, but it will NOT accept or store booking requests until explicitly connected. In `config.js`, configure the verified HTTPS public customer intake endpoint and tenant ID. Do not place admin tokens, API secrets, or payment credentials into this public repository. Review `mapBookingToApi` in `app.js` against the actual public intake contract; current JSON is only a proposed structure, **not a verified Receptionist Core API contract**.

Before enabling customer requests:
- Confirm the actual public customer-facing route (known internal `/intake` may not be sufficient).
- Confirm server-side tenant isolation, service configuration, and fixed commercial terms remain authoritative.
- Ensure allowed-origin CORS, CSRF/customer authorization, verification, rate limiting, bot mitigation, data retention, and operational consent work **in the deployed customer journey**.
- Test residential service details against accepted schema and calculate prices/duration server-side, not in JavaScript.
- Check end-to-end response, reminders, confirmation, scheduling, cancellation, and admin visibility using an approved test tenant.
- The prior `global_disabled` verification state must be resolved under authorized configuration; do not circumvent it.

The form does not collect payment and does not promise a reservation. **A successful POST only means the request was received**, not that a slot was confirmed. Customer data should remain exclusively on Receptionist Core; avoid public analytics or localStorage for PII.

## Business rules
- Commercial: the preexisting Receptionist Core fixed pricing and business logic are the authority. This frontend does not recalculate or override them.
- Residential: property type, scope, rooms, approximate square footage, service frequency, and preferred slot are collected; define corresponding backend service configurations during integration.
- Test Joey's profitability claim from a **private internal report** comparing actual residential revenue with labor, supplies, travel, travel time, and overhead. Do not put private margins in the public site.

## Files
- `index.html`: accessible responsive website + booking request form
- `styles.css`: site colors and layout
- `app.js`: front-end validation, service switching and intake adapter
- `config.js`: public non-secret endpoint settings (blank by default)
- `assets/sotoaljj-logo.png`: unchanged original logo

