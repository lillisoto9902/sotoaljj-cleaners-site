"use strict";
// Planning only: no approved public customer API exists in the reviewed Core contract.
// Never put tenant bearer credentials in browser code.
const config = window.SOTO_BOOKING_CONFIG || {};
const form = document.querySelector('#booking-form');
const feedback = document.querySelector('#form-feedback');
const residential = document.querySelector('#residential-fields');
const commercial = document.querySelector('#commercial-fields');
const dateInput = form.elements.preferred_date;
document.querySelector('#year').textContent = String(new Date().getFullYear());
document.querySelector('#booking-fields').disabled = false;
function updateMinimumDate() {
  const parts = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York', year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const part = type => parts.find(item => item.type === type).value;
  dateInput.min = `${part('year')}-${part('month')}-${part('day')}`;
}
updateMinimumDate();
dateInput.addEventListener('focus', updateMinimumDate);
function updatePriceNote() {
  const size = form.elements.square_feet;
  const tier = form.elements.residential_cleaning_type.value;
  document.querySelector('#residential-price').textContent = !size.value || !size.validity.valid
    ? 'Enter square footage to see whether a custom quote is required.'
    : Number(size.value) > 875
      ? 'A custom quote is required for properties above 875 square feet.'
      : tier === 'standard'
        ? 'Standard cleaning: $100 for properties up to 875 square feet. Your service details and final price must be confirmed before payment.'
        : 'A confirmed quote is needed for this tier. The $100 base price applies only to standard cleaning up to 875 square feet.';
}
function switchService(type) {
  if (!['residential','commercial'].includes(type)) return;
  const isResidential = type === 'residential';
  form.querySelector(`input[name=service_type][value=${type}]`).checked = true;
  residential.hidden = !isResidential;
  residential.disabled = !isResidential;
  commercial.hidden = isResidential;
  commercial.disabled = isResidential;
  feedback.textContent = '';
  updatePriceNote();
}
form.querySelectorAll('input[name=service_type]').forEach(input => input.addEventListener('change', () => switchService(input.value)));
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
  switchService(button.dataset.service);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelector('#booking').scrollIntoView({behavior:reduced ? 'instant':'smooth'});
  form.querySelector(`input[name=service_type][value=${button.dataset.service}]`).focus({preventScroll:true});
}));
form.elements.square_feet.addEventListener('input', updatePriceNote);
form.elements.residential_cleaning_type.addEventListener('change', updatePriceNote);
switchService('residential');
// Guard keyboard and programmatic submits as well. No fetch, storage, or payment simulation.
form.addEventListener('submit', event => {
  event.preventDefault();
  feedback.textContent = 'Online booking is unavailable. No request was sent, no appointment was reserved, and no payment was taken. Please email us to discuss your cleaning needs.';
});
const contact = document.querySelector('#public-contact');
const links = [];
if (typeof config.publicEmail === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.publicEmail)) {
  const a = document.createElement('a'); a.href = `mailto:${config.publicEmail}`; a.textContent = config.publicEmail; links.push(a);
}
if (typeof config.publicPhone === 'string' && /^\+?[\d () .-]{7,30}$/.test(config.publicPhone)) {
  const a = document.createElement('a'); a.href = `tel:${config.publicPhone.replace(/[^+\d]/g,'')}`; a.textContent = config.publicPhone; links.push(a);
}
if (links.length) contact.replaceChildren(...links.map(a => {const p = document.createElement('p'); p.append(a); return p;}));
for (const [key,id] of [['serviceArea','service-area'],['businessHours','business-hours']]) {
  if (typeof config[key] === 'string' && config[key].trim()) document.getElementById(id).textContent = config[key];
}
