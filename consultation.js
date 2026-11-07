"use strict";
// Existing Core adapter method boundary; no public HTTP transport is invented.
(() => {
  const api=window.SotoCustomerRequests,form=document.querySelector('#consultation-form'),e=form.elements;
  const valid=api.prepare(form),client=window.SOTO_CONSULTATION_CLIENT;
  const format=window.SOTO_BOOKING_CONFIG?.consultationFormat;
  const ready=format==='Telephone consultation — 30 minutes — FREE' && api.connected(client,['getAvailability','requestConsultation','getConsultationStatus']);
  document.querySelector('#consultation-format').textContent='Telephone consultation — 30 minutes — FREE. The full property address is for service evaluation, not a consultation location. Telephone scheduling and calling capability are not connected on this website.';
  const load=document.querySelector('#consultation-load'),submit=document.querySelector('#consultation-submit'),refresh=document.querySelector('#consultation-refresh'),status=document.querySelector('#consultation-status');
  const zone='America/New_York',tenantId=window.SOTO_BOOKING_CONFIG?.consultationTenantId;
  const day=value=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
  const time=value=>new Intl.DateTimeFormat('en-US',{timeZone:zone,hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date(value));
  const dateLabel=value=>new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'long',day:'numeric'}).format(new Date(value));
  let slots=[],batch=null,revision=0,busy=false,terminal=false,context=null,timer;
  const say=message=>{status.textContent=message;};
  const service=()=>e.cleaning_type.value==='Residential'?'residential_custom_consultation':e.cleaning_type.value==='Commercial'?'commercial_custom_consultation':'other_consultation';
  function eligible(slot,returning) {
    return Boolean(slot && typeof slot.id==='string' && slot.id && [slot.startsAt,slot.endsAt].every(v=>typeof v==='string' && /(?:Z|[+-]\d{2}:\d{2})$/.test(v) && Number.isFinite(Date.parse(v))) && Date.parse(slot.startsAt)>Date.now() && Date.parse(slot.endsAt)-Date.parse(slot.startsAt)===1800000 && (Date.parse(slot.startsAt)-Date.now()>=172800000 || returning===true));
  }
  function reset() {
    clearTimeout(timer);batch=null;slots=[];submit.disabled=true;
    e.consultation_date.replaceChildren(new Option('No verified dates loaded',''));e.consultation_slot.replaceChildren(new Option('Choose an available date first',''));e.consultation_date.disabled=e.consultation_slot.disabled=true;
  }
  for(const name of ['cleaning_type','property_type','size_known','square_feet'])e[name].addEventListener('input',()=>{revision++;reset();});
  e.consultation_date.addEventListener('change',()=>{
    e.consultation_slot.replaceChildren(new Option('Select an available time',''));
    for(const slot of slots.filter(s=>day(s.startsAt)===e.consultation_date.value))e.consultation_slot.add(new Option(time(slot.startsAt),slot.id));
    e.consultation_slot.disabled=false;submit.disabled=true;
  });
  e.consultation_slot.addEventListener('change',()=>{submit.disabled=!ready || busy || terminal || !batch || Date.parse(batch.expiresAt)<=Date.now() || !slots.some(s=>s.id===e.consultation_slot.value && day(s.startsAt)===e.consultation_date.value);});
  function policyValid() {
    if(e.size_known.value!=='Enter square feet'){say('Free telephone consultations require at least 1,000 square feet. Email sotoaljj@gmail.com to clarify eligibility if you are unsure of the property size.');return false;}
    e.square_feet.required=true;
    e.square_feet.setCustomValidity(Number(e.square_feet.value)<1000?'Free telephone consultations require at least 1,000 square feet.':'');
    if(e.cleaning_type.value==='Other'){say('This consultation type requires an authorized service-policy decision. Please email sotoaljj@gmail.com.');return false;}
    return e.cleaning_type.reportValidity() && e.property_type.reportValidity() && e.size_known.reportValidity() && e.square_feet.reportValidity();
  }
  e.cleaning_type.addEventListener('change',()=>{e.square_feet.required=e.size_known.value==='Enter square feet';});
  load.disabled=!ready;
  load.addEventListener('click',async()=>{
    if(!ready || busy || terminal || !policyValid())return;
    reset();const current=++revision;busy=true;load.disabled=true;say('Checking consultation availability… No appointment is reserved.');const requestedService=service();
    try{
      const response=await api.call(client,'getAvailability',{tenantId,service:requestedService,property:{type:e.property_type.value,sizeKnown:e.size_known.value,squareFeet:e.size_known.value==='Enter square feet'?Number(e.square_feet.value):null}});
      if(current!==revision)return;
      if(response?.verified!==true || response.tenantId!==tenantId || response.service!==requestedService || response.feeCents!==0 || response.durationMinutes!==30 || !Array.isArray(response.slots) || !(Date.parse(response.expiresAt)>Date.now()))throw Error('unverified');
      const ids=new Set();slots=response.slots.filter(s=>eligible(s,response.verifiedRecurringCustomer)).filter(s=>{if(ids.has(s.id))return false;ids.add(s.id);return true;});batch=response;
      e.consultation_date.replaceChildren(new Option('Select an available date',''));
      for(const key of [...new Set(slots.map(s=>day(s.startsAt)))].sort())e.consultation_date.add(new Option(key,key));
      e.consultation_date.disabled=!slots.length;say(slots.length?'Choose an available date and time in America/New_York. Your appointment is not yet confirmed.':'No eligible consultation times are available. Please check again later.');
      timer=setTimeout(()=>{revision++;reset();say('Availability expired. Please check available dates again.');},Math.min(Date.parse(response.expiresAt)-Date.now(),2147483647));
    }catch{if(current===revision){reset();say('Consultation availability could not be verified. No appointment is reserved.');}}
    finally{busy=false;load.disabled=!ready||terminal;}
  });
  function show(response,request,slot) {
    if(response?.status==='unavailable' && response.tenantId===tenantId && response.service===request.service && response.slotId===slot.id && response.definitivelyRejected===true && !context){terminal=false;form.querySelector('fieldset').disabled=false;load.disabled=false;reset();say('That appointment time is no longer available. Please choose another time.');return;}
    if(!api.receipt(response,request) || response.service!==request.service || response.slotId!==slot.id || response.feeCents!==0 || response.paymentRequired!==false || !['verification_pending','pending_confirmation','confirmed'].includes(response.status) || (context && response.requestId!==context.requestId))throw Error('unverified');
    context={request,slot,requestId:response.requestId};
    if(response.status==='verification_pending'){refresh.hidden=false;say('Please complete the required contact verification to continue.');return;}
    const confirmed=response.status==='confirmed' && response.authorizedApproval===true && response.contactVerificationComplete===true && response.calendarSync?.durable===true && response.calendarSync?.status==='synchronized' && response.startsAt===slot.startsAt && response.endsAt===slot.endsAt;
    say(confirmed?`Your consultation is confirmed for ${dateLabel(slot.startsAt)} at ${time(slot.startsAt)}.`:'Your consultation request is being processed. Your appointment is not yet confirmed.');refresh.hidden=confirmed;
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!ready || busy || terminal || !policyValid() || !valid())return;
    const slot=slots.find(s=>s.id===e.consultation_slot.value && day(s.startsAt)===e.consultation_date.value);
    if(!batch || Date.parse(batch.expiresAt)<=Date.now() || !eligible(slot,batch.verifiedRecurringCustomer)){reset();say('That appointment time is no longer available. Please choose another time.');return;}
    const request={...api.payload(form,'consultation',crypto.randomUUID()),service:service(),consultationFormat:format,slot:{...slot}};
    busy=terminal=true;clearTimeout(timer);form.querySelector('fieldset').disabled=true;load.disabled=submit.disabled=true;say('Your consultation request is being processed. Your appointment is not yet confirmed.');
    try{show(await api.call(client,'requestConsultation',request),request,slot);}
    catch{say('We could not verify whether your request was received. No appointment is confirmed. Please email sotoaljj@gmail.com before trying again.');}
    finally{busy=false;}
  });
  refresh.addEventListener('click',async()=>{
    if(!context || busy)return;busy=true;refresh.disabled=true;
    try{show(await api.call(client,'getConsultationStatus',{tenantId,requestId:context.requestId}),context.request,context.slot);}
    catch{say('We could not verify an updated status. Your appointment is not confirmed here. Please email sotoaljj@gmail.com.');}
    finally{busy=false;refresh.disabled=false;}
  });
  if(ready)say('Check available dates for your free consultation. SMS is optional.');reset();
})();
