"use strict";
// Display guidance only. Core must independently validate all prices and times.
(function (root) {
  const HOUR_MS = 60 * 60 * 1000;
  const zone = "America/New_York";
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  });
  function localTimestamp(instant) {
    const values = Object.fromEntries(formatter.formatToParts(new Date(instant)).map(p => [p.type, p.value]));
    return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
  }
  function earliestRequest(now = Date.now()) {
    // Round up to a whole minute so the picker never offers a time inside 48 hours.
    return localTimestamp(Math.ceil((now + 48 * HOUR_MS) / 60000) * 60000);
  }
  function appointmentGuidance(localValue, now = Date.now()) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localValue || "")) return "invalid";
    // Round-trip both NY offsets; reject DST gaps and ambiguous repeated times.
    const matches = ["-04:00", "-05:00"].map(offset => Date.parse(localValue + offset))
      .filter(instant => Number.isFinite(instant) && localTimestamp(instant) === localValue);
    if (matches.length !== 1) return "invalid";
    return matches[0] - now < 48 * HOUR_MS ? "too_soon" : "eligible_for_review";
  }
  function priceGuidance(tier, squareFeet) {
    if (squareFeet === "" || squareFeet == null || !Number.isInteger(Number(squareFeet)) || Number(squareFeet) < 1) return null;
    if (Number(squareFeet) > 875 || !["standard", "deep"].includes(tier)) return { customQuote: true };
    const baseCents = tier === "standard" ? 10000 : 25000;
    // NJ 6.625% = 53/800; round tax to the nearest cent with integer arithmetic.
    const taxCents = Math.floor((baseCents * 53 + 400) / 800);
    const totalCents = baseCents + taxCents;
    const depositCents = Math.floor((totalCents + 2) / 5);
    return { customQuote: false, baseCents, taxCents, totalCents, depositCents, balanceCents: totalCents - depositCents };
  }
  const api = Object.freeze({ localTimestamp, earliestRequest, appointmentGuidance, priceGuidance });
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SotoBookingGuidance = api;
})(typeof window === "object" ? window : globalThis);
