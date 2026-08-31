import type { PassportAnswers } from "../types";
import type { ProcessModule, ProcessOfficialLink, ProcessPresentation } from "./types";

const ACTION_LINKS: Record<string, ProcessOfficialLink[]> = {
  "usa-immigration-services": [
    { label: "USCIS online account / case tools", url: "https://my.uscis.gov/" },
    { label: "USCIS Form I-130", url: "https://www.uscis.gov/i-130" },
    { label: "USCIS Form I-539", url: "https://www.uscis.gov/i-539" },
    { label: "USCIS Form I-131", url: "https://www.uscis.gov/i-131" },
    { label: "USCIS Form I-751", url: "https://www.uscis.gov/i-751" },
    { label: "USCIS Form I-829", url: "https://www.uscis.gov/i-829" },
    { label: "CEAC — start / retrieve DS-160", url: "https://ceac.state.gov/genniv/" },
    { label: "CEAC — immigrant visa / DS-260", url: "https://ceac.state.gov/IV/Login.aspx" },
    { label: "DOS Visa Bulletin index", url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html" },
    { label: "DOL FLAG portal", url: "https://flag.dol.gov/" },
    { label: "CBP I-94 portal", url: "https://i94.cbp.dhs.gov/home" }
  ],
  "usa-employment-green-card": [
    { label: "USCIS online account / case tools", url: "https://my.uscis.gov/" },
    { label: "DOL FLAG portal", url: "https://flag.dol.gov/" },
    { label: "DOS Visa Bulletin index", url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html" },
    { label: "CEAC — immigrant visa / DS-260", url: "https://ceac.state.gov/IV/Login.aspx" }
  ],
  "usa-perm-detailed": [
    { label: "DOL FLAG portal", url: "https://flag.dol.gov/" }
  ],
  "usa-i140-detailed": [
    { label: "USCIS online account / case tools", url: "https://my.uscis.gov/" }
  ],
  "usa-i485-detailed": [
    { label: "USCIS online account / case tools", url: "https://my.uscis.gov/" },
    { label: "DOS Visa Bulletin index", url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html" }
  ],
  "usa-nvc-employment-detailed": [
    { label: "CEAC — immigrant visa / DS-260", url: "https://ceac.state.gov/IV/Login.aspx" },
    { label: "DOS Visa Bulletin index", url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html" }
  ],
  "india-us-passport-services": [
    { label: "Government of India Passport Seva — overseas application", url: "https://embassy.passportindia.gov.in/" },
    { label: "VFS India USA — start passport service", url: "https://services.vfsglobal.com/usa/en/ind/apply-passport" },
    { label: "VFS India USA — register / sign in", url: "https://services.vfsglobal.com/usa/en/ind/register" },
    { label: "VFS India USA — book appointment", url: "https://services.vfsglobal.com/usa/en/ind/book-an-appointment" },
    { label: "VFS India USA — postal application registration", url: "https://services.vfsglobal.com/usa/en/ind/Consular-postal-registration" }
  ],
  "india-us-passport-reissue": [
    { label: "Government of India Passport Seva — overseas application", url: "https://embassy.passportindia.gov.in/" },
    { label: "VFS India USA — start passport service", url: "https://services.vfsglobal.com/usa/en/ind/apply-passport" },
    { label: "VFS India USA — register / sign in", url: "https://services.vfsglobal.com/usa/en/ind/register" },
    { label: "VFS India USA — book appointment", url: "https://services.vfsglobal.com/usa/en/ind/book-an-appointment" },
    { label: "VFS India USA — postal application registration", url: "https://services.vfsglobal.com/usa/en/ind/Consular-postal-registration" }
  ]
};

function dedupe(links: ProcessOfficialLink[]): ProcessOfficialLink[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = link.url.replace(/\/$/, "").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function allLinks(process: ProcessModule): ProcessOfficialLink[] {
  return dedupe([...(ACTION_LINKS[process.entry.id] ?? []), ...process.sourceLinks]);
}

function matching(links: ProcessOfficialLink[], patterns: RegExp[]): ProcessOfficialLink[] {
  const selected = links.filter((link) => patterns.some((pattern) => pattern.test(`${link.label} ${link.url}`)));
  return selected.length ? dedupe(selected) : links;
}

function resolveUsImmigration(process: ProcessModule, answers: PassportAnswers): ProcessOfficialLink[] {
  const links = allLinks(process);
  const service = answers.requested_us_immigration_service;

  if (service === "employment_green_card") {
    const stage = answers.employment_green_card_stage;
    if (stage === "perm") return matching(links, [/DOL PERM/i, /FLAG portal/i]);
    if (stage === "i140") return matching(links, [/I-140/i, /USCIS online/i, /Visa Bulletin/i]);
    if (stage === "i485") return matching(links, [/I-485/i, /Visa Availability/i, /Visa Bulletin/i, /I-765/i, /I-131/i, /USCIS online/i]);
    if (stage === "consular") return matching(links, [/National Visa Center/i, /DS-260/i, /Visa Bulletin/i]);
    return matching(links, [/PERM/i, /I-140/i, /I-485/i, /National Visa Center/i, /Visa Bulletin/i]);
  }

  if (service === "family_green_card") {
    const outside = answers.family_beneficiary_location === "outside_us";
    return outside
      ? matching(links, [/I-130/i, /National Visa Center/i, /DS-260/i, /Visa Bulletin/i])
      : matching(links, [/I-130/i, /I-485/i, /Visa Availability/i, /Visa Bulletin/i, /USCIS online/i]);
  }
  if (service === "adjustment_of_status") return matching(links, [/I-485/i, /Visa Availability/i, /Visa Bulletin/i, /USCIS online/i]);
  if (service === "immigrant_visa_consular_processing") return matching(links, [/National Visa Center/i, /DS-260/i, /Visa Bulletin/i]);
  if (service === "nonimmigrant_visa_application") return matching(links, [/DS-160/i]);
  if (service === "h1b_petition") return matching(links, [/I-129/i, /FLAG portal/i, /USCIS online/i]);
  if (service === "h4_status") {
    return answers.h4_action === "visa_abroad"
      ? matching(links, [/DS-160/i])
      : matching(links, [/I-539/i, /USCIS online/i]);
  }
  if (service === "h4_ead" || service === "employment_authorization") return matching(links, [/I-765/i, /USCIS online/i]);
  if (service === "travel_document") return matching(links, [/I-131/i, /USCIS online/i]);
  if (service === "green_card_replace_or_renew") {
    if (answers.green_card_action === "remove_marriage_conditions") return matching(links, [/I-751/i, /USCIS online/i]);
    if (answers.green_card_action === "remove_investor_conditions") return matching(links, [/I-829/i, /USCIS online/i]);
    return matching(links, [/I-90/i, /USCIS online/i]);
  }
  if (service === "naturalization") return matching(links, [/N-400/i, /USCIS online/i]);
  if (service === "change_of_address") return matching(links, [/Change of Address/i, /USCIS online/i]);
  if (service === "i94_record_or_correction") {
    if (answers.i94_issue === "extend_or_change_status") return matching(links, [/I-539/i, /USCIS online/i]);
    return matching(links, [/I-94/i]);
  }
  return links;
}

function resolvePassportServices(process: ProcessModule, answers: PassportAnswers): ProcessOfficialLink[] {
  const links = allLinks(process);
  const service = answers.requested_passport_service;
  if (service === "fresh_ordinary_passport" || service === "passport_reissue" || service === "renewal_short_validity_passport") {
    return matching(links, [/Passport Seva/i, /passport service/i, /register/i, /appointment/i, /postal/i, /Re-issue/i, /Fresh/i]);
  }
  if (service === "emergency_certificate") return matching(links, [/Emergency Certificate/i]);
  if (service === "police_clearance_certificate") return matching(links, [/Police Clearance/i, /register/i, /appointment/i, /postal/i]);
  if (service === "global_entry_background_verification") return matching(links, [/Global Entry/i, /register/i, /appointment/i]);
  if (service === "surrender_indian_passport") return matching(links, [/Surrender/i, /register/i, /appointment/i, /postal/i]);
  if (service === "diplomatic_passport" || service === "official_passport") return matching(links, [/Diplomatic\/Official/i, /Passport Seva/i]);
  if (service === "identity_certificate") return matching(links, [/travel-document types/i, /Passport Seva/i]);
  if (service === "passport_adverse_action_appeal") return matching(links, [/Appeal/i]);
  return links;
}

function resolveEmploymentGreenCard(process: ProcessModule, answers: PassportAnswers): ProcessOfficialLink[] {
  const links = allLinks(process);
  const stage = answers.employment_gc_stage;
  if (stage === "labor_certification") return matching(links, [/Labor Certification/i, /FLAG portal/i]);
  if (stage === "immigrant_petition") return matching(links, [/I-140/i, /USCIS online/i]);
  if (stage === "waiting_for_visa_number") return matching(links, [/Visa Availability/i, /Visa Bulletin/i]);
  if (stage === "adjustment_of_status" || stage === "pending_adjustment") {
    return matching(links, [/I-485/i, /Visa Availability/i, /Visa Bulletin/i, /Supplement J/i, /I-693/i, /I-765/i, /I-131/i, /USCIS online/i]);
  }
  if (stage === "consular_processing") return matching(links, [/National Visa Center/i, /DS-260/i, /Visa Bulletin/i]);
  return links;
}

export function landingOfficialLinks(process: ProcessModule): ProcessOfficialLink[] {
  const links = allLinks(process);
  const preferred = ACTION_LINKS[process.entry.id] ?? [];
  return dedupe([...preferred, ...links]).slice(0, 5);
}

export function resultOfficialLinks(process: ProcessModule, answers: PassportAnswers, presentation: ProcessPresentation): ProcessOfficialLink[] {
  if (process.resolveSourceLinks) return dedupe(process.resolveSourceLinks(answers, presentation));
  if (process.entry.id === "usa-immigration-services") return resolveUsImmigration(process, answers);
  if (process.entry.id === "india-us-passport-services") return resolvePassportServices(process, answers);
  if (process.entry.id === "usa-employment-green-card") return resolveEmploymentGreenCard(process, answers);
  return allLinks(process);
}
