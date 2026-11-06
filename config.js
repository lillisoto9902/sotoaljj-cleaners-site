/* Owner verified email, service area, and standard/deep pricing: November 5, 2026.
   Hours and Core business-facing phone remain unverified. Never add credentials.
   Booking remains disabled until the actual customer flow is implemented and validated.
   Adding an HTTPS URL cannot enable it. */
window.SOTO_BOOKING_CONFIG = {
  publicEmail: 'sotoaljj@gmail.com',
  publicPhone: '',
  serviceArea: 'Cumberland County, New Jersey, including ZIP code 08332. Coverage for your address must be confirmed.',
  businessHours: '',
  // Set only the verified public tenant identifier when the approved customer
  // adapter is implemented. This is not a bearer token or an employee/calendar ID.
  consultationTenantId: '',
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
