"use strict";
// UI adapter boundary only, NOT a Receptionist Core HTTP contract.
// No transport is bundled until the actual public customer contract is approved.
(() => {
  const form = document.querySelector('#consultation-form');
  const controls = document.querySelector('#consultation-fields');
  const loadButton = document.querySelector('#consultation-load');
  const submitButton = document.querySelector('#consultation-submit');
  const refreshButton = document.querySelector('#consultation-refresh');
  const status = document.querySelector('#consultation-status');
  const date = form.elements.consultation_date;
  const time = form.elements.consultation_slot;
  const service = form.elements.consultation_service;
  const size = form.elements.consultation_size;
  const business = form.elements.consultation_business;
  const client = window.SOTO_CONSULTATION_CLIENT;
  const tenantId = window.SOTO_BOOKING_CONFIG?.consultationTenantId;
  const connected = typeof tenantId === 'string' && tenantId.trim() && client &&
    client.tenantId === tenantId && typeof client.getAvailability === 'function' && typeof client.requestConsultation === 'function' && typeof client.getConsultationStatus === 'function';
  const zone = 'America/New_York';
  const dayKey = value => window.SotoBookingGuidance.localTimestamp(Date.parse(value)).slice(0, 10);
  const timeLabel = value => new Intl.DateTimeFormat('en-US', {timeZone:zone,hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date(value));
  const dateLabel = key => new Intl.DateTimeFormat('en-US', {timeZone:zone,weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(new Date(key+'T12:00:00-05:00'));
  const unavailable = 'Online consultation scheduling is temporarily unavailable. No appointment has been requested. Email sotoaljj@gmail.com for help. Your consultation is free; no payment is required.';
  let batch = null, slots = [], version = 0, busy = false, terminal = false, expiryTimer;
  let receiptContext = null;
  function say(message) { status.textContent = message; }
  function resetPicker() {
    clearTimeout(expiryTimer); batch = null; slots = [];
    date.replaceChildren(new Option('No verified dates loaded', ''));
    time.replaceChildren(new Option('Choose an available date first', ''));
    date.disabled = time.disabled = submitButton.disabled = true;
  }
  function shortNotice(slot) { return Date.parse(slot.startsAt)-Date.now() < 48*3600000; }
  function usable(slot, recurring) {
    return slot && typeof slot.id === 'string' && slot.id.length > 0 && slot.id.length <= 200 &&
      typeof slot.startsAt === 'string' && typeof slot.endsAt === 'string' &&
      /(?:Z|[+-]\d{2}:\d{2})$/.test(slot.startsAt) && /(?:Z|[+-]\d{2}:\d{2})$/.test(slot.endsAt) &&
      Date.parse(slot.startsAt) > Date.now() && Date.parse(slot.endsAt) > Date.parse(slot.startsAt) &&
      (!shortNotice(slot) || recurring === true);
  }
  function selectDate() {
    time.replaceChildren(new Option('Select an available time', ''));
    const matching = slots.filter(s => dayKey(s.startsAt) === date.value);
    for (const slot of matching) time.add(new Option(`${timeLabel(slot.startsAt)} – ${timeLabel(slot.endsAt)}${shortNotice(slot)?' · staff approval required':''}`, slot.id));
    time.disabled = !matching.length; submitButton.disabled = true;
  }
  function validateProperty() {
    const home = service.value === 'residential_custom_consultation';
    const propertyType = form.elements.consultation_property_type;
    for(const option of propertyType.options) option.disabled = home ? ['office','retail'].includes(option.value) : ['house','apartment'].includes(option.value);
    if(propertyType.selectedOptions[0].disabled) propertyType.value = home ? 'house' : 'office';
    size.min = home ? '876' : '1';
    size.setCustomValidity(home && Number(size.value) <= 875 ? 'This free residential custom-quote consultation is for properties exceeding 875 square feet.' : '');
    business.required = !home;
    document.querySelector('#consultation-business-label').hidden = home;
    business.disabled = home;
  }
  function invalidate() {
    version++; resetPicker(); validateProperty();
    if (!terminal) say(connected ? 'Check available dates for your selected free consultation. Only returned appointment slots will appear.' : unavailable);
  }
  function expire() {
    version++; resetPicker();
    say('These availability results have expired. Check available dates again before requesting a consultation. No appointment is reserved.');
  }
  function property() {
    return {type:form.elements.consultation_property_type.value,squareFeet:Number(size.value),businessName:business.disabled?'':business.value.trim(),address:form.elements.consultation_address.value.trim(),scope:form.elements.consultation_scope.value.trim()};
  }
  // Bound the UI wait; adapters must honor AbortSignal and reconcile uncertain writes.
  async function call(method, payload) {
    const controller = new AbortController();
    let timer;
    try {
      return await Promise.race([
        Promise.resolve().then(() => client[method](payload, {signal:controller.signal})),
        new Promise((_, reject) => { timer=setTimeout(() => {controller.abort();reject(new Error('unavailable'));},15000); })
      ]);
    } finally { clearTimeout(timer); }
  }
  function showReceipt(response, request, slot) {
    if(!response || response.tenantId!==tenantId || response.service!==request.service || response.slotId!==slot.id || typeof response.requestId!=='string' || !response.requestId || response.feeCents!==0 || response.paymentRequired!==false || !['pending_confirmation','confirmed'].includes(response.status) || (receiptContext && receiptContext.requestId!==response.requestId)) throw new Error('unverified');
    receiptContext = {request,slot,requestId:response.requestId};
    terminal=true;
    const confirmed = response.status==='confirmed' && response.authorizedApproval===true;
    refreshButton.hidden=confirmed; refreshButton.disabled=confirmed;
    if(confirmed) say(`Your free consultation is confirmed for ${dateLabel(dayKey(slot.startsAt))}, ${timeLabel(slot.startsAt)}. Reference: ${response.requestId}. No payment is required.`);
    else say(`Pending Confirmation. Your free consultation request was received. Staff approval is still required; this is not a confirmed appointment. Reference: ${response.requestId}. No payment is required.`);
  }
  refreshButton.addEventListener('click', async () => {
    if(!connected || !receiptContext || busy) return;
    busy=true;refreshButton.disabled=true;
    try { showReceipt(await call('getConsultationStatus',{tenantId,requestId:receiptContext.requestId}),receiptContext.request,receiptContext.slot); }
    catch {say('Pending Confirmation. We could not verify an updated appointment status. Your appointment is not confirmed here. Please email us for help. No payment is required.');refreshButton.disabled=false;}
    finally {busy=false;}
  });
  loadButton.addEventListener('click', async () => {
    if (!connected || busy || terminal) { if(!terminal) say(unavailable); return; }
    validateProperty();
    if (![service,size,form.elements.consultation_property_type].every(input=>input.reportValidity())) return;
    const current = ++version;
    resetPicker(); busy = true; loadButton.disabled = true;
    say('Checking consultation availability… No appointment is reserved.');
    try {
      const response = await call('getAvailability', {tenantId,service:service.value,property:{type:form.elements.consultation_property_type.value,squareFeet:Number(size.value)}});
      if (current !== version) return;
      if (!response || response.verified !== true || response.tenantId !== tenantId || response.service !== service.value || response.feeCents !== 0 || !Array.isArray(response.slots) || !Number.isFinite(Date.parse(response.expiresAt)) || Date.parse(response.expiresAt) <= Date.now()) throw new Error('invalid');
      const ids = new Set();
      slots = response.slots.filter(s=>usable(s,response.verifiedRecurringCustomer)).filter(s=>{if(ids.has(s.id))return false;ids.add(s.id);return true;}).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));
      batch = response;
      const dates = [...new Set(slots.map(s=>dayKey(s.startsAt)))];
      date.replaceChildren(new Option(dates.length?'Select an available date':'No eligible slots returned',''));
      for (const key of dates) date.add(new Option(dateLabel(key),key));
      date.disabled = !dates.length;
      say(dates.length ? `Choose a returned date and time in America/New_York. ${response.verifiedRecurringCustomer===true?'Your verified recurring status allows shorter-notice requests subject to staff approval.':'New-customer requests require at least 48 hours.'} Requesting a slot does not confirm it. No payment is required.` : 'No eligible consultation slots were returned. Try checking again later or email us. No appointment is reserved.');
      expiryTimer = setTimeout(expire, Math.min(Date.parse(response.expiresAt)-Date.now(),2147483647));
    } catch { if(current===version){resetPicker();say(unavailable);} }
    finally {busy=false;loadButton.disabled=!connected||terminal;}
  });
  date.addEventListener('change', selectDate);
  time.addEventListener('change', () => {
    const selected = slots.find(s=>s.id===time.value && dayKey(s.startsAt)===date.value);
    submitButton.disabled = !connected || busy || terminal || !batch || Date.parse(batch.expiresAt)<=Date.now() || !usable(selected,batch.verifiedRecurringCustomer);
  });
  for (const input of [service,size,form.elements.consultation_property_type]) input.addEventListener('input', invalidate);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!connected) {say(unavailable);return;}
    if (busy || terminal) return;
    validateProperty();
    if(!form.reportValidity()) return;
    const slot = slots.find(s=>s.id===time.value && dayKey(s.startsAt)===date.value);
    if(!batch || Date.parse(batch.expiresAt)<=Date.now() || !usable(slot,batch.verifiedRecurringCustomer)){expire();return;}
    const customer = {name:form.elements.consultation_name.value.trim(),email:form.elements.consultation_email.value.trim(),phone:form.elements.consultation_phone.value.trim()};
    if(!customer.name || !customer.phone || !property().address || !property().scope || (!business.disabled && !business.value.trim())) {say('Please complete the customer and property details with more than blank spaces.');return;}
    busy=true;controls.disabled=true;loadButton.disabled=submitButton.disabled=true;
    clearTimeout(expiryTimer);
    const request = {tenantId,service:service.value,customer,property:property(),slot:{id:slot.id,startsAt:slot.startsAt,endsAt:slot.endsAt},contactConsent:form.elements.consultation_consent.checked,idempotencyKey:crypto.randomUUID()};
    say('Sending your free consultation request… This is not an appointment confirmation.');
    try {
      const response = await call('requestConsultation',request);
      showReceipt(response,request,slot);
    } catch {
      // A timed-out write may have reached the engine. Avoid duplicate retries or false receipts.
      terminal=true;
      say('We could not verify whether your request was received. No appointment is confirmed. Please email sotoaljj@gmail.com before trying again. No payment is required.');
    } finally {busy=false;submitButton.disabled=loadButton.disabled=true;}
  });
  controls.disabled = !connected;
  loadButton.disabled = !connected;
  resetPicker();validateProperty();say(connected?'Check available dates for a free consultation. No payment is required.':unavailable);
})();
