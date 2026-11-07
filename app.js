"use strict";
const config = window.SOTO_BOOKING_CONFIG || {};
document.querySelector("#year").textContent = String(new Date().getFullYear());
document.querySelectorAll("[data-service]").forEach(button => button.addEventListener("click", () => { const form=document.querySelector("#cleaning-form"); form.elements.cleaning_type.value=button.dataset.service === "commercial" ? "Commercial" : "Residential"; form.elements.cleaning_type.dispatchEvent(new Event('change',{bubbles:true})); document.querySelector("#booking").scrollIntoView(); form.elements.cleaning_type.focus({preventScroll:true}); }));
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
