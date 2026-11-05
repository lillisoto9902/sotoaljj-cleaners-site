"use strict";
const config = window.SOTO_BOOKING_CONFIG || {};
const form = document.querySelector("#booking-form");
const feedback = document.querySelector("#form-feedback");
const status = document.querySelector("#connection-status");
const submitButton = document.querySelector("#submit-booking");
const residential = document.querySelector("#residential-fields");
const commercial = document.querySelector("#commercial-fields");
const isConnected = /^https:\/\//i.test(config.apiUrl || "");
const hasEndpoint = Boolean(config.apiUrl);
document.querySelector("#year").textContent = String(new Date().getFullYear());
const dateInput = form.elements.preferred_date;
const today = new Date();
const year = today.getFullYear(), month = String(today.getMonth() + 1).padStart(2, "0"), day = String(today.getDate()).padStart(2, "0");
dateInput.min = `${year}-${month}-${day}`;
status.textContent = !hasEndpoint ? "Website preview is ready. Booking requests are disabled until the public Receptionist Core endpoint is connected." : isConnected ? "Receptionist Core endpoint configured. Requests require successful server verification before confirmation." : "Invalid booking configuration: the endpoint must use HTTPS.";
if(!isConnected) status.classList.add("offline");
function switchService(type) {
  const isResidential = type === "residential";
  form.querySelector(`input[name=service_type][value=${type}]`).checked = true;
  residential.hidden = !isResidential;
  commercial.hidden = isResidential;
  commercial.querySelector("input[name=business_name]").required = !isResidential;
  feedback.textContent = "";
}
form.querySelectorAll("input[name=service_type]").forEach(input => input.addEventListener("change", () => switchService(input.value)));
document.querySelectorAll("[data-service]").forEach(button => button.addEventListener("click", () => { switchService(button.dataset.service); document.querySelector("#booking").scrollIntoView({behavior:"smooth"}); }));
switchService("residential");
function mapBookingToApi(data) {
  // Candidate shape only. Confirm backend /intake contract before enabling.
  // Do not transmit irrelevant fields from the hidden service-specific section.
  const base = {
    service_type: data.get("service_type"), full_name: data.get("full_name")?.trim(),
    email: data.get("email")?.trim(), phone: data.get("phone")?.trim(),
    zip_code: data.get("zip_code")?.trim(), service_address: data.get("service_address")?.trim(),
    preferred_date: data.get("preferred_date"), preferred_time: data.get("preferred_time"),
    notes: data.get("notes")?.trim() || "", contact_consent: data.has("contact_consent"),
    source: "sotoaljj_cleaners_website"
  };
  if(config.tenantId) base.tenant_id = config.tenantId;
  if(base.service_type === "residential") base.residential = {
    property_type:data.get("property_type"),cleaning_type:data.get("residential_cleaning_type"),
    bedrooms:data.get("bedrooms"),bathrooms:data.get("bathrooms"),
    square_feet:data.get("square_feet") ? Number(data.get("square_feet")) : null,
    frequency:data.get("frequency")
  };
  else base.commercial = { business_name:data.get("business_name")?.trim(),space_type:data.get("business_space_type") };
  return base;
}
form.addEventListener("submit", async event => {
  event.preventDefault(); feedback.classList.remove("success"); feedback.textContent = "";
  if (!form.reportValidity()) return;
  if(!isConnected){ feedback.textContent = "Booking connection is not enabled yet. This website preview cannot transmit your request. No booking was created."; return; }
  const payload = mapBookingToApi(new FormData(form));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(Math.max(Number(config.requestTimeoutMs) || 15000, 1000), 30000));
  submitButton.disabled = true;
  submitButton.textContent = "Sending request…";
  try {
    const response = await fetch(config.apiUrl, {
      method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
      // If Receptionist Core requires cookie+CSRF authorization or preflight, integrate
      // its supported public customer-flow method here rather than bypassing security.
      body: JSON.stringify(payload), signal: controller.signal
    });
    if(!response.ok) throw new Error(`Server returned ${response.status}.`);
    // A 2xx response means request accepted, not that a time slot was confirmed.
    feedback.classList.add("success");
    feedback.textContent = "Your request was received by the booking system. This is not a confirmed appointment; look for a separate confirmation.";
    form.reset();switchService("residential");
    feedback.classList.add("success");
    feedback.textContent = "Your request was received by the booking system. This is not a confirmed appointment; look for a separate confirmation.";
  } catch (error) {
    feedback.textContent = `Request not confirmed as delivered (${error.name === "AbortError" ? "connection timed out" : error.message}). Please do not assume the booking was created. Contact the business before retrying.`;
  } finally { clearTimeout(timeout); submitButton.disabled = false; submitButton.textContent = "Send Booking Request →"; }
});
