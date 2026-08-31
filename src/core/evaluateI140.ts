import type { PassportAnswers, ResultStatus } from "../types";

export type I140Result = {
  status: ResultStatus;
  category: string;
  classification_code: string;
  petitioner_route: string;
  labor_route: string;
  priority_date_basis: string;
  premium_processing_window: string;
  required_items: string[];
  conditional_items: string[];
  blockers: string[];
  warnings: string[];
  next_step: string;
  sources_verified: string;
};

type Rule = {
  code: string;
  petitionerRoutes: string[];
  laborRoutes: string[];
  jobOfferRequired: boolean;
  premiumWindow: string;
  priorityDateBasis: string;
  factIntensive?: boolean;
};

const VERIFIED = "2026-08-30";

const RULES: Record<string, Rule> = {
  eb1a: {
    code: "E11",
    petitionerRoutes: ["employer", "self_petition"],
    laborRoutes: ["not_required"],
    jobOfferRequired: false,
    premiumWindow: "15 days",
    priorityDateBasis: "Properly filed Form I-140 date",
    factIntensive: true
  },
  eb1b: {
    code: "E12",
    petitionerRoutes: ["employer"],
    laborRoutes: ["not_required"],
    jobOfferRequired: true,
    premiumWindow: "15 days",
    priorityDateBasis: "Properly filed Form I-140 date"
  },
  eb1c: {
    code: "E13",
    petitionerRoutes: ["employer"],
    laborRoutes: ["not_required"],
    jobOfferRequired: true,
    premiumWindow: "45 days after prerequisites are met",
    priorityDateBasis: "Properly filed Form I-140 date"
  },
  eb2_regular: {
    code: "E21 non-NIW",
    petitionerRoutes: ["employer"],
    laborRoutes: ["perm_certified"],
    jobOfferRequired: true,
    premiumWindow: "15 days",
    priorityDateBasis: "Date DOL accepted the labor certification for processing"
  },
  eb2_niw: {
    code: "E21 NIW",
    petitionerRoutes: ["employer", "self_petition"],
    laborRoutes: ["not_required"],
    jobOfferRequired: false,
    premiumWindow: "45 days after prerequisites are met",
    priorityDateBasis: "Properly filed Form I-140 date",
    factIntensive: true
  },
  eb3_skilled: {
    code: "E31",
    petitionerRoutes: ["employer"],
    laborRoutes: ["perm_certified"],
    jobOfferRequired: true,
    premiumWindow: "15 days",
    priorityDateBasis: "Date DOL accepted the labor certification for processing"
  },
  eb3_professional: {
    code: "E32",
    petitionerRoutes: ["employer"],
    laborRoutes: ["perm_certified"],
    jobOfferRequired: true,
    premiumWindow: "15 days",
    priorityDateBasis: "Date DOL accepted the labor certification for processing"
  },
  eb3_other: {
    code: "EW3",
    petitionerRoutes: ["employer"],
    laborRoutes: ["perm_certified"],
    jobOfferRequired: true,
    premiumWindow: "15 days",
    priorityDateBasis: "Date DOL accepted the labor certification for processing"
  }
};

function value(answers: PassportAnswers, key: string, fallback = "not_sure"): string {
  const item = answers[key];
  return typeof item === "string" ? item : fallback;
}

function scheduleARule(preference: string): Rule | null {
  if (preference === "eb2") {
    return {
      code: "E21 Schedule A",
      petitionerRoutes: ["employer"],
      laborRoutes: ["schedule_a"],
      jobOfferRequired: true,
      premiumWindow: "15 days",
      priorityDateBasis: "Properly filed Form I-140 date"
    };
  }
  if (preference === "eb3_skilled") {
    return {
      code: "E31 Schedule A",
      petitionerRoutes: ["employer"],
      laborRoutes: ["schedule_a"],
      jobOfferRequired: true,
      premiumWindow: "15 days",
      priorityDateBasis: "Properly filed Form I-140 date"
    };
  }
  if (preference === "eb3_professional") {
    return {
      code: "E32 Schedule A",
      petitionerRoutes: ["employer"],
      laborRoutes: ["schedule_a"],
      jobOfferRequired: true,
      premiumWindow: "15 days",
      priorityDateBasis: "Properly filed Form I-140 date"
    };
  }
  return null;
}

export function evaluateI140(answers: PassportAnswers): I140Result {
  const category = value(answers, "i140_category");
  const scheduleAPreference = value(answers, "schedule_a_preference");
  const stage = value(answers, "i140_stage", "planning");
  const petitionerRoute = value(answers, "petitioner_route");
  const laborRoute = value(answers, "labor_route");
  const rule = category === "schedule_a" ? scheduleARule(scheduleAPreference) : RULES[category] ?? null;

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

  if (category === "eb4_or_eb5") {
    block("EB-4 and EB-5 are not Form I-140 classifications. Route to the category-specific I-360 or I-526/I-526E process instead.");
  } else if (category === "not_sure" || !rule) {
    confirm("Resolve the exact I-140 classification before choosing a petitioner, labor-certification route, evidence package, or premium-processing window.");
  }

  if (category === "schedule_a" && !rule) {
    confirm("Resolve the underlying Schedule A EB-2 or EB-3 preference before filing Form I-140.");
  }

  if (petitionerRoute === "not_sure") {
    confirm("Confirm whether this classification permits self-petitioning or requires a qualifying U.S. employer.");
  } else if (rule && !rule.petitionerRoutes.includes(petitionerRoute)) {
    block(`The selected petitioner route '${petitionerRoute}' does not match ${rule.code}.`);
  }

  if (laborRoute === "not_sure") {
    confirm("Confirm whether this petition requires certified PERM, Schedule A, or no labor certification.");
  } else if (rule && !rule.laborRoutes.includes(laborRoute)) {
    block(`The selected labor route '${laborRoute}' does not match ${rule.code}.`);
  }

  if (laborRoute === "perm_certified") {
    const validity = value(answers, "perm_certification_valid_for_new_filing");
    requiredItems.push("Attach the valid certified labor certification to the new I-140 filing and keep the I-140 job/classification aligned with the certified case.");
    if (validity === "no") block("The certified PERM is not valid for this new I-140 filing. Do not file using an expired or unusable certification.");
    else if (validity === "not_sure") confirm("Verify that the certified PERM remains valid for this new I-140 filing before submission.");
  }

  if (laborRoute === "schedule_a") {
    requiredItems.push("Use the Schedule A direct-to-USCIS labor-certification package, including the applicable prevailing-wage, Notice-of-Filing, occupation/group and underlying preference evidence.");
    conditionalItems.push("Schedule A is not ordinary DOL PERM; do not substitute a DOL-certified ETA-9089 workflow.");
  }

  const edition = value(answers, "current_i140_edition_confirmed");
  if (edition === "no") block("The filing is not confirmed on the current USCIS Form I-140 edition/instructions.");
  else if (edition === "not_sure") confirm("Confirm the current USCIS Form I-140 edition and filing instructions immediately before filing.");

  const evidence = value(answers, "category_evidence_ready");
  if (evidence === "no") block("The selected I-140 classification evidence package is not ready.");
  else if (evidence === "not_sure") confirm("Confirm that the evidence establishes every element of the selected I-140 classification.");

  if (rule?.factIntensive && evidence === "yes") {
    confirm(category === "eb1a"
      ? "EB-1A requires a fact-intensive final-merits determination even when the threshold evidence framework is assembled."
      : "NIW requires a fact-intensive national-interest-waiver merits analysis in addition to underlying EB-2 eligibility.");
  }

  const jobOffer = value(answers, "job_offer_status");
  const ability = value(answers, "ability_to_pay_status");
  if (rule?.jobOfferRequired) {
    requiredItems.push("Document the qualifying permanent job offer and the petitioner's continuing ability to pay the proffered wage from the priority date until permanent residence.");
    if (jobOffer === "missing" || jobOffer === "not_applicable") block("This classification requires a qualifying job offer, but the job-offer gate is not satisfied.");
    else if (jobOffer === "not_sure") confirm("Confirm the qualifying permanent job offer for this classification.");

    if (ability === "not_ready" || ability === "not_applicable") block("Ability-to-pay evidence is required for this job-offer classification and is not ready.");
    else if (ability === "not_sure") confirm("Confirm the employer's ability-to-pay evidence from the priority date forward.");
    else if (ability === "evidence_ready") conditionalItems.push("Ability-to-pay initial evidence generally includes annual reports, federal tax returns, or audited financial statements; qualifying employers with 100+ workers may use the USCIS-recognized financial-officer statement route.");
  } else {
    conditionalItems.push("This classification does not require a permanent job offer as a classification element; do not add ability-to-pay as a mandatory gate solely because an employer may be involved.");
  }

  const laborQualifications = value(answers, "beneficiary_met_labor_requirements_by_priority_date");
  if (laborRoute === "perm_certified" || laborRoute === "schedule_a") {
    if (laborQualifications === "no" || laborQualifications === "not_applicable") block("The beneficiary does not establish the required labor-certified/Schedule A job qualifications at the required priority-date point.");
    else if (laborQualifications === "not_sure") confirm("Verify that the beneficiary met every required education, training and experience requirement at the required priority-date point.");
  }

  let priorityDateBasis = rule?.priorityDateBasis ?? "Confirm classification-specific priority-date basis";
  if (answers.prior_approved_eb123_petition === true) {
    const issue = value(answers, "priority_date_retention_issue", "other_or_not_sure");
    if (issue === "none_known") {
      priorityDateBasis += "; evaluate retention of the earliest eligible prior approved EB-1/EB-2/EB-3 priority date";
      conditionalItems.push("Priority-date retention does not transfer the old petition's substantive eligibility to this new petition.");
    } else if (["fraud_or_willful_misrepresentation", "labor_cert_revoked_or_invalidated", "material_error"].includes(issue)) {
      block("Do not claim the earlier priority date as retained: the prior petition has a stated regulatory disqualifier that can prevent retention.");
    } else {
      confirm("The earlier petition's revocation/invalidation history must be reviewed before claiming priority-date retention.");
    }
  }

  const premiumWindow = rule?.premiumWindow ?? "Confirm current I-907 eligibility";
  if (answers.request_premium_processing === true) {
    requiredItems.push(`If requesting premium processing, file Form I-907 under the current ${rule?.code ?? "I-140"} eligibility rules. Current designated period: ${premiumWindow}.`);
    warnings.push("Premium processing accelerates USCIS action; it does not waive missing evidence or guarantee approval.");
  }

  if (stage === "rfe") {
    const response = value(answers, "rfe_response_status");
    requiredItems.push("Use the actual RFE as the controlling checklist: answer every stated evidentiary issue and meet the notice deadline.");
    if (response === "deadline_missed") block("The RFE response deadline is recorded as missed. Immediate authoritative/legal review is required.");
    else if (response === "not_sure") confirm("Verify the RFE deadline and whether every requested item will be answered.");
    else confirm("RFE sufficiency is notice- and evidence-specific even when the response is being prepared or was submitted on time.");
  }

  if (stage === "noid") {
    const response = value(answers, "noid_response_status");
    requiredItems.push("Use the actual NOID as the controlling checklist: rebut every stated proposed-denial ground and meet the notice deadline.");
    if (response === "deadline_missed") block("The NOID response deadline is recorded as missed. Immediate authoritative/legal review is required.");
    else if (response === "not_sure") confirm("Verify the NOID deadline and whether every proposed-denial ground will be addressed.");
    else confirm("NOID sufficiency is fact- and notice-specific even when the response is timely.");
  }

  if (stage === "denied") {
    if (answers.denial_notice_reviewed !== true) confirm("Read the complete denial notice before choosing an appeal, motion, or new filing.");
    const action = value(answers, "denial_next_action");
    if (action === "not_sure") confirm("Confirm whether the decision is appealable/motion-eligible, the party with standing, the correct I-290B jurisdiction, and the notice deadline.");
    else confirm(`The selected post-denial action '${action}' must be validated against the actual USCIS decision notice before filing.`);
  }

  if (stage === "revoked_or_withdrawn") {
    confirm("Review the exact withdrawal/revocation basis before relying on the petition for priority-date retention, H-1B-related consequences, or downstream permanent-residence processing.");
  }

  let nextStep = "Complete the missing classification and evidence gates before filing Form I-140.";
  const finalProcessing = value(answers, "intended_final_processing");
  if (stage === "approved") {
    if (finalProcessing === "adjustment_in_us") {
      nextStep = "Check current visa availability and USCIS filing-chart selection, then continue to the employment-based I-485 preflight when eligible.";
    } else if (finalProcessing === "consular_abroad") {
      nextStep = "Confirm the approved petition is routed to Department of State/NVC processing and continue only when NVC/CEAC instructs the case to proceed.";
    } else {
      confirm("Resolve adjustment of status versus consular processing after I-140 approval.");
      nextStep = "Resolve the final permanent-residence processing route and current visa-number availability.";
    }
    warnings.push("I-140 approval does not by itself make an immigrant visa number immediately available.");
  } else if (stage === "filed_pending") {
    nextStep = "Track the I-140 receipt/adjudication, preserve supporting evidence, and respond to any USCIS notice before moving to a downstream filing gate.";
  } else if (stage === "rfe" || stage === "noid") {
    nextStep = "Respond to the actual USCIS notice by its stated deadline; do not substitute a generic evidence list for the notice-specific response.";
  } else if (stage === "denied") {
    nextStep = "Use the denial notice to determine appeal, motion, or new-petition strategy and deadline before taking action.";
  } else if (status === "READY") {
    nextStep = "The objective I-140 preflight gates are satisfied; perform a final current-form/filing-address/fee check and submit the selected petition package.";
  }

  return {
    status,
    category,
    classification_code: rule?.code ?? "Not resolved",
    petitioner_route: petitionerRoute,
    labor_route: laborRoute,
    priority_date_basis: priorityDateBasis,
    premium_processing_window: premiumWindow,
    required_items: requiredItems,
    conditional_items: conditionalItems,
    blockers,
    warnings,
    next_step: nextStep,
    sources_verified: VERIFIED
  };
}
