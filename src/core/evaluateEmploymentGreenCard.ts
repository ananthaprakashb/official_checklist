import type { PassportAnswers, ResultStatus } from "../types";

export type EmploymentGreenCardResult = {
  status: ResultStatus;
  category: string;
  stage: string;
  petition_form: string;
  labor_certification_route: string;
  priority_date: string | null;
  bulletin_month: string;
  dates_for_filing_cutoff: string | null;
  dates_for_filing_eligible: boolean | null;
  final_action_cutoff: string | null;
  final_action_eligible: boolean | null;
  required_items: string[];
  conditional_items: string[];
  blockers: string[];
  warnings: string[];
  next_step: string;
  sources_verified: string;
};

type BulletinGroup = "eb1" | "eb2" | "eb3" | "other_workers" | "eb4" | "eb5_unreserved" | "eb5_set_aside";
type Chargeability = "india" | "china_mainland" | "mexico" | "philippines" | "all_other";
type LaborRoute = "dol_perm" | "schedule_a" | "not_required";
type Cutoff = "C" | "U" | string;

type CategoryRule = {
  bulletinGroup: BulletinGroup | null;
  petitionForm: string;
  expectedLaborRoute: LaborRoute;
  jobOfferBased: boolean;
  detailedI140Flow: boolean;
};

const VERIFIED = "2026-08-30";

const CATEGORY_RULES: Record<string, CategoryRule> = {
  eb1a_extraordinary_ability: { bulletinGroup: "eb1", petitionForm: "I-140", expectedLaborRoute: "not_required", jobOfferBased: false, detailedI140Flow: true },
  eb1b_outstanding_professor_researcher: { bulletinGroup: "eb1", petitionForm: "I-140", expectedLaborRoute: "not_required", jobOfferBased: true, detailedI140Flow: true },
  eb1c_multinational_manager_executive: { bulletinGroup: "eb1", petitionForm: "I-140", expectedLaborRoute: "not_required", jobOfferBased: true, detailedI140Flow: true },
  eb2_advanced_degree_exceptional_ability: { bulletinGroup: "eb2", petitionForm: "I-140", expectedLaborRoute: "dol_perm", jobOfferBased: true, detailedI140Flow: true },
  eb2_national_interest_waiver: { bulletinGroup: "eb2", petitionForm: "I-140", expectedLaborRoute: "not_required", jobOfferBased: false, detailedI140Flow: true },
  eb3_professional: { bulletinGroup: "eb3", petitionForm: "I-140", expectedLaborRoute: "dol_perm", jobOfferBased: true, detailedI140Flow: true },
  eb3_skilled_worker: { bulletinGroup: "eb3", petitionForm: "I-140", expectedLaborRoute: "dol_perm", jobOfferBased: true, detailedI140Flow: true },
  eb3_other_worker: { bulletinGroup: "other_workers", petitionForm: "I-140", expectedLaborRoute: "dol_perm", jobOfferBased: true, detailedI140Flow: true },
  schedule_a: { bulletinGroup: null, petitionForm: "I-140", expectedLaborRoute: "schedule_a", jobOfferBased: true, detailedI140Flow: true },
  eb4_special_immigrant: { bulletinGroup: "eb4", petitionForm: "I-360 or category-specific petition", expectedLaborRoute: "not_required", jobOfferBased: false, detailedI140Flow: false },
  eb5_unreserved: { bulletinGroup: "eb5_unreserved", petitionForm: "I-526 or I-526E", expectedLaborRoute: "not_required", jobOfferBased: false, detailedI140Flow: false },
  eb5_rural_set_aside: { bulletinGroup: "eb5_set_aside", petitionForm: "I-526 or I-526E", expectedLaborRoute: "not_required", jobOfferBased: false, detailedI140Flow: false },
  eb5_high_unemployment_set_aside: { bulletinGroup: "eb5_set_aside", petitionForm: "I-526 or I-526E", expectedLaborRoute: "not_required", jobOfferBased: false, detailedI140Flow: false },
  eb5_infrastructure_set_aside: { bulletinGroup: "eb5_set_aside", petitionForm: "I-526 or I-526E", expectedLaborRoute: "not_required", jobOfferBased: false, detailedI140Flow: false }
};

const BULLETINS: Record<string, Record<"dates_for_filing" | "final_action", Record<BulletinGroup, Record<Chargeability, Cutoff>>>> = {
  august_2026: {
    final_action: {
      eb1: { all_other: "C", china_mainland: "2023-07-01", india: "2022-10-15", mexico: "C", philippines: "C" },
      eb2: { all_other: "C", china_mainland: "2021-09-01", india: "U", mexico: "C", philippines: "C" },
      eb3: { all_other: "2024-09-01", china_mainland: "2022-01-01", india: "2014-01-01", mexico: "2024-09-01", philippines: "2023-08-01" },
      other_workers: { all_other: "2022-04-01", china_mainland: "2019-05-01", india: "2014-01-01", mexico: "2022-04-01", philippines: "2021-12-01" },
      eb4: { all_other: "2022-10-15", china_mainland: "2022-10-15", india: "2022-10-15", mexico: "2022-10-15", philippines: "2022-10-15" },
      eb5_unreserved: { all_other: "C", china_mainland: "2016-12-01", india: "U", mexico: "C", philippines: "C" },
      eb5_set_aside: { all_other: "C", china_mainland: "C", india: "C", mexico: "C", philippines: "C" }
    },
    dates_for_filing: {
      eb1: { all_other: "C", china_mainland: "2023-12-01", india: "2023-12-01", mexico: "C", philippines: "C" },
      eb2: { all_other: "C", china_mainland: "2022-01-01", india: "2015-01-15", mexico: "C", philippines: "C" },
      eb3: { all_other: "C", china_mainland: "2022-01-08", india: "2015-01-15", mexico: "C", philippines: "2024-01-01" },
      other_workers: { all_other: "2022-08-01", china_mainland: "2019-10-01", india: "2015-01-15", mexico: "2022-08-01", philippines: "2022-08-01" },
      eb4: { all_other: "2023-01-01", china_mainland: "2023-01-01", india: "2023-01-01", mexico: "2023-01-01", philippines: "2023-01-01" },
      eb5_unreserved: { all_other: "C", china_mainland: "2017-03-01", india: "2024-05-01", mexico: "C", philippines: "C" },
      eb5_set_aside: { all_other: "C", china_mainland: "C", india: "C", mexico: "C", philippines: "C" }
    }
  },
  september_2026: {
    final_action: {
      eb1: { all_other: "C", china_mainland: "2023-07-01", india: "2022-10-15", mexico: "C", philippines: "C" },
      eb2: { all_other: "C", china_mainland: "2021-09-01", india: "U", mexico: "C", philippines: "C" },
      eb3: { all_other: "2024-09-01", china_mainland: "2022-01-01", india: "2014-01-01", mexico: "2024-09-01", philippines: "2023-08-01" },
      other_workers: { all_other: "2022-04-01", china_mainland: "2019-05-01", india: "2014-01-01", mexico: "2022-04-01", philippines: "2021-12-01" },
      eb4: { all_other: "2022-12-15", china_mainland: "2022-12-15", india: "2022-12-15", mexico: "2022-12-15", philippines: "2022-12-15" },
      eb5_unreserved: { all_other: "C", china_mainland: "2016-12-01", india: "U", mexico: "C", philippines: "C" },
      eb5_set_aside: { all_other: "C", china_mainland: "C", india: "C", mexico: "C", philippines: "C" }
    },
    dates_for_filing: {
      eb1: { all_other: "C", china_mainland: "2023-12-01", india: "2023-12-01", mexico: "C", philippines: "C" },
      eb2: { all_other: "C", china_mainland: "2022-01-01", india: "2015-01-15", mexico: "C", philippines: "C" },
      eb3: { all_other: "C", china_mainland: "2022-01-08", india: "2015-01-15", mexico: "C", philippines: "2024-01-01" },
      other_workers: { all_other: "2022-08-01", china_mainland: "2019-10-01", india: "2015-01-15", mexico: "2022-08-01", philippines: "2022-08-01" },
      eb4: { all_other: "2023-01-01", china_mainland: "2023-01-01", india: "2023-01-01", mexico: "2023-01-01", philippines: "2023-01-01" },
      eb5_unreserved: { all_other: "C", china_mainland: "2017-03-01", india: "2024-05-01", mexico: "C", philippines: "C" },
      eb5_set_aside: { all_other: "C", china_mainland: "C", india: "C", mexico: "C", philippines: "C" }
    }
  }
};

function asString(value: unknown, fallback = "not_sure"): string {
  return typeof value === "string" ? value : fallback;
}

function validIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function cutoffEligibility(cutoff: Cutoff | null, priorityDate: string | null): boolean | null {
  if (!cutoff || !priorityDate || !validIsoDate(priorityDate)) return null;
  if (cutoff === "C") return true;
  if (cutoff === "U") return false;
  return priorityDate < cutoff;
}

function categoryRule(category: string, scheduleAPreference: string): CategoryRule | null {
  const base = CATEGORY_RULES[category];
  if (!base) return null;
  if (category !== "schedule_a") return base;
  if (scheduleAPreference === "eb2") return { ...base, bulletinGroup: "eb2" };
  if (scheduleAPreference === "eb3") return { ...base, bulletinGroup: "eb3" };
  return { ...base, bulletinGroup: null };
}

export function evaluateEmploymentGreenCard(answers: PassportAnswers): EmploymentGreenCardResult {
  const category = asString(answers.employment_category);
  const scheduleAPreference = asString(answers.schedule_a_preference);
  const stage = asString(answers.employment_gc_stage);
  const selectedLaborRoute = asString(answers.labor_certification_route);
  const permStatus = asString(answers.perm_status);
  const petitionStatus = asString(answers.immigrant_petition_status);
  const chargeability = asString(answers.chargeability_country) as Chargeability;
  const bulletinMonth = asString(answers.bulletin_month, "later_or_not_sure");
  const intendedProcessing = asString(answers.intended_final_processing);
  const priorityDate = answers.priority_date_known === true && typeof answers.priority_date === "string" ? answers.priority_date.trim() : null;
  const rule = categoryRule(category, scheduleAPreference);

  let status: ResultStatus = "READY";
  const blockers: string[] = [];
  const warnings: string[] = [];
  const requiredItems: string[] = [];
  const conditionalItems: string[] = [];

  const block = (message: string) => {
    blockers.push(message);
    status = "NOT_READY";
  };
  const confirm = (message: string) => {
    warnings.push(message);
    if (status === "READY") status = "NEEDS_AUTHORITATIVE_CONFIRMATION";
  };

  if (!rule || category === "not_sure") {
    confirm("Resolve the exact employment-based preference/classification before choosing PERM, an immigrant petition, or a Visa Bulletin row.");
  }

  if (category === "schedule_a" && !rule?.bulletinGroup) {
    confirm("Schedule A must still be mapped to the correct EB-2 or EB-3 preference before visa-number availability can be evaluated.");
  }

  const petitionForm = rule?.petitionForm ?? "Confirm category-specific petition";
  const expectedLaborRoute = rule?.expectedLaborRoute ?? "not_required";

  if (selectedLaborRoute === "not_sure") {
    confirm("Confirm whether the selected category uses DOL PERM, Schedule A, or no labor certification before proceeding.");
  } else if (rule && selectedLaborRoute !== expectedLaborRoute) {
    block(`The selected labor-certification route '${selectedLaborRoute}' does not match the selected category. This category expects '${expectedLaborRoute}'.`);
  }

  requiredItems.push(`Use ${petitionForm} for the selected immigrant category; do not substitute a different employment-based petition form.`);

  if (expectedLaborRoute === "dol_perm") {
    requiredItems.push("Employer obtains a prevailing wage determination, completes the required recruitment/Notice of Filing, and files ETA Form 9089 through the DOL PERM process.");
    requiredItems.push("Use the DOL PERM filing date as the employment-based priority date when labor certification is required.");

    if (["immigrant_petition", "waiting_for_visa_number", "adjustment_of_status", "consular_processing", "pending_adjustment"].includes(stage)) {
      if (permStatus !== "certified") {
        block("This category requires PERM, but the labor certification is not recorded as certified. Do not move into the I-140/downstream filing path yet.");
      }
    }

    if (permStatus === "denied") block("The PERM application is denied. The denial/review/refiling path must be resolved before a downstream immigrant petition relies on it.");
    if (permStatus === "expired") block("The PERM certification is recorded as expired. A certified ETA 9089 generally must be submitted with Form I-140 within its 180-day validity period.");
    if (permStatus === "certified" && answers.perm_certification_within_180_days === false && !["pending", "approved"].includes(petitionStatus)) {
      block("The certified PERM is outside the 180-day validity period and the immigrant petition is not already recorded as filed. Do not use the expired certification for a new I-140 filing.");
    }
    if (permStatus === "certified" && answers.perm_certification_within_180_days !== true && !["pending", "approved"].includes(petitionStatus)) {
      confirm("Confirm the certified PERM is still within its 180-day validity period before filing Form I-140.");
    }
  } else if (expectedLaborRoute === "schedule_a") {
    requiredItems.push("Use the Schedule A labor-certification procedure with USCIS rather than routing the case through ordinary DOL PERM processing.");
  } else {
    requiredItems.push("Do not add a DOL PERM step to this category unless an authoritative category-specific rule requires one.");
  }

  if (rule?.detailedI140Flow) {
    if (petitionStatus === "denied") block("The I-140 is denied. The actual USCIS decision notice controls any motion, appeal, refiling, or alternate-basis strategy.");
    if (["waiting_for_visa_number", "consular_processing"].includes(stage) && petitionStatus !== "approved") {
      block("This stage assumes an approved employment-based immigrant petition before proceeding to the normal visa-wait/NVC path.");
    }
    if (stage === "immigrant_petition" && petitionStatus === "not_sure") confirm("Confirm whether Form I-140 has not been filed, is pending, approved, or denied before deciding the next step.");
  } else if (rule) {
    confirm(`${category} is correctly classified as employment-based, but its petition is ${petitionForm}, not the detailed I-140 workflow. Use the category-specific module/source before treating the case as filing-ready.`);
  }

  if (answers.priority_date_known === true && priorityDate && !validIsoDate(priorityDate)) {
    block("Priority date must be entered as YYYY-MM-DD and must be a valid calendar date.");
  }

  if (["waiting_for_visa_number", "adjustment_of_status", "consular_processing", "pending_adjustment"].includes(stage) && answers.priority_date_known !== true) {
    confirm("A priority date is required to evaluate a numerically limited employment-based Visa Bulletin row.");
  }

  if (chargeability === "not_sure") confirm("Confirm the applicant's country of chargeability before using a Visa Bulletin cutoff.");

  const bulletin = BULLETINS[bulletinMonth];
  if (!bulletin) confirm("The selected filing month is outside the bundled August/September 2026 Visa Bulletin data. Recheck the current Department of State bulletin before filing.");

  let datesForFilingCutoff: string | null = null;
  let finalActionCutoff: string | null = null;
  let datesForFilingEligible: boolean | null = null;
  let finalActionEligible: boolean | null = null;

  if (bulletin && rule?.bulletinGroup && chargeability !== "not_sure") {
    datesForFilingCutoff = bulletin.dates_for_filing[rule.bulletinGroup][chargeability];
    finalActionCutoff = bulletin.final_action[rule.bulletinGroup][chargeability];
    datesForFilingEligible = cutoffEligibility(datesForFilingCutoff, priorityDate);
    finalActionEligible = cutoffEligibility(finalActionCutoff, priorityDate);
  }

  if (intendedProcessing === "adjustment_in_us") {
    requiredItems.push("Confirm the applicant is physically present in the United States and otherwise eligible to adjust status before filing Form I-485.");
    requiredItems.push("Use the USCIS-selected employment-based Visa Bulletin chart for the chosen month; the Department of State bulletin alone does not decide which chart USCIS accepts for I-485 filing.");
    requiredItems.push("Prepare the current Form I-485 evidence package and the required Form I-693 medical examination under current USCIS filing instructions.");

    if (answers.physically_present_in_us === false || asString(answers.beneficiary_location) === "outside_us") {
      block("The beneficiary is not physically present in the United States for the selected adjustment-of-status route. Use immigrant-visa/consular processing unless an authoritative exception applies.");
    }
    if (answers.employment_basis_still_valid === false) {
      block("The employment/self-petition basis is no longer confirmed as valid. Resolve the underlying job offer, qualifying work intent, or alternate basis before relying on this adjustment path.");
    }
    if (answers.complex_adjustment_issue === true) {
      confirm("A status-history, unauthorized-employment, admissibility, removal, J-1, or similar issue was flagged. Employment-based adjustment eligibility requires applicant-specific legal review before READY.");
    }

    const chart = asString(answers.uscis_chart_selection, "not_checked");
    if (chart === "not_checked") {
      confirm("The current USCIS monthly chart selection has not been verified. Do not treat the case as I-485 filing-ready yet.");
    } else if (priorityDate && rule?.bulletinGroup && bulletin && chargeability !== "not_sure") {
      const filingEligible = chart === "dates_for_filing" ? datesForFilingEligible : finalActionEligible;
      const cutoff = chart === "dates_for_filing" ? datesForFilingCutoff : finalActionCutoff;
      if (filingEligible === false && stage !== "pending_adjustment") {
        block(`Priority date ${priorityDate} is not earlier than the selected USCIS ${chart === "dates_for_filing" ? "Dates for Filing" : "Final Action"} cutoff (${cutoff}) for this category/chargeability in ${bulletinMonth.replace("_", " ")}.`);
      }
      if (filingEligible === null) confirm("The Visa Bulletin filing gate could not be computed from the supplied priority date/category/chargeability.");
    }

    if (stage !== "pending_adjustment" && answers.i485_status !== "pending" && answers.medical_i693_ready === false) {
      block("The required I-693 medical package is not ready for the planned new I-485 filing under current USCIS filing instructions.");
    }

    if (finalActionEligible === false) {
      warnings.push("The Final Action Date is not currently available for this priority date/category. Even if USCIS permits filing under Dates for Filing, approval must wait for final-action visa availability.");
    }

    if (rule?.jobOfferBased) {
      conditionalItems.push("Form I-485 Supplement J may be required to confirm the bona fide job offer or request INA 204(j) portability; verify the current Supplement J instructions for the filing posture.");
    } else if (["eb1a_extraordinary_ability", "eb2_national_interest_waiver"].includes(category)) {
      conditionalItems.push("USCIS Supplement J instructions state that EB-1A extraordinary-ability and NIW applicants do not file Supplement J merely to confirm a job offer/portability basis.");
    }

    if (answers.request_ead_with_i485 === true) conditionalItems.push("Evaluate Form I-765 under the adjustment-applicant eligibility category and current fee/filing rules; an EAD is a separate benefit from the I-485 itself.");
    if (answers.request_advance_parole_with_i485 === true) conditionalItems.push("Evaluate Form I-131 Advance Parole and the applicant's travel/status consequences before departure; do not assume a pending I-485 alone authorizes travel.");
  }

  if (intendedProcessing === "consular_abroad") {
    requiredItems.push("Use USCIS petition approval/transfer and the Department of State NVC/CEAC immigrant-visa path rather than Form I-485.");
    requiredItems.push("When NVC instructs the case to proceed, complete the applicable fees, DS-260, civil documents, medical examination, and immigrant-visa interview preparation.");

    if (petitionStatus !== "approved") block(`Consular/NVC processing is selected but the underlying ${petitionForm} is not recorded as approved.`);
    if (datesForFilingEligible === false) block(`The priority date is not yet earlier than the ${bulletinMonth.replace("_", " ")} Dates for Filing cutoff (${datesForFilingCutoff}) for this category/chargeability.`);
    if (answers.nvc_case_created === false && petitionStatus === "approved") confirm("The petition is approved but an NVC case is not yet confirmed. Verify USCIS transfer/NVC case creation before starting DS-260 solely from the approval notice.");
    if (answers.nvc_case_created === true && datesForFilingEligible === null) confirm("Confirm current NVC eligibility and the applicable Visa Bulletin row before assembling/submitting the immigrant-visa package.");
    if (finalActionEligible === false) warnings.push("Final Action is not yet available; document collection may proceed when NVC permits, but visa issuance must wait for final-action availability.");
  }

  if (intendedProcessing === "not_sure") confirm("Choose adjustment of status in the United States versus immigrant-visa consular processing before building the final-stage checklist.");

  if (stage === "labor_certification" && expectedLaborRoute === "not_required") {
    block("The selected category does not use ordinary DOL PERM, so a PERM-stage checklist is the wrong branch for this category.");
  }

  if (stage === "pending_adjustment") {
    if (answers.i485_status !== "pending") confirm("The stage is marked pending adjustment, but Form I-485 is not recorded as pending. Confirm the actual receipt/decision state.");
    if (answers.job_changed_or_portability_needed === true && rule?.jobOfferBased) {
      if (answers.i485_pending_180_days === true) {
        conditionalItems.push("For a job-offer-based EB-1/EB-2/EB-3 case, review INA 204(j) same-or-similar portability and file Supplement J when required.");
      } else {
        confirm("A job change/portability issue was flagged before the I-485 is confirmed pending for 180 days. Do not assume INA 204(j) portability applies.");
      }
    }
  }

  if (answers.include_derivatives === true) {
    conditionalItems.push("Each derivative spouse/eligible child needs the applicable separate I-485 or DS-260 and supporting civil/identity/medical evidence; independently review age/CSPA and relationship continuity where relevant.");
  }

  let nextStep = "Resolve the employment category and current stage before collecting a filing package.";
  if (status !== "NOT_READY") {
    if (stage === "planning") nextStep = "Confirm the exact preference category and whether PERM, Schedule A, or no labor certification applies; then move to the correct petition stage.";
    else if (stage === "labor_certification") nextStep = expectedLaborRoute === "dol_perm" ? "Complete the DOL PERM stage through certification, then file the I-140 within the certification validity period." : "Move to the category-specific immigrant petition route; do not force this case through ordinary DOL PERM.";
    else if (stage === "immigrant_petition") nextStep = `Complete or monitor ${petitionForm}; after approval (or concurrent filing where legally permitted), evaluate the priority date and correct final-processing route.`;
    else if (stage === "waiting_for_visa_number") nextStep = "Track the current Visa Bulletin and, for I-485 filing, the USCIS monthly chart selection; do not treat an approved petition as automatic filing eligibility.";
    else if (stage === "adjustment_of_status") nextStep = "If all filing gates are satisfied, assemble the current I-485 package, I-693, petition evidence and any applicable Supplement J/I-765/I-131 filings.";
    else if (stage === "consular_processing") nextStep = "Proceed only through NVC/CEAC instructions for the approved petition and current visa-number stage, then DS-260/civil documents/medical/interview.";
    else if (stage === "pending_adjustment") nextStep = "Maintain the pending I-485 basis, monitor Final Action availability, respond to USCIS notices, and evaluate Supplement J/portability only when its requirements are met.";
  }

  return {
    status,
    category,
    stage,
    petition_form: petitionForm,
    labor_certification_route: expectedLaborRoute,
    priority_date: priorityDate,
    bulletin_month: bulletinMonth,
    dates_for_filing_cutoff: datesForFilingCutoff,
    dates_for_filing_eligible: datesForFilingEligible,
    final_action_cutoff: finalActionCutoff,
    final_action_eligible: finalActionEligible,
    required_items: requiredItems,
    conditional_items: conditionalItems,
    blockers,
    warnings,
    next_step: nextStep,
    sources_verified: VERIFIED
  };
}
