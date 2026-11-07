"use strict";
// Normalized UI contract only. No HTTP transport, credentials, or browser persistence.
(() => {
  const {smsDisclosureVersion:disclosureVersion,policyVersion,smsDisclosureText:disclosureText}=window.SOTO_POLICY_CONFIG;
  const matchingForms=[...document.querySelectorAll('#cleaning-form,#consultation-form')].every(form=>form.dataset.policyVersion===policyVersion && form.dataset.smsDisclosureVersion===disclosureVersion && form.querySelector('.consent span').textContent===disclosureText);
  const tenantId=window.SOTO_BOOKING_CONFIG?.consultationTenantId;
  function connected(client,methods) {return Boolean(window.SOTO_BOOKING_CONFIG.liveSubmissionsEnabled===true && matchingForms && typeof tenantId==='string' && tenantId.trim() && client?.tenantId===tenantId && client.consentContractVersion===disclosureVersion && client.policyVersion===policyVersion && methods.every(name=>typeof client[name]==='function'));}
  function prepare(form) {
    const e=form.elements;
    function validate() {
      e.phone.required=true;e.mobile.required=e.operational_sms_consent.checked;
      e.preferred_contact.setCustomValidity(e.preferred_contact.value==='SMS' && !e.operational_sms_consent.checked?'To decline SMS, select Phone or Email as your preferred contact method.':'');
      e.square_feet.required=e.size_known.value==='Enter square feet';
      e.square_feet.min=form.id==='consultation-form'?'1000':'1';
      e.square_feet.disabled=!e.square_feet.required;
      if(e.square_feet.disabled){e.square_feet.value='';e.square_feet.setCustomValidity('');}
      else if(form.id==='consultation-form')e.square_feet.setCustomValidity(Number(e.square_feet.value)<1000?'Free telephone consultations require at least 1,000 square feet.':'');
      const incompatible=e.cleaning_type.value==='Residential'?['Office','Commercial building']:e.cleaning_type.value==='Commercial'?['House','Apartment']:[];
      for(const option of e.property_type.options)option.disabled=incompatible.includes(option.value);
      if(incompatible.includes(e.property_type.value))e.property_type.value='';
      const commercialConsultation=form.id==='consultation-form' && e.cleaning_type.value==='Commercial';
      e.company.required=e.contact_role.required=commercialConsultation;
      e.mobile.setCustomValidity(e.mobile.required && !/^\+[1-9]\d{7,14}$/.test(e.mobile.value.trim())?'Enter a mobile number in international format, such as +1 followed by the 10-digit US number.':'');
      const phone=e.phone.value.trim(),phoneDigits=phone.replace(/\D/g,'');
      e.phone.setCustomValidity(e.phone.required && (!/^\+?[\d () .-]{7,30}$/.test(phone) || phoneDigits.length<7 || phoneDigits.length>15)?'Enter a usable phone number.':'');
      for(const name of ['full_name','description','street','city','state','company','contact_role','preferred_date'])if(e[name])e[name].setCustomValidity(!e[name].required || e[name].value.trim()?'':'Please complete this field.');
    }
    form.addEventListener('input',validate);form.addEventListener('change',validate);validate();
    const guidance=window.SotoBookingGuidance;
    function displayGuidance() {
      if(form.id!=='cleaning-form')return;
      const priceNote=document.querySelector('#cleaning-price-guidance');
      const tier={'Standard cleaning':'standard','Deep cleaning':'deep'}[e.service_requested.value];
      const priced=e.cleaning_type.value==='Residential' && e.frequency.value==='One-time' && tier && e.size_known.value==='Enter square feet' && e.square_feet.validity.valid?guidance.priceGuidance(tier,e.square_feet.value):null;
      const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
      priceNote.textContent=priced && !priced.customQuote?`${e.service_requested.value}: ${money(priced.baseCents)} + ${money(priced.taxCents)} NJ tax = ${money(priced.totalCents)}. 20% deposit: ${money(priced.depositCents)}; balance due on arrival: ${money(priced.balanceCents)}. This is guidance, not a charge, agreed custom quote or confirmed booking.`:e.cleaning_type.value==='Commercial' || e.cleaning_type.value==='Other' || priced?.customQuote || e.frequency.value && e.frequency.value!=='One-time' || e.service_requested.value && !tier?'An individual quote is required for this requested service. No additional fixed price or discount is assumed.':'Choose a residential standard or deep one-time service and a known size up to 875 square feet to see fixed-price guidance; other requests require review or an individual quote.';
      e.preferred_start.min=guidance.earliestRequest();
      const state=guidance.appointmentGuidance(e.preferred_start.value);
      e.preferred_start.setCustomValidity(e.preferred_start.value && state!=='eligible_for_review'?(state==='too_soon'?'New customers must request a start at least 48 hours away. Verified recurring customers must contact staff for shorter-notice approval.':'Choose a valid, unambiguous time in America/New_York.'): '');
      document.querySelector('#cleaning-date-guidance').textContent=!e.preferred_start.value?'New customers must request a start at least 48 hours away in America/New_York. A timeframe is reviewed by staff; it does not reserve a date. Verified recurring customers seeking shorter notice must contact staff for explicit approval.':state==='eligible_for_review'?'This start meets the displayed 48-hour notice rule only. Verification, approval and actual scheduling are still required. No appointment is reserved.':state==='too_soon'?'This start is less than 48 hours away. Verified recurring customers need explicit staff approval for shorter notice; contact us instead.':'This New York time is invalid or ambiguous because of a clock change. Choose another time.';
    }
    form.addEventListener('input',displayGuidance);form.addEventListener('change',displayGuidance);
    if(e.preferred_start)e.preferred_start.addEventListener('focus',displayGuidance);
    displayGuidance();
    return ()=>{validate();displayGuidance();return form.reportValidity();};
  }
  function payload(form,requestType,idempotencyKey) {
    const e=form.elements,value=name=>e[name]?.value.trim()||'';
    return {tenantId,requestType,idempotencyKey,customer:{name:value('full_name'),email:value('email'),phone:value('phone'),mobile:value('mobile'),preferredContactMethod:value('preferred_contact'),role:value('contact_role'),preferredContactTime:value('preferred_contact_time'),alternativePhone:value('alternative_phone')},cleaningType:value('cleaning_type'),serviceRequested:value('service_requested'),companyName:value('company'),serviceZip:value('zip_code'),description:value('description'),property:{type:value('property_type'),sizeKnown:value('size_known'),squareFeet:value('size_known')==='Enter square feet' && value('square_feet')?Number(value('square_feet')):null,address:{street:value('street'),unit:value('unit'),city:value('city'),state:value('state'),zip:value('zip_code')},bedrooms:value('bedrooms'),bathrooms:value('bathrooms'),workAreas:value('work_areas'),accessConsiderations:value('access_considerations')},preferredDate:value('preferred_date'),preferredStart:value('preferred_start'),timeZone:'America/New_York',frequency:value('frequency'),instructions:value('instructions'),operationalSmsConsent:e.operational_sms_consent.checked,consentDisclosureVersion:disclosureVersion,consentDisclosureText:disclosureText,policyVersion};
  }
  function receipt(response,request) {
    const c=response?.consentReceipt;
    return Boolean(response?.tenantId===tenantId && response.requestType===request.requestType && typeof response.requestId==='string' && response.requestId.trim() && response.durablyAccepted===true && Number.isFinite(Date.parse(response.submittedAt)) && c?.serverRecorded===true && c.operationalSmsConsent===request.operationalSmsConsent && c.disclosureVersion===disclosureVersion && c.disclosureText===disclosureText && c.policyVersion===policyVersion && typeof c.receiptId==='string' && c.receiptId.trim() && Number.isFinite(Date.parse(c.recordedAt)));
  }
  async function call(client,method,data) {
    const controller=new AbortController();let timer;
    try{return await Promise.race([Promise.resolve().then(()=>client[method](data,{signal:controller.signal})),new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('timeout'));},15000);})]);}finally{clearTimeout(timer);}
  }
  window.SotoCustomerRequests=Object.freeze({prepare,payload,receipt,call,connected});
  const form=document.querySelector('#cleaning-form'),valid=prepare(form),client=window.SOTO_CLEANING_CLIENT;
  const status=document.querySelector('#cleaning-status'),button=document.querySelector('#cleaning-submit');
  const ready=connected(client,['requestCleaning']);let sent=false;button.disabled=!ready;
  if(ready)status.textContent='Complete your cleaning inquiry. SMS is optional. Submitting a request does not confirm an appointment.';
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!ready || sent || !valid())return;
    sent=true;button.disabled=true;const request=payload(form,'cleaning_inquiry',crypto.randomUUID());form.querySelector('fieldset').disabled=true;status.textContent='Sending your cleaning request…';
    try{const response=await call(client,'requestCleaning',request);if(!receipt(response,request))throw Error('unverified');status.textContent='Your cleaning service request has been received. Our team will review your information and contact you about the next steps. This is not a confirmed cleaning appointment.';}
    catch{status.textContent='We could not verify whether your request was received. No appointment is confirmed. Please email sotoaljj@gmail.com before trying again.';}
  });
})();
