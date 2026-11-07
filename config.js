/* Owner verified email, service area, and standard/deep pricing: November 5, 2026.
   Hours and Core business-facing phone remain unverified. Never add credentials.
   Booking remains disabled until the actual customer flow is implemented and validated.
   Adding an HTTPS URL cannot enable it. */
window.SOTO_BOOKING_CONFIG = {
  publicEmail: 'sotoaljj@gmail.com',
  publicPhone: '',
  serviceArea: 'Cumberland County, New Jersey, subject to individual property coverage verification.',
  businessHours: '',
  // Set only the verified public tenant identifier when the approved customer
  // adapter is implemented. This is not a bearer token or an employee/calendar ID.
  consultationTenantId: '',
  // Owner-approved telephone-only format; no dedicated line or calling capability is asserted.
  consultationFormat: 'Telephone consultation — 30 minutes — FREE',
  // Owner-approved format does not authorize any live provider or public transport.
  liveSubmissionsEnabled: false,
  // Owner-provided live links for review only. No UI exposes or activates them.
  // Checkout amounts, merchant, booking reconciliation, and legal terms are unverified.
  paypalReviewLinks: {
    standard: {
      deposit: 'https://www.paypal.com/ncp/payment/PQEB9DMBTQLVA',
      balance: 'https://www.paypal.com/ncp/payment/GRC7UTAFLXXU2'
    },
    deep: {
      deposit: 'https://www.paypal.com/ncp/payment/5VZQEBQ82KKAQ',
      balance: 'https://www.paypal.com/ncp/payment/G8FDRRB4AAEYW'
    }
  }
};

// Proposed final policy mapping; release approval does not follow from these identifiers.
window.SOTO_POLICY_CONFIG = Object.freeze({
  policyVersion: 'soto-policies-2026-11-06-proposed-final-v1',
  smsDisclosureVersion: 'soto-operational-sms-2026-11-06-v2',
  smsDisclosureText: 'Yes, I agree to receive automated operational text messages from SotoALJJ LLC (SotoALJJ Cleaners) at the mobile number I provided about my requested cleaning services, telephone consultations, appointment confirmations, reminders, cancellations, rescheduling, and service-related updates. Message frequency varies. Message and data rates may apply. Reply HELP for assistance or STOP to opt out. Consent to receive SMS is optional and is not a condition of purchasing services or submitting a request.'
});
