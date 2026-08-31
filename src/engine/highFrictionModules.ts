import passportJson from "../../data/usa/passport/questionnaire.v1.json";
import ssnJson from "../../data/usa/social-security-card/questionnaire.v1.json";
import itinJson from "../../data/usa/itin/questionnaire.v1.json";
import medicareJson from "../../data/usa/medicare/questionnaire.v1.json";
import familyJson from "../../data/usa/immigration/family-green-card/questionnaire.v1.json";
import type { PassportAnswers, Questionnaire, ResultStatus } from "../types";
import { labelOption } from "../uiText";
import type { ProcessCatalogEntry, ProcessModule, ProcessPresentation } from "./types";

export type GovernmentRouterResult = {
  status: ResultStatus;
  service_family: string;
  title: string;
  required_items: string[];
  conditional_items: string[];
  blockers: string[];
  warnings: string[];
  next_step: string;
  sources_verified: string;
};

const label = (value: string) => LABELS[value] ?? labelOption(value);
const bool = (answers: PassportAnswers, key: string) => answers[key] === true;
const str = (answers: PassportAnswers, key: string) => typeof answers[key] === "string" ? answers[key] as string : "not_sure";
const num = (answers: PassportAnswers, key: string) => typeof answers[key] === "number" ? answers[key] as number : null;

const LABELS: Record<string, string> = {
  first_adult_passport: "First adult passport / DS-11",
  child_under_16: "Child passport under age 16",
  renew_passport: "Passport renewal",
  lost_or_stolen: "Lost or stolen passport",
  damaged_passport: "Damaged passport",
  name_change_or_correction: "Name change / data correction",
  limited_validity_replacement: "Replace limited-validity passport",
  urgent_travel: "Urgent travel passport service",
  travel_within_14_days: "International travel within 14 days",
  foreign_visa_within_28_days: "Need foreign visa within 28 days",
  travel_15_days_or_more: "Travel is 15 days or more away",
  first_number: "First Social Security number",
  replace_card: "Replace Social Security card",
  name_change: "Correct card after legal name change",
  record_correction: "Correct Social Security record",
  citizenship_or_immigration_update: "Update citizenship / immigration status",
  child_card: "Social Security card for a child",
  stolen_number_identity_theft: "Stolen SSN / identity theft",
  us_born_citizen: "U.S.-born citizen",
  foreign_born_us_citizen: "Foreign-born U.S. citizen",
  noncitizen: "Noncitizen",
  new_itin: "New ITIN",
  renew_itin: "Renew ITIN",
  respond_to_notice: "Respond to IRS ITIN notice",
  check_delayed_application: "Check delayed ITIN application",
  attach_federal_return: "Attach U.S. federal tax return",
  claim_documented_exception: "Claim a documented W-7 exception",
  mail_to_irs: "Mail package to IRS",
  irs_tac: "IRS Taxpayer Assistance Center with ITIN services",
  vita_with_itin_service: "VITA site with ITIN services",
  certifying_acceptance_agent: "Certifying Acceptance Agent (CAA)",
  acceptance_agent: "Acceptance Agent",
  initial_part_a_b: "Initial Part A / Part B enrollment",
  add_part_b_after_part_a: "Add Part B after Part A",
  job_coverage_special_enrollment: "Job-based coverage Special Enrollment Period",
  exceptional_conditions_sep: "Exceptional-conditions Special Enrollment Period",
  general_enrollment: "General Enrollment Period",
  medicare_advantage_or_part_d_change: "Medicare Advantage / Part D plan change",
  three_months_before_65: "Within 3 months before turning 65",
  month_turning_65: "Month turning 65",
  three_months_after_65: "Within 3 months after turning 65",
  outside_initial_window: "Outside the initial 7-month window",
  not_age_based_or_not_sure: "Not age-based / not sure",
  us_citizen: "U.S. citizen petitioner",
  lawful_permanent_resident: "Lawful permanent resident petitioner",
  spouse: "Spouse",
  unmarried_child_under_21: "Unmarried child under 21",
  parent: "Parent",
  unmarried_adult_son_or_daughter: "Unmarried son/daughter age 21+",
  married_son_or_daughter: "Married son/daughter",
  sibling: "Brother / sister",
  other_or_not_sure: "Other / not sure",
  inside_us: "Beneficiary inside the United States",
  outside_us: "Beneficiary outside the United States",
  planning: "Planning",
  i130_preparation: "Preparing Form I-130",
  i130_pending: "Form I-130 pending",
  i130_approved_waiting_visa: "I-130 approved / waiting for visa availability",
  adjustment_i485: "Adjustment of Status / I-485",
  nvc_consular: "NVC / consular processing",
  not_sure: "Not sure"
};

function result(service_family: string, title: string, sources_verified = "2026-08-30"): GovernmentRouterResult {
  return { status: "READY", service_family, title, required_items: [], conditional_items: [], blockers: [], warnings: [], next_step: "Continue with the official agency instructions for this resolved branch.", sources_verified };
}
function block(r: GovernmentRouterResult, text: string) { r.status = "NOT_READY"; r.blockers.push(text); }
function confirm(r: GovernmentRouterResult, text: string) { if (r.status === "READY") r.status = "NEEDS_AUTHORITATIVE_CONFIRMATION"; r.warnings.push(text); }

function evaluateUsPassport(a: PassportAnswers): GovernmentRouterResult {
  const need = str(a, "usa_passport_need");
  const r = result(need, label(need));
  if (need === "not_sure") {
    confirm(r, "Resolve the passport service before choosing a form. DS-11, renewal, correction, replacement, and urgent-travel routes are not interchangeable.");
    r.next_step = "Use the State Department passport service pages to identify the correct branch before paying or scheduling.";
    return r;
  }
  if (need === "first_adult_passport") {
    r.required_items.push("Form DS-11 route", "Original or certified U.S. citizenship evidence plus photocopy", "Acceptable photo identification plus photocopy", "Compliant passport photo", "Acceptance-facility or passport-agency submission as applicable");
    r.next_step = "Complete the DS-11 process and apply in person at an authorized acceptance facility, passport agency, or center as applicable.";
  } else if (need === "child_under_16") {
    r.required_items.push("Form DS-11 for the child", "Child citizenship evidence", "Parental/guardian relationship evidence", "Child and required parent/guardian appearance/consent", "Compliant passport photo");
    r.warnings.push("A child under 16 cannot renew using Form DS-82; the child uses an in-person DS-11 process.");
    if (bool(a, "child_parent_consent_issue")) confirm(r, "One or both parents/guardians cannot appear or consent normally. Use the State Department's child-passport parental-consent exceptions and required evidence before applying.");
    r.next_step = "Use the child passport DS-11 instructions and resolve parental consent before the appointment.";
  } else if (need === "renew_passport") {
    if (!bool(a, "renewal_eligibility_confirmed")) {
      block(r, "Do not use the renewal route until DS-82/online-renewal eligibility is confirmed. Ineligible applicants must generally apply again in person using DS-11.");
      r.next_step = "Run the State Department renewal eligibility check; if not eligible, switch to the DS-11 in-person route.";
    } else {
      r.required_items.push("Eligible prior passport", "Current renewal form/channel requirements", "Compliant photo", "Current fee/payment method");
      r.next_step = "Choose the currently eligible State Department renewal channel (online or mail) and follow that channel's instructions.";
    }
  } else if (need === "lost_or_stolen") {
    r.required_items.push("Report the valid passport lost/stolen", "Form DS-11 for replacement", "Citizenship and identity evidence", "In-person replacement application");
    r.warnings.push("A reported lost or stolen passport is invalidated and cannot later be used for travel if found.");
    r.next_step = "Report the passport lost/stolen and use the State Department replacement/DS-11 process.";
  } else if (need === "damaged_passport") {
    r.required_items.push("Damaged passport", "Signed damage explanation where required", "Form DS-11 replacement route", "Citizenship/identity evidence");
    r.next_step = "Use the damaged-passport replacement instructions rather than an ordinary renewal if the passport is materially damaged.";
  } else if (need === "name_change_or_correction") {
    confirm(r, "The correct correction/name-change form depends on the reason for the change, how long ago the passport was issued, and whether the error was made by the State Department.");
    r.required_items.push("Current passport", "Evidence supporting the legal name change or data correction");
    r.next_step = "Use the State Department change/correction decision page to resolve DS-5504, DS-82, or DS-11 before filing.";
  } else if (need === "limited_validity_replacement") {
    confirm(r, "Limited-validity passports have reason-specific replacement instructions. Confirm the annotation/reason and whether additional evidence or fees apply.");
    r.next_step = "Open the State Department limited-validity replacement instructions and follow the route for the passport's limitation reason.";
  } else if (need === "urgent_travel") {
    const window = str(a, "urgent_travel_window");
    if (window === "travel_within_14_days" || window === "foreign_visa_within_28_days") {
      r.required_items.push("Proof of qualifying urgent travel/foreign-visa need", "Passport agency/center appointment", "Underlying DS-11, renewal, or correction package", "Expedite fee where required");
      r.next_step = "Use the State Department passport agency/center appointment route and bring proof of travel.";
    } else if (window === "travel_15_days_or_more") {
      block(r, "The passport-agency urgent-travel route is generally for international travel within 14 days or a foreign visa needed within 28 days. Use routine/expedited service when outside that window.");
      r.next_step = "Use routine or expedited passport service and recheck current processing times.";
    } else {
      confirm(r, "Confirm the actual travel/foreign-visa date before using an urgent passport agency appointment.");
    }
  }
  return r;
}

function evaluateSsn(a: PassportAnswers): GovernmentRouterResult {
  const action = str(a, "ssn_action");
  const r = result(action, label(action));
  if (action === "not_sure") {
    confirm(r, "Choose whether you need a first SSN, replacement card, corrected card/record, status update, child card, or identity-theft response.");
    return r;
  }
  if (action === "replace_card") {
    r.required_items.push("Start with SSA's online replacement-card flow", "Identity evidence if SSA requires an office visit");
    r.warnings.push("A physical replacement card may not be necessary when you already know your SSN.");
    r.next_step = "Start the SSA replacement-card flow online; SSA will determine whether the request can finish online or needs an appointment.";
    return r;
  }
  if (action === "stolen_number_identity_theft") {
    r.required_items.push("Identity-theft report/recovery steps", "SSA card replacement only if the physical card is needed");
    r.next_step = "Use the federal identity-theft reporting route first, then use SSA if a replacement card or record action is also needed.";
    return r;
  }
  if (!bool(a, "ssn_original_or_certified_documents_ready")) {
    block(r, "SSA requires original documents or copies certified by the issuing agency for the applicable evidence. Photocopies/notarized copies are not substitutes where SSA requires originals/certified copies.");
  }
  const status = str(a, "ssn_citizenship_status");
  if (action === "first_number" && bool(a, "ssn_nonwork_driver_license_only")) {
    block(r, "SSA does not issue an SSN solely for the purpose of obtaining a driver's license.");
  }
  if (status === "noncitizen") {
    confirm(r, "Noncitizen SSN eligibility depends on DHS status, work authorization, student/work circumstances, or a qualifying nonwork reason. SSA must confirm the category and evidence.");
    r.conditional_items.push("Current DHS immigration/work authorization evidence such as an I-551, qualifying I-94 with passport/admission evidence, or I-766 as applicable");
  } else if (status === "not_sure") {
    confirm(r, "Resolve citizenship/noncitizen status because SSA document requirements differ by status and card action.");
  }
  if (action === "first_number") r.required_items.push("SSA first-number application", "Identity evidence", "Citizenship or qualifying immigration/work evidence", "Age evidence when required");
  if (action === "name_change") r.required_items.push("Identity evidence", "Legal name-change event evidence", "Citizenship/immigration evidence if SSA requires it");
  if (action === "record_correction") r.required_items.push("Evidence supporting the exact record correction", "Identity evidence");
  if (action === "citizenship_or_immigration_update") r.required_items.push("Current citizenship or DHS immigration-status evidence", "Identity evidence");
  if (action === "child_card") r.required_items.push("Child identity/age/citizenship or immigration evidence", "Parent/guardian identity and relationship/custody evidence as required");
  r.next_step = "Start at SSA's Social Security number & card questionnaire; complete online where allowed and schedule an office/Card Center appointment if SSA directs you there.";
  return r;
}

function evaluateItin(a: PassportAnswers): GovernmentRouterResult {
  const action = str(a, "itin_action");
  const r = result(action, label(action));
  if (action === "respond_to_notice") {
    confirm(r, "The actual CP566, CP567, or other IRS notice controls the missing information, rejection reason, response address, and deadline.");
    r.next_step = "Read the complete IRS notice and respond using its exact instructions; do not resubmit a generic W-7 package without resolving the notice reason.";
    return r;
  }
  if (action === "check_delayed_application") {
    r.required_items.push("Application mailing/submission date", "Any IRS acknowledgment or notice", "Applicant identifying information needed for IRS status inquiry");
    r.warnings.push("IRS currently says to allow about 7 weeks, or 9–11 weeks during peak season or for overseas applications, before escalating a delayed ITIN case.");
    r.next_step = "Compare the elapsed time with IRS's current processing guidance and contact IRS if the published period has passed.";
    return r;
  }
  if (action === "not_sure") {
    confirm(r, "Resolve whether the task is a new ITIN, renewal, notice response, or delayed-application inquiry before preparing Form W-7.");
    return r;
  }
  if (bool(a, "eligible_for_ssn")) block(r, "An ITIN is for a person who needs a U.S. taxpayer identification number but is not eligible for an SSN. Resolve SSN eligibility before filing Form W-7.");
  if (!bool(a, "itin_identity_foreign_status_documents_ready")) block(r, "The ITIN package is not ready without current original or issuing-agency-certified documents proving identity and foreign status, plus any dependent residency evidence that applies.");
  const taxRoute = str(a, "itin_tax_return_route");
  if (taxRoute === "not_sure") confirm(r, "Most W-7 applications accompany a U.S. federal tax return unless a documented IRS exception applies. Resolve the return/exception route before submission.");
  if (taxRoute === "attach_federal_return") r.required_items.push("Completed Form W-7 for each ITIN applicant", "Required U.S. federal income tax return attached to the W-7 package", "Supporting identity/foreign-status documents");
  if (taxRoute === "claim_documented_exception") r.required_items.push("Completed Form W-7", "Evidence satisfying the specific W-7 exception", "Supporting identity/foreign-status documents");
  const method = str(a, "itin_submission_method");
  if (method === "not_sure") confirm(r, "Choose the submission channel: IRS mail, qualifying Taxpayer Assistance Center/VITA service, Certifying Acceptance Agent, or Acceptance Agent. Document handling differs by channel.");
  if (method === "mail_to_irs") r.warnings.push("Mailed original identity documents may remain away from you while IRS processes and returns them; consider certified copies or an in-person authentication option where available.");
  if (method === "certifying_acceptance_agent" || method === "vita_with_itin_service" || method === "irs_tac") r.conditional_items.push("Confirm which applicant documents the selected location/agent is authorized to authenticate, especially for dependents.");
  r.next_step = "Complete Form W-7 using the resolved tax-return/exception and submission method, then follow the current IRS ITIN instructions for document authentication and mailing/in-person handling.";
  return r;
}

function evaluateMedicare(a: PassportAnswers): GovernmentRouterResult {
  const action = str(a, "medicare_action");
  const r = result(action, label(action));
  if (action === "not_sure") {
    confirm(r, "Medicare enrollment depends on whether this is initial eligibility, Part B after Part A, a job-coverage SEP, General Enrollment, an exceptional SEP, or a plan-change event.");
    r.next_step = "Use Medicare's sign-up questionnaire to resolve when and how to enroll before submitting forms.";
    return r;
  }
  if (action === "initial_part_a_b") {
    const timing = str(a, "medicare_initial_timing");
    r.required_items.push("Confirm whether enrollment is automatic or requires an SSA application", "Part A/Part B enrollment choice and desired coverage start");
    if (timing === "outside_initial_window" || timing === "not_age_based_or_not_sure") confirm(r, "This may be outside the ordinary 7-month age-65 Initial Enrollment Period or based on disability/ESRD/another rule. Confirm the applicable enrollment period before signing up.");
    r.next_step = "Use Medicare's sign-up checker, then complete enrollment through Social Security when an application is required.";
  } else if (action === "add_part_b_after_part_a") {
    if (!bool(a, "medicare_has_part_a")) block(r, "This branch is specifically for adding Part B when Part A is already active. Use the initial/other enrollment branch if Part A is not established.");
    r.required_items.push("Form CMS-40B or current SSA online Part B enrollment route", "Evidence for any Special Enrollment Period claimed");
    confirm(r, "Part B can only be added during an applicable enrollment period. Confirm whether Initial, Special, or General Enrollment applies before submission.");
    r.next_step = "Confirm the current Part B enrollment period, then use SSA's online process or CMS-40B as instructed.";
  } else if (action === "job_coverage_special_enrollment") {
    const months = num(a, "medicare_months_since_job_or_group_coverage_ended");
    if (bool(a, "medicare_cobra_or_retiree_only")) block(r, "COBRA or retiree coverage by itself does not qualify as current-employment group health plan coverage for the standard Medicare Part B job-coverage Special Enrollment Period.");
    if (!bool(a, "medicare_current_employment_group_coverage") && months !== null && months > 8) block(r, "The standard job-coverage Part B Special Enrollment Period generally ends 8 months after employment or qualifying group health plan coverage ends, whichever happens first.");
    r.required_items.push("Part B enrollment application", "CMS-L564 employment information or acceptable proof of qualifying job-based coverage");
    r.next_step = "Use the Medicare/SSA job-based coverage Special Enrollment route and obtain CMS-L564 from the employer when required.";
  } else if (action === "exceptional_conditions_sep") {
    confirm(r, "Exceptional-condition Special Enrollment Periods are circumstance-specific. Medicare/SSA must confirm the qualifying event and allowed filing window.");
    r.required_items.push("CMS-10797 or current exceptional-conditions SEP application route", "Evidence of the qualifying exceptional circumstance");
    r.next_step = "Match the circumstance to Medicare's current exceptional-condition SEP rules before submitting CMS-10797.";
  } else if (action === "general_enrollment") {
    r.required_items.push("Confirm the current Jan. 1–Mar. 31 General Enrollment Period", "CMS-40B / current SSA Part B enrollment method");
    r.warnings.push("General Enrollment may result in a late-enrollment penalty if no penalty exception applies; coverage generally starts the month after enrollment.");
    r.next_step = "Confirm the General Enrollment window and any late-enrollment penalty, then enroll through SSA.";
  } else if (action === "medicare_advantage_or_part_d_change") {
    confirm(r, "Medicare Advantage and Part D changes depend on Annual/Open Enrollment or a specific Special Enrollment Period triggered by a life/coverage event.");
    r.next_step = "Use Medicare's plan-change Special Enrollment Period rules and Plan Compare for the exact event and permitted change.";
  }
  return r;
}

function familyClassification(a: PassportAnswers): { code: string; immediate: boolean; valid: boolean; reason?: string } {
  const petitioner = str(a, "family_petitioner_status");
  const rel = str(a, "family_relationship");
  const age21 = bool(a, "family_petitioner_age_21_or_over");
  if (petitioner === "not_sure" || rel === "other_or_not_sure") return { code: "unresolved", immediate: false, valid: false, reason: "Petitioner status or qualifying relationship is unresolved." };
  if (petitioner === "us_citizen") {
    if (rel === "spouse" || rel === "unmarried_child_under_21") return { code: "immediate_relative", immediate: true, valid: true };
    if (rel === "parent") return age21 ? { code: "immediate_relative", immediate: true, valid: true } : { code: "invalid", immediate: false, valid: false, reason: "A U.S. citizen must be at least 21 to petition for a parent." };
    if (rel === "sibling") return age21 ? { code: "F4", immediate: false, valid: true } : { code: "invalid", immediate: false, valid: false, reason: "A U.S. citizen must be at least 21 to petition for a sibling." };
    if (rel === "unmarried_adult_son_or_daughter") return { code: "F1", immediate: false, valid: true };
    if (rel === "married_son_or_daughter") return { code: "F3", immediate: false, valid: true };
  }
  if (petitioner === "lawful_permanent_resident") {
    if (rel === "spouse" || rel === "unmarried_child_under_21") return { code: "F2A", immediate: false, valid: true };
    if (rel === "unmarried_adult_son_or_daughter") return { code: "F2B", immediate: false, valid: true };
    return { code: "invalid", immediate: false, valid: false, reason: "A lawful permanent resident cannot use Form I-130 for a parent, sibling, or married son/daughter under the ordinary family-preference categories." };
  }
  return { code: "unresolved", immediate: false, valid: false, reason: "Family classification is unresolved." };
}

function evaluateFamily(a: PassportAnswers): GovernmentRouterResult {
  const c = familyClassification(a);
  const r = result(c.code, c.code === "immediate_relative" ? "Immediate Relative of U.S. Citizen" : c.code === "unresolved" ? "Family-Based Green Card — classification unresolved" : `Family Preference ${c.code}`);
  if (!c.valid) {
    if (c.code === "invalid") block(r, c.reason ?? "The selected petitioner/relationship combination is not a valid ordinary I-130 family category.");
    else confirm(r, c.reason ?? "Resolve petitioner status and relationship before filing Form I-130.");
    r.next_step = "Resolve the petitioner/beneficiary relationship and petitioner status before preparing Form I-130.";
    return r;
  }
  r.required_items.push("Form I-130 relationship petition", "Evidence of petitioner's U.S. citizenship or permanent-resident status", "Relationship evidence for the selected category");
  r.warnings.push("I-130 approval establishes the qualifying relationship; it does not by itself grant permanent residence or permission to live/work in the United States.");
  const location = str(a, "family_beneficiary_location");
  const stage = str(a, "family_case_stage");
  if (location === "not_sure") confirm(r, "Resolve whether final processing is adjustment of status inside the United States or immigrant-visa processing abroad.");
  if (location === "inside_us") {
    if (!bool(a, "family_inside_us_inspected_admitted_or_paroled")) confirm(r, "The beneficiary's entry/admission/parole and status history may materially affect adjustment eligibility. Do not assume an I-130 allows Form I-485 filing.");
    if (c.immediate) {
      r.conditional_items.push("If otherwise eligible to adjust, an immediate relative of a U.S. citizen may be able to file Form I-485 concurrently with Form I-130.", "Form I-864 financial sponsorship and other adjustment evidence when I-485 is filed");
      r.next_step = stage === "planning" || stage === "i130_preparation" ? "Prepare Form I-130 and separately confirm I-485 adjustment eligibility/concurrent filing." : "Continue the I-130/I-485 path using the current USCIS instructions and notices.";
    } else {
      r.conditional_items.push("Family-preference cases require Visa Bulletin availability before Form I-485 can be filed/approved as applicable.");
      if (stage === "adjustment_i485" || stage === "i130_approved_waiting_visa") confirm(r, `This is a numerically limited ${c.code} preference case. Confirm the current family Visa Bulletin cutoff and USCIS monthly filing chart before I-485 filing.`);
      r.next_step = "File/maintain Form I-130 and monitor the family Visa Bulletin; only move to I-485 when a visa number is available under the current USCIS filing rules.";
    }
  } else if (location === "outside_us") {
    r.conditional_items.push("After I-130 approval and visa availability where required, USCIS/DOS routes the case to NVC for immigrant-visa processing.", "Form I-864 financial sponsorship is generally part of the family immigrant-visa process.");
    if (!c.immediate && (stage === "i130_approved_waiting_visa" || stage === "nvc_consular")) confirm(r, `This ${c.code} preference category is numerically limited. Confirm current Visa Bulletin availability before expecting immigrant-visa scheduling.`);
    r.next_step = stage === "planning" || stage === "i130_preparation" ? "File the correct Form I-130 relationship petition; after approval follow NVC only when DOS/USCIS transfers and visa availability permits." : "Follow the NVC/consular process and current Visa Bulletin for this family category.";
  }
  return r;
}

const questionnaires = {
  passport: passportJson as Questionnaire,
  ssn: ssnJson as Questionnaire,
  itin: itinJson as Questionnaire,
  medicare: medicareJson as Questionnaire,
  family: familyJson as Questionnaire
};

const QUESTIONS: Record<string, Record<string, string>> = {
  "usa-passport": {
    usa_passport_need: "What U.S. passport outcome do you need?",
    renewal_eligibility_confirmed: "Have you confirmed you meet the State Department's current renewal eligibility rules?",
    child_parent_consent_issue: "Is there a parent/guardian consent or appearance issue for the child application?",
    urgent_travel_window: "How soon is the international travel or foreign-visa need?"
  },
  "usa-social-security-card": {
    ssn_action: "What Social Security number/card or record action do you need?",
    ssn_citizenship_status: "What citizenship/immigration status applies to the person whose SSN record is involved?",
    ssn_original_or_certified_documents_ready: "Do you have the original or issuing-agency-certified documents SSA requires for this action?",
    ssn_nonwork_driver_license_only: "Is the only reason for requesting a first SSN to obtain a driver's license?"
  },
  "usa-itin": {
    itin_action: "What ITIN action do you need?",
    eligible_for_ssn: "Is the applicant eligible for a Social Security number?",
    itin_tax_return_route: "Will the W-7 be attached to a federal tax return or use a documented IRS exception?",
    itin_submission_method: "How will the ITIN package and identity documents be submitted/authenticated?",
    itin_identity_foreign_status_documents_ready: "Are current identity and foreign-status documents ready in an IRS-accepted form?"
  },
  "usa-medicare-enrollment": {
    medicare_action: "What Medicare enrollment/change outcome do you need?",
    medicare_initial_timing: "Where are you in relation to the age-65 Initial Enrollment Period?",
    medicare_has_part_a: "Is Medicare Part A already active?",
    medicare_current_employment_group_coverage: "Do you currently have qualifying group health coverage based on current employment?",
    medicare_months_since_job_or_group_coverage_ended: "How many months ago did the employment or qualifying group coverage end?",
    medicare_cobra_or_retiree_only: "Is the coverage only COBRA or retiree coverage rather than current-employment group coverage?"
  },
  "usa-family-green-card": {
    family_petitioner_status: "What is the petitioner's U.S. status?",
    family_relationship: "What is the petitioner's relationship to the beneficiary?",
    family_petitioner_age_21_or_over: "Is the U.S. citizen petitioner at least 21 years old?",
    family_beneficiary_location: "Where will the beneficiary process permanent residence?",
    family_case_stage: "What stage is the family-based case in?",
    family_inside_us_inspected_admitted_or_paroled: "For an inside-U.S. beneficiary, was the person inspected and admitted or paroled on the relevant entry?"
  }
};

const SOURCES: Record<string, Array<{ label: string; url: string }>> = {
  "usa-passport": [
    { label: "State Department — Apply for Adult Passport", url: "https://travel.state.gov/en/passports/apply/adults.html" },
    { label: "State Department — Renew or Replace Passport", url: "https://travel.state.gov/en/passports/renew-replace.html" },
    { label: "State Department — Where to Apply / Urgent Travel", url: "https://travel.state.gov/en/passports/apply/help/where-to-apply.html" },
    { label: "State Department — Passport Forms", url: "https://travel.state.gov/en/passports/how-apply/forms.html" }
  ],
  "usa-social-security-card": [
    { label: "SSA — Social Security number & card", url: "https://www.ssa.gov/number-card" },
    { label: "SSA — First Social Security number", url: "https://www.ssa.gov/number-card/request-number-first-time" },
    { label: "SSA — Replace Social Security card", url: "https://www.ssa.gov/number-card/replace-card" },
    { label: "SSA — Social Security card document advisor", url: "https://www.ssa.gov/ssnumber/ss5doc.htm" }
  ],
  "usa-itin": [
    { label: "IRS — How to apply for an ITIN", url: "https://www.irs.gov/tin/itin/how-to-apply-for-an-itin" },
    { label: "IRS — ITIN supporting documents", url: "https://www.irs.gov/tin/itin/itin-supporting-documents" },
    { label: "IRS — Form W-7 instructions", url: "https://www.irs.gov/instructions/iw7" },
    { label: "IRS — ITIN acceptance agents", url: "https://www.irs.gov/tin/itin/itin-acceptance-agents" }
  ],
  "usa-medicare-enrollment": [
    { label: "Medicare — Prepare to sign up", url: "https://www.medicare.gov/basics/get-started-with-medicare/sign-up" },
    { label: "Medicare — Ready to sign up for Part A & Part B", url: "https://www.medicare.gov/basics/get-started-with-medicare/sign-up/ready-to-sign-up-for-part-a-part-b" },
    { label: "Medicare — When coverage starts", url: "https://www.medicare.gov/basics/get-started-with-medicare/sign-up/when-does-medicare-coverage-start" },
    { label: "Medicare — Enrollment forms", url: "https://www.medicare.gov/basics/forms-publications-mailings/forms/enrollment" }
  ],
  "usa-family-green-card": [
    { label: "USCIS — Form I-130", url: "https://www.uscis.gov/i-130" },
    { label: "USCIS — Form I-485", url: "https://www.uscis.gov/i-485" },
    { label: "USCIS — Visa Availability & Priority Dates", url: "https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates" },
    { label: "DOS — Visa Bulletin", url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html" },
    { label: "DOS — National Visa Center", url: "https://travel.state.gov/content/travel/en/us-visas/immigrate/national-visa-center.html" }
  ]
};

const CONFIG: Record<string, { questionnaire: Questionnaire; eyebrow: string; evaluator: (a: PassportAnswers) => GovernmentRouterResult }> = {
  "usa-passport": { questionnaire: questionnaires.passport, eyebrow: "UNITED STATES · PASSPORT · FIRST APPLICATION → RENEWAL → REPLACEMENT → URGENT TRAVEL", evaluator: evaluateUsPassport },
  "usa-social-security-card": { questionnaire: questionnaires.ssn, eyebrow: "UNITED STATES · SOCIAL SECURITY · NUMBER / CARD / RECORD · CLASSIFY FIRST", evaluator: evaluateSsn },
  "usa-itin": { questionnaire: questionnaires.itin, eyebrow: "UNITED STATES · IRS ITIN · SSN ELIGIBILITY → W-7 ROUTE → DOCUMENT AUTHENTICATION", evaluator: evaluateItin },
  "usa-medicare-enrollment": { questionnaire: questionnaires.medicare, eyebrow: "UNITED STATES · MEDICARE · ENROLLMENT PERIOD → FORMS → SSA HANDOFF", evaluator: evaluateMedicare },
  "usa-family-green-card": { questionnaire: questionnaires.family, eyebrow: "UNITED STATES · FAMILY GREEN CARD · RELATIONSHIP → VISA CATEGORY → I-130 → I-485 OR NVC", evaluator: evaluateFamily }
};

function present(raw: unknown): ProcessPresentation {
  const r = raw as GovernmentRouterResult;
  return {
    status: r.status,
    title: r.title,
    subtitle: `${label(r.service_family)} · Sources verified ${r.sources_verified}`,
    summary: [
      { label: "Resolved branch", value: label(r.service_family) },
      { label: "Routing status", value: r.status === "READY" ? "Correct procedural branch identified" : r.status === "NOT_READY" ? "Selected branch has a concrete blocker" : "Agency/current-rule confirmation required" }
    ],
    blockers: r.blockers,
    warnings: r.warnings,
    requiredItems: r.required_items,
    conditionalItems: r.conditional_items,
    nextStep: r.next_step,
    sourcesVerified: r.sources_verified,
    rawResult: r
  };
}

export function createHighFrictionModule(entry: ProcessCatalogEntry): ProcessModule {
  const cfg = CONFIG[entry.id];
  if (!cfg) throw new Error(`No high-friction module config for ${entry.id}`);
  return {
    entry,
    questionnaire: cfg.questionnaire,
    storageKey: `official-checklist:${cfg.questionnaire.id}:answers`,
    eyebrow: cfg.eyebrow,
    questionLabels: QUESTIONS[entry.id],
    questionHints: {
      usa_passport_need: "Choose the outcome, not a form number. The correct route determines DS-11 vs renewal/correction/replacement and where you may apply.",
      ssn_action: "SSA document requirements change based on whether the request is original, replacement, corrected, or a record/status update.",
      itin_tax_return_route: "Most ITIN applications include a federal tax return unless a specific W-7 exception is documented.",
      medicare_action: "Enrollment timing matters. Missing the applicable Part B window can create a gap and potentially a late-enrollment penalty.",
      family_relationship: "Immediate-relative and family-preference categories have different visa-number and filing rules; classify the relationship before forms and fees."
    },
    labelOption: label,
    sourceLinks: SOURCES[entry.id],
    evaluate: cfg.evaluator,
    present
  };
}

export const HIGH_FRICTION_PROCESS_IDS = Object.keys(CONFIG);
