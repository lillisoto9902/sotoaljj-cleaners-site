# SotoALJJ Cleaners — local owner review

Static website retaining the existing logo, service descriptions and navy/teal/green branding. No build or public runtime dependencies are needed. Serve this directory only; the parent `.qa/` and `owner-review/` directories are private review material.

## Current local state — November 6, 2026

`index.html#booking` contains Request Cleaning Services; `index.html#consultation` contains Schedule a Free Telephone Cleaning Consultation. Both request complete service-property addresses and phone numbers. Independent operational SMS checkboxes default unchecked. An SMS preference without consent requires Phone or Email instead. No ordinary inquiry requires SMS consent.

Submissions, scheduling, payments and provider integrations remain disabled. `consultationTenantId` is empty and `liveSubmissionsEnabled` is false. `consultationFormat` records the owner-approved telephone-only format; it does not assert calling capability. No public Core adapter or HTTP transport is installed. Email fallback is the owner-verified `sotoaljj@gmail.com`. Service coverage in Cumberland County, NJ requires individual property verification. No dedicated business phone or support hours are invented.

## Controlling service rules

Standard residential cleaning up to 875 sq. ft. is $100 before tax; deep cleaning is $250 before tax. Deep scope includes closets, cupboards and laundry when the customer has required working equipment. Homes over 875 sq. ft. and all commercial services require individual quotes. Move-in/out and recurring arrangements require agreed individual quotes unless an existing authorized price applies.

The existing integer-cent helper uses 6.625% NJ tax. Standard: $106.63 total, $21.33 deposit, $85.30 balance. Deep: $266.56 total, $53.31 deposit, $213.25 balance. A 20% deposit secures an approved service booking; the remainder is due upon arrival. No cleaning starts before verified full payment. No payment functionality is enabled.

Cancellations received more than 48 elapsed hours before service qualify for a refundable deposit; exactly 48 hours or less forfeits it, subject to applicable statutory rights. Completed services ordinarily do not qualify for routine refunds; a reasonable return visit may be arranged. New customers require 48 hours' notice. Verified recurring shorter-notice requests require explicit staff approval and availability. Confirmation or a status update is targeted within 24 hours after receipt of a complete, valid booking request through an authorized channel; it is not guaranteed acceptance. Authorization, verification, scheduling and applicable calendar synchronization must succeed. Eligible consultations are telephone only, free and exactly 30 minutes, for residential or commercial properties of at least 1,000 square feet. Unknown size needs clarification before a consultation request. The separate cleaning custom-quote threshold remains over 875 square feet.

## Code and policies

- `app.js`: service-card navigation and verified public details.
- `booking-rules.js`: established integer-cent pricing and DST-aware New York 48-hour guidance; unchanged and non-authoritative.
- `customer-requests.js`: conditional validation, compatible property options, square-footage clearing, restored cleaning price/date guidance, versioned consent payloads and guarded inquiry receipts.
- `consultation.js`: verified returned slots, consistent size context, eligibility, pending/confirmed status and durable-calendar guards.
- `config.js`: display values, approved telephone format, explicit submission-disable flag and shared version/disclosure metadata. Existing PayPal review links remain inactive data.
- `privacy.html` and `terms.html`: complete, readable owner-approved policies generated from the exact `FINAL-*.md` documents in the private parent `owner-review/` directory. Effective date is November 6, 2026; publication is awaiting explicit commit/push/deployment authorization.

Consent disclosure version is `soto-operational-sms-2026-11-06-v2`, now expressly including telephone consultations. Policy version remains `soto-policies-2026-11-06-proposed-final-v1`. Both form metadata and compatibility checks share this mapping. A receipt must preserve the exact v2 disclosure text as well as its version. Superseded disclosure/policy versions cannot satisfy the compatibility gate. The owner approved the November 6, 2026 policy effective date. Publication and any live integration remain separately gated.

The cleaning inquiry retains its required service-date/timeframe field plus an optional specific New York start picker. The picker enforces the displayed new-customer 48-hour rule; a timeframe needs staff review, and a verified shorter-notice exception must go through staff. The restored price guidance quotes only known-size residential standard/deep one-time requests up to 875 sq. ft. Other services and recurring arrangements require individual quotes. Price and date guidance never authorize a booking, payment or eligibility exception.

## Adapter and release boundaries

The `SOTO_CLEANING_CLIENT.requestCleaning` and `SOTO_CONSULTATION_CLIENT.getAvailability/requestConsultation/getConsultationStatus` interfaces remain UI contracts only, not existing public HTTP routes. All accepted receipts require matching server-recorded consent/version evidence. Consultation confirmation also requires authoritative verification, approval and durable synchronized calendar state. Server tenant mapping, customer ownership, CSRF/origin controls, rate limits, privacy, idempotency, actual storage and provider behavior remain separate Core implementation requirements. Never add bearer credentials to public code.

Current focused validation from the parent workspace: `node .qa/final-readiness.cjs` and `python .qa/check-policy-documents.py --final`. Earlier 28 Chrome scenarios and nine pricing/date tests remain historical evidence; their synthetic fixtures use superseded versions and must not be mistaken for the current contract. QA stays outside the public directory and is not genuine transaction evidence.

The private `owner-review/final-release-review/FINAL-REPORT.md` contains full policies, focused evidence, versioned Core handoff, proposed Twilio campaign text and exact release actions for approval. All prior packages are historical. No commit, push, deployment, real booking, SMS, Google write, payment or provider activation is authorized by this local work.
