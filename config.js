/* PUBLIC browser configuration. Never place API keys or admin credentials here.
   Set the HTTPS customer-facing public intake URL only after the Receptionist Core
   deployment, tenant routing, CSRF protection and CORS configuration are verified.
   The existing /intake route is known in development, but the public deployment URL
   and exact request schema MUST be confirmed before connecting. */
window.SOTO_BOOKING_CONFIG = {
  apiUrl: "",
  tenantId: "",
  // The API must explicitly support these fields, or adapt mapBookingToApi in app.js.
  requestTimeoutMs: 15000
};
