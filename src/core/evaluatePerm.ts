import type { PassportAnswers, ResultStatus } from "../types";

export type PermPreflightResult = {
  status: ResultStatus;
  stage: string;
  occupation_route: string;
  pwd_status: string;
  priority_date: string | null;
  eta9089_filing_date: string | null;
  pwd_window_status: string;
  recruitment_window_status: string;
  notice_window_status: string;
  audit_status: string;
  determination_status: string;
  required_items: string[];
  conditional_items: string[];
  blockers: string[];
  warnings: string[];
  next_step: string;
  sources_verified: string;
};

const VERIFIED = "2026-08-30";

const STAGE_RANK: Record<string, number> = {
  planning: 0,
  prevailing_wage: 1,
  recruitment: 2,
  eta9089_ready: 3,
  eta9089_filed: 4,
  audit: 5,
  supervised_recruitment: 5,
  certified: 6,
  denied: 6,
  reconsideration_or_balca: 7
};

function valueString(answers: PassportAnswers, key: string, fallback = "not_sure"): string {
  const value = answers[key];
  return typeof value === "string" ? value.trim() : fallback;
}

function valueBoolean(answers: PassportAnswers, key: string): boolean | null {
  const value = answers[key];
  return typeof value === "boolean" ? value : null;
}

function valueNumber(answers: PassportAnswers, key: string): number | null {
  const value = answers[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseIso(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return null;
  return parsed;
}

function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function inclusiveDays(start: Date, end: Date): number {
  return daysBetween(start, end) + 1;
}

function isWithin(date: Date, start: Date, end: Date): boolean {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

function prefilingDays(date: Date, filing: Date): number {
  return daysBetween(date, filing);
}

function inThirtyToOneEightyWindow(date: Date, filing: Date): boolean {
  const days = prefilingDays(date, filing);
  return days >= 30 && days <= 180;
}

function isSunday(date: Date): boolean {
  return date.getUTCDay() === 0;
}

function nextStepFor(stage: string): string {
  switch (stage) {
    case "planning":
      return "Confirm the standard PERM occupation route and obtain a prevailing wage determination before starting the filing calendar.";
    case "prevailing_wage":
      return "Receive a valid NPWC prevailing wage determination, then begin the correct prefiling recruitment while the PWD is valid.";
    case "recruitment":
      return "Complete the mandatory recruitment, Notice of Filing, professional additional steps when applicable, layoff review, and recruitment report before choosing an ETA-9089 filing date.";
    case "eta9089_ready":
      return "Recheck every recruitment date and PWD window against the planned filing date, then file ETA-9089 in FLAG only after all prefiling gates pass.";
    case "eta9089_filed":
      return "Preserve the complete five-year audit file and monitor FLAG for analyst review, audit, supervised recruitment, certification, or denial.";
    case "audit":
      return "Respond to the exact audit letter by its stated deadline with the requested supporting record; do not assume an extension unless the Certifying Officer grants it.";
    case "supervised_recruitment":
      return "Follow the Certifying Officer's supervised-recruitment instructions exactly, obtain advertisement approval before publication, and meet each directed response deadline.";
    case "certified":
      return "File the certified ETA-9089 with the correct Form I-140 petition within the 180-calendar-day certification validity period.";
    case "denied":
      return "Use the Final Determination to decide between a timely reconsideration/BALCA review route and a permitted new filing; the review request has a 30-day deadline.";
    case "reconsideration_or_balca":
      return "Track the reconsideration/BALCA record and do not file a prohibited same-occupation/same-worker duplicate while review is pending.";
    default:
      return "Resolve the current PERM stage before proceeding.";
  }
}

export function evaluatePerm(answers: PassportAnswers): PermPreflightResult {
  const stage = valueString(answers, "perm_stage");
  const stageRank = STAGE_RANK[stage] ?? -1;
  const occupationRoute = valueString(answers, "perm_occupation_route");
  const pwdStatus = valueString(answers, "pwd_status");
  const pwdKnown = valueBoolean(answers, "pwd_validity_known");
  const pwdFromRaw = valueString(answers, "pwd_valid_from", "");
  const pwdToRaw = valueString(answers, "pwd_valid_to", "");
  const pwdFrom = parseIso(pwdFromRaw);
  const pwdTo = parseIso(pwdToRaw);
  const recruitmentStarted = valueBoolean(answers, "recruitment_started");
  const firstRecruitmentRaw = valueString(answers, "first_recruitment_date", "");
  const firstRecruitment = parseIso(firstRecruitmentRaw);
  const filingRaw = valueString(answers, "eta9089_filing_date", "");
  const filingDate = parseIso(filingRaw);

  const blockers: string[] = [];
  const warnings: string[] = [];
  const requiredItems: string[] = [];
  const conditionalItems: string[] = [];

  let pwdWindowStatus = "Not resolved";
  let recruitmentWindowStatus = "Not resolved";
  let noticeWindowStatus = "Not resolved";
  let auditStatus = stage === "audit" ? valueString(answers, "audit_response_status") : "Not applicable";
  let determinationStatus = stage === "certified" ? "Certified" : stage === "denied" ? "Denied" : stage === "reconsideration_or_balca" ? "Review pending" : "Pending / not final";

  const block = (message: string) => blockers.push(message);
  const confirm = (message: string) => warnings.push(message);

  if (stageRank < 0) confirm("Resolve the current PERM stage before using a stage-specific checklist.");

  if (["college_teacher_special_handling", "professional_athlete", "schedule_a"].includes(occupationRoute)) {
    block("The selected occupation route does not use this standard 20 CFR 656.17 professional/nonprofessional PERM calendar. Use the category-specific special-handling, athlete, or Schedule A workflow instead.");
  } else if (occupationRoute === "not_sure") {
    confirm("Confirm whether the job is a standard professional or nonprofessional PERM occupation before applying the recruitment calendar.");
  }

  requiredItems.push("Use the actual permanent, full-time job opportunity, minimum requirements, worksite information, and offered wage consistently from PWD through recruitment and ETA-9089.");
  requiredItems.push("Obtain and retain the NPWC prevailing wage determination for the job opportunity; the offered wage may not be below the applicable prevailing wage.");

  if (stageRank >= STAGE_RANK.recruitment && ["not_requested", "pending"].includes(pwdStatus)) {
    block("Recruitment is recorded as started, but the prevailing wage determination is not recorded as issued. Standard PERM requires a valid PWD before ETA-9089 filing and the recruitment/PWD validity rules must be satisfied.");
  }

  if (pwdKnown === true) {
    if (!pwdFrom || !pwdTo || pwdFrom.getTime() > pwdTo.getTime()) {
      block("The PWD validity dates are missing or invalid. Enter ISO dates in YYYY-MM-DD format and ensure the validity start is not after the end date.");
    } else {
      const recruitmentInside = firstRecruitment ? isWithin(firstRecruitment, pwdFrom, pwdTo) : false;
      const filingInside = filingDate ? isWithin(filingDate, pwdFrom, pwdTo) : false;
      if (recruitmentInside || filingInside) {
        pwdWindowStatus = recruitmentInside ? "Recruitment began during PWD validity" : "ETA-9089 filing falls during PWD validity";
      } else if (stageRank >= STAGE_RANK.recruitment && (firstRecruitment || filingDate)) {
        pwdWindowStatus = "Outside PWD validity";
        block("Neither the recorded beginning of recruitment nor the ETA-9089 filing date falls within the recorded PWD validity period.");
      } else {
        confirm("The PWD dates are known, but a recruitment-start or filing date is still needed to verify 20 CFR 656.40(c). ");
      }
    }
  } else if (stageRank >= STAGE_RANK.recruitment) {
    confirm("Confirm the PWD validity start/end dates so the engine can verify that recruitment or filing began during the PWD validity period.");
  }

  const needsCompletedRecruitment = stageRank >= STAGE_RANK.eta9089_ready;
  if (needsCompletedRecruitment && recruitmentStarted !== true) {
    block("ETA-9089 is at the ready/filed or later stage, but prefiling recruitment is not recorded as started/completed.");
  }

  if (recruitmentStarted === true) {
    if (!firstRecruitment) confirm("Enter a valid first recruitment date (YYYY-MM-DD) so the PWD-validity start can be checked.");

    const jobOrderStart = parseIso(valueString(answers, "swa_job_order_start_date", ""));
    const jobOrderEnd = parseIso(valueString(answers, "swa_job_order_end_date", ""));
    const ad1 = parseIso(valueString(answers, "newspaper_ad_1_date", ""));
    const ad2 = parseIso(valueString(answers, "newspaper_ad_2_date", ""));
    const adRoute = valueString(answers, "newspaper_recruitment_route");

    if (needsCompletedRecruitment) {
      if (!jobOrderStart || !jobOrderEnd) {
        block("A completed standard PERM filing requires the 30-day State Workforce Agency job-order dates.");
      } else {
        if (jobOrderStart.getTime() > jobOrderEnd.getTime()) block("The SWA job-order start date is after its end date.");
        if (inclusiveDays(jobOrderStart, jobOrderEnd) < 30) block("The SWA job order is shorter than the required 30-day period.");
      }
    }

    if (filingDate) {
      const datedChecks: Array<[string, Date | null]> = [];
      if (jobOrderStart) datedChecks.push(["SWA job-order start", jobOrderStart]);
      if (jobOrderEnd) datedChecks.push(["SWA job-order end", jobOrderEnd]);

      if (adRoute === "two_sunday_ads") {
        if (!ad1 || !ad2) {
          block("Two newspaper advertisement dates are required for the selected two-Sunday-ad route.");
        } else {
          if (ad1.getTime() === ad2.getTime()) block("The two newspaper advertisements must be on different Sundays.");
          if (!isSunday(ad1) || !isSunday(ad2)) block("The selected standard newspaper route requires both recorded advertisements to be Sunday editions.");
          datedChecks.push(["Sunday advertisement 1", ad1], ["Sunday advertisement 2", ad2]);
        }
      } else if (adRoute === "professional_journal_substitution") {
        const journal = parseIso(valueString(answers, "professional_journal_ad_date", ""));
        if (occupationRoute !== "professional") block("A professional-journal substitution was selected for a nonprofessional occupation.");
        if (valueBoolean(answers, "journal_substitution_job_qualifies") !== true) block("The professional-journal substitution is not recorded as meeting the advanced-degree/experience and normal-journal-use conditions.");
        if (!ad1 || !journal) block("The journal-substitution route requires one qualifying Sunday advertisement and the professional-journal advertisement date.");
        if (ad1 && !isSunday(ad1)) block("The remaining newspaper advertisement in the journal-substitution route must be a Sunday edition.");
        if (ad1) datedChecks.push(["Sunday advertisement", ad1]);
        if (journal) datedChecks.push(["Professional-journal advertisement", journal]);
      } else if (adRoute === "rural_no_sunday_edition") {
        confirm("A rural no-Sunday newspaper route is selected. Confirm the exact widest-circulation edition and documentation under the current regulation before filing.");
        if (ad1) datedChecks.push(["Rural newspaper advertisement 1", ad1]);
        if (ad2) datedChecks.push(["Rural newspaper advertisement 2", ad2]);
      } else if (needsCompletedRecruitment) {
        confirm("Resolve the newspaper/professional-journal recruitment route before filing ETA-9089.");
      }

      let allWindowChecksPass = true;
      for (const [label, date] of datedChecks) {
        if (date && !inThirtyToOneEightyWindow(date, filingDate)) {
          allWindowChecksPass = false;
          block(`${label} falls outside the 30-to-180-day prefiling window for the recorded ETA-9089 filing date.`);
        }
      }
      if (datedChecks.length > 0 && allWindowChecksPass) recruitmentWindowStatus = "Dated mandatory recruitment is within 30–180 days";
    } else if (needsCompletedRecruitment) {
      confirm("Enter the planned/actual ETA-9089 filing date so the 30-to-180-day recruitment windows can be calculated.");
    }

    if (occupationRoute === "professional") {
      const additionalCount = valueNumber(answers, "professional_additional_steps_count");
      const additionalTiming = valueString(answers, "professional_additional_steps_timing_valid");
      if (needsCompletedRecruitment && (additionalCount === null || additionalCount < 3)) block("A professional PERM case requires at least three additional recruitment steps beyond the mandatory job order/newspaper recruitment.");
      if (additionalTiming === "no") block("The professional additional recruitment steps do not satisfy the rule that none is older than 180 days and only one may consist solely of activity within 30 days of filing.");
      if (needsCompletedRecruitment && additionalTiming === "not_sure") confirm("Confirm the timing of all three professional additional recruitment steps before filing.");
    }
  }

  const bargainingRepresentative = valueBoolean(answers, "bargaining_representative_exists");
  if (needsCompletedRecruitment) {
    if (bargainingRepresentative === true) {
      if (valueBoolean(answers, "union_notice_provided") !== true) block("A bargaining representative exists, but the required Notice of Filing to the representative is not recorded as provided.");
      else noticeWindowStatus = "Bargaining-representative notice recorded";
    } else if (bargainingRepresentative === false) {
      const noticeStart = parseIso(valueString(answers, "notice_post_start_date", ""));
      const noticeEnd = parseIso(valueString(answers, "notice_post_end_date", ""));
      if (valueBoolean(answers, "notice_posted_10_business_days") !== true) block("The employee Notice of Filing is not recorded as posted for at least 10 consecutive business days.");
      if (!noticeStart || !noticeEnd) {
        block("Enter the Notice of Filing posting start/end dates for the no-bargaining-representative route.");
      } else if (noticeStart.getTime() > noticeEnd.getTime()) {
        block("The Notice of Filing start date is after the end date.");
      } else if (filingDate) {
        const startDays = prefilingDays(noticeStart, filingDate);
        const endDays = prefilingDays(noticeEnd, filingDate);
        if (startDays < 30 || startDays > 180 || endDays < 30 || endDays > 180) {
          block("The recorded Notice of Filing posting does not fall wholly within the 30-to-180-day prefiling window.");
        } else {
          noticeWindowStatus = "Posting is within 30–180 days and ends at least 30 days before filing";
        }
      } else {
        confirm("Enter the planned/actual ETA-9089 filing date so the Notice of Filing 30-to-180-day window can be verified.");
      }
      if (valueBoolean(answers, "in_house_media_required") === true && valueBoolean(answers, "in_house_media_completed") !== true) {
        block("In-house media is recorded as required under the employer's normal recruitment practice, but it is not recorded as completed.");
      }
    } else {
      confirm("Confirm whether a bargaining representative exists so the correct Notice of Filing route can be applied.");
    }
  }

  if (valueBoolean(answers, "qualifying_layoffs_within_6_months") === true && valueBoolean(answers, "laid_off_workers_notified_considered") !== true) {
    block("Qualifying layoffs are recorded within six months of filing, but potentially qualified laid-off U.S. workers are not recorded as notified and considered for the job opportunity.");
  }

  const termsConsistency = valueString(answers, "job_and_recruitment_terms_consistent");
  if (termsConsistency === "no") block("The PWD/recruitment/ETA-9089 job or wage terms are recorded as inconsistent. Resolve the mismatch before relying on this filing path.");
  if (termsConsistency === "not_sure" && stageRank >= STAGE_RANK.eta9089_ready) confirm("Confirm the job duties, minimum requirements, worksite(s), offered wage and recruitment terms are consistent before ETA-9089 filing.");

  const reportReady = valueString(answers, "recruitment_report_ready");
  if (needsCompletedRecruitment && reportReady === "no") block("The recruitment report/supporting recruitment record is not ready for the filing/audit stage.");
  if (needsCompletedRecruitment && reportReady === "not_sure") confirm("Confirm the recruitment report and supporting documentation are complete before filing.");

  const recordFile = valueString(answers, "five_year_record_file_ready");
  if (stageRank >= STAGE_RANK.eta9089_filed && recordFile === "no") block("The employer is not prepared to retain the ETA-9089 and supporting documentation for the required five-year period from filing.");
  if (stageRank >= STAGE_RANK.eta9089_filed && recordFile === "not_sure") confirm("Confirm the five-year PERM supporting-document retention file is preserved.");

  if (stageRank >= STAGE_RANK.eta9089_filed && !filingDate) {
    confirm("Enter the actual ETA-9089 filing date; it anchors the PERM priority-date basis and later timeline checks.");
  }

  if (stage === "audit") {
    const audit = valueString(answers, "audit_response_status");
    auditStatus = audit;
    requiredItems.push("Use the actual DOL audit letter as the controlling document list and deadline; the regulation provides a 30-day response period from the audit letter.");
    if (audit === "late") block("The audit response is recorded as late. The regulation provides for denial when required documentation is not submitted by the specified deadline.");
    if (["audit_received", "preparing", "not_sure"].includes(audit)) confirm("The audit response is not yet recorded as timely submitted. Track the exact letter date and deadline.");
    if (audit === "extension_granted") {
      const met = valueString(answers, "audit_extension_deadline_met");
      if (met === "no") block("A discretionary audit extension was granted, but the extended deadline was not met.");
      if (met === "not_sure") confirm("Confirm the granted audit-extension deadline and whether the response was submitted on time.");
    }
  }

  if (stage === "supervised_recruitment") {
    requiredItems.push("Submit the draft supervised-recruitment advertisement to the Certifying Officer and wait for approval/direction before publication.");
    requiredItems.push("Follow the CO-directed media, applicant-routing, recruitment-report and documentation instructions rather than reusing the ordinary prefiling advertisement plan.");
    const approved = valueString(answers, "supervised_ad_approved_before_publication");
    const deadline = valueString(answers, "supervised_deadline_status");
    if (approved === "no") block("The supervised-recruitment advertisement is recorded as published without prior Certifying Officer approval.");
    if (approved === "not_sure") confirm("Confirm the Certifying Officer approved the supervised-recruitment advertisement before publication.");
    if (deadline === "late") block("A supervised-recruitment response/document deadline is recorded as late.");
    if (deadline === "not_sure") confirm("Confirm each Certifying Officer supervised-recruitment deadline and any granted extension.");
  }

  if (stage === "certified") {
    const certificationRaw = valueString(answers, "certification_date", "");
    const certificationDate = parseIso(certificationRaw);
    const i140Filed = valueBoolean(answers, "i140_filed_with_certification");
    requiredItems.push("Use the DOL-certified ETA-9089 and Final Determination with the correct USCIS immigrant-petition package.");
    if (!certificationDate) {
      block("Enter the DOL certification date in YYYY-MM-DD format to verify the 180-calendar-day I-140 validity window.");
    } else if (i140Filed === true) {
      const i140Raw = valueString(answers, "i140_filing_date", "");
      const i140Date = parseIso(i140Raw);
      if (!i140Date) block("Form I-140 is recorded as filed, but its filing date is missing or invalid.");
      else {
        const days = daysBetween(certificationDate, i140Date);
        if (days < 0) block("The recorded I-140 filing date is before the DOL certification date.");
        else if (days > 180) block("The recorded I-140 filing date is more than 180 calendar days after PERM certification.");
        else conditionalItems.push(`Recorded I-140 filing is ${days} calendar days after certification, within the 180-day certification validity window.`);
      }
    } else if (i140Filed === false) {
      const stillValid = valueString(answers, "certification_still_within_180_days");
      if (stillValid === "no") block("The certified PERM is recorded as outside its 180-calendar-day validity period and has not been filed with Form I-140.");
      if (stillValid === "not_sure") confirm("Confirm the certification date and remaining 180-day I-140 filing window immediately.");
    } else {
      confirm("Confirm whether the certified PERM has already been filed with Form I-140.");
    }
  }

  if (stage === "denied") {
    const review = valueString(answers, "denial_review_requested_within_30_days");
    requiredItems.push("Read the Final Determination reasons and preserve the complete record before choosing reconsideration, BALCA review, or a new filing.");
    if (review === "no") block("The 30-day administrative-review request window is recorded as not met. Do not present BALCA review as still timely; evaluate the final-denial/refiling route instead.");
    if (review === "not_sure") confirm("Confirm the Final Determination date and whether a review/reconsideration request was sent within 30 days.");
  }

  if (stage === "reconsideration_or_balca") {
    const timely = valueString(answers, "review_request_was_timely");
    if (timely === "no") block("The request for reconsideration/BALCA review is recorded as untimely under the 30-day review rule.");
    if (timely === "not_sure") confirm("Confirm the review request was sent within 30 days of the determination and satisfies the actual Final Determination instructions.");
    conditionalItems.push("Do not file a new application for the same occupation and same foreign worker while a request for review is pending before BALCA where the regulation prohibits it.");
  }

  if (["planning", "prevailing_wage"].includes(stage)) {
    conditionalItems.push("Before recruitment, classify the occupation as professional or nonprofessional using current DOL guidance/Appendix A; special-handling teacher, athlete, and Schedule A cases use different paths.");
  }
  if (stage === "recruitment") {
    requiredItems.push("Complete the 30-day SWA job order and the correct newspaper/professional-journal recruitment route.");
    if (occupationRoute === "professional") requiredItems.push("Complete three additional professional recruitment steps and preserve dated evidence of each method.");
    requiredItems.push("Complete the correct Notice of Filing route and preserve the recruitment report/supporting evidence.");
  }
  if (stage === "eta9089_ready") requiredItems.push("Run the filing-date calculation again immediately before submission because recruitment can age out of the 180-day window.");
  if (stage === "eta9089_filed") requiredItems.push("Monitor the FLAG case and preserve all supporting evidence for audit/supplemental-information requests.");

  const status: ResultStatus = blockers.length > 0 ? "NOT_READY" : warnings.length > 0 ? "NEEDS_AUTHORITATIVE_CONFIRMATION" : "READY";
  const nextStep = blockers.length > 0 ? "Correct the blocking PERM timeline/process mismatches before relying on this stage." : nextStepFor(stage);

  return {
    status,
    stage,
    occupation_route: occupationRoute,
    pwd_status: pwdStatus,
    priority_date: filingDate ? filingRaw : null,
    eta9089_filing_date: filingDate ? filingRaw : null,
    pwd_window_status: pwdWindowStatus,
    recruitment_window_status: recruitmentWindowStatus,
    notice_window_status: noticeWindowStatus,
    audit_status: auditStatus,
    determination_status: determinationStatus,
    required_items: requiredItems,
    conditional_items: conditionalItems,
    blockers,
    warnings,
    next_step: nextStep,
    sources_verified: VERIFIED
  };
}
