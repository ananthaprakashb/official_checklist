import questionnaireJson from "../../data/usa/education/fafsa/questionnaire.v1.json";
import type { PassportAnswers, Questionnaire, ResultStatus } from "../types";
import { labelOption } from "../uiText";
import type { ProcessCatalogEntry, ProcessModule, ProcessOfficialLink, ProcessPresentation } from "./types";

export type FafsaResult = {
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

const questionnaire = questionnaireJson as Questionnaire;
const VERIFIED = "2026-08-31";

const LABELS: Record<string, string> = {
  start_or_resume: "Start or complete a FAFSA form",
  determine_dependency: "Determine FAFSA dependency status",
  identify_contributors: "Identify required FAFSA contributors",
  complete_contributor: "Complete a contributor section",
  unusual_circumstances: "Unusual circumstances / provisional independence",
  parent_refusal_unsub_only: "Parent refusal / Direct Unsubsidized Loan only request",
  make_correction: "Correct a submitted FAFSA",
  verification: "School verification",
  add_remove_school: "Add or remove a school",
  special_financial_circumstances: "Special financial circumstances / aid adjustment",
  deadline_check: "Check FAFSA, state and school deadlines",
  check_status_submission_summary: "Check FAFSA status / Submission Summary",
  "2026_27": "2026–27",
  "2027_28": "2027–28",
  dependent: "Dependent student",
  independent: "Independent student",
  provisionally_independent: "Provisionally independent student",
  not_determined: "Not yet determined",
  not_sure: "Not sure"
};

const QUESTION_LABELS: Record<string, string> = {
  fafsa_action: "What FAFSA outcome do you need?",
  fafsa_award_year: "Which FAFSA award year are you working on?",
  fafsa_2027_28_beta_status: "What is your 2027–28 FAFSA Beta 2 access status?",
  student_has_studentaid_account: "Does the student have their own StudentAid.gov account?",
  fafsa_dependency_status: "What dependency status has the FAFSA identified?",
  fafsa_unusual_circumstances_prevent_parent_contact: "Do unusual circumstances prevent parent contact or make contact unsafe?",
  fafsa_parent_refuses_information: "Are the parents simply refusing to provide FAFSA information?",
  fafsa_parent_situation: "Which parent-family situation best matches the current facts?",
  fafsa_parent_contributor_resolved_with_official_logic: "Has the required parent contributor been resolved using the FAFSA/Who’s My FAFSA Parent logic?",
  fafsa_required_contributor_count: "How many additional required contributors does the FAFSA identify?",
  fafsa_all_required_contributors_have_accounts: "Do all required contributors have their own StudentAid.gov accounts?",
  fafsa_contributor_without_ssn: "Does a required nonstudent contributor lack a Social Security number?",
  fafsa_all_required_contributor_sections_complete: "Have all required contributors completed and signed their sections?",
  fafsa_all_required_consent_approval_complete: "Have the student and all required contributors provided required consent and approval?",
  fafsa_form_submitted: "Has the FAFSA form been submitted?",
  fafsa_submission_processed: "Has the FAFSA submission been processed?",
  fafsa_correction_type: "What kind of correction is needed?",
  fafsa_selected_for_verification: "Does the FAFSA Submission Summary or school say the student was selected for verification?",
  fafsa_school_verification_request_received: "Has the school told the student which verification documents/actions it requires?",
  fafsa_special_financial_change_exists: "Is there a significant financial circumstance not accurately reflected by the FAFSA tax-year information?",
  fafsa_state_deadline_checked: "Has the applicable state aid deadline been checked?",
  fafsa_school_deadline_checked: "Have the financial-aid deadlines for the target schools been checked?",
  fafsa_school_list_change_needed: "Do you need to add or remove a school from the FAFSA?"
};

const SOURCE_LINKS: ProcessOfficialLink[] = [
  { label: "Federal Student Aid — FAFSA", url: "https://studentaid.gov/h/apply-for-aid/fafsa" },
  { label: "Federal Student Aid — create StudentAid.gov account", url: "https://studentaid.gov/fsa-id/create-account/launch" },
  { label: "Federal Student Aid — student FAFSA steps", url: "https://studentaid.gov/articles/fafsa-student-steps/" },
  { label: "Federal Student Aid — parent FAFSA steps", url: "https://studentaid.gov/articles/fafsa-for-parents/" },
  { label: "Federal Student Aid — Who’s My FAFSA Parent?", url: "https://studentaid.gov/fafsa-apply/parents" },
  { label: "Federal Student Aid — FAFSA checklist", url: "https://studentaid.gov/articles/things-you-need-for-fafsa/" },
  { label: "Federal Student Aid — FAFSA Submission Summary / corrections", url: "https://studentaid.gov/articles/fafsa-submission-summary/" },
  { label: "Federal Student Aid — after submitting FAFSA", url: "https://studentaid.gov/articles/things-after-fafsa/" },
  { label: "Federal Student Aid — 2026–27 FAFSA form and deadlines", url: "https://studentaid.gov/sites/default/files/2026-27-fafsa-form.pdf" },
  { label: "Federal Student Aid — 2027–28 FAFSA Beta 2", url: "https://studentaid.gov/joinbeta" }
];

const label = (value: string) => LABELS[value] ?? labelOption(value);
const str = (answers: PassportAnswers, key: string) => typeof answers[key] === "string" ? answers[key] as string : "not_sure";
const num = (answers: PassportAnswers, key: string) => typeof answers[key] === "number" ? answers[key] as number : null;
const yes = (answers: PassportAnswers, key: string) => answers[key] === true;

function makeResult(service: string): FafsaResult {
  return {
    status: "READY",
    service_family: service,
    title: label(service),
    required_items: [],
    conditional_items: [],
    blockers: [],
    warnings: [],
    next_step: "Continue on the official Federal Student Aid site for the resolved FAFSA branch.",
    sources_verified: VERIFIED
  };
}
function block(result: FafsaResult, message: string) {
  result.status = "NOT_READY";
  result.blockers.push(message);
}
function confirm(result: FafsaResult, message: string) {
  if (result.status === "READY") result.status = "NEEDS_AUTHORITATIVE_CONFIRMATION";
  result.warnings.push(message);
}

function applyAwardYear(result: FafsaResult, answers: PassportAnswers) {
  const year = str(answers, "fafsa_award_year");
  if (year === "not_sure") {
    confirm(result, "Confirm the school year before entering financial information. FAFSA forms and deadlines are award-year specific.");
    return;
  }
  if (year === "2026_27") {
    result.required_items.push("Use the 2026–27 FAFSA for attendance between July 1, 2026 and June 30, 2027");
    result.warnings.push("The federal 2026–27 FAFSA deadline is June 30, 2027, but state and school deadlines can be much earlier.");
    return;
  }

  const beta = str(answers, "fafsa_2027_28_beta_status");
  result.warnings.push("As verified August 31, 2026, the 2027–28 FAFSA is in Beta 2 and Federal Student Aid plans public release by October 1, 2026. Beta participation does not provide an aid-priority advantage.");
  if (beta === "approved_or_participating") {
    confirm(result, "The 2027–28 form is still in beta. Use only the official beta access assigned through Federal Student Aid and re-check current release status before relying on this route.");
  } else if (beta === "requested_waiting") {
    confirm(result, "Beta access is still pending. Do not create a competing or duplicate FAFSA outside the official StudentAid.gov flow.");
  } else if (beta === "not_participating") {
    block(result, "The 2027–28 FAFSA is not yet generally public as of the verified date. Wait for official public access or request Beta 2 access through StudentAid.gov/joinbeta.");
  } else {
    confirm(result, "Confirm current 2027–28 public/beta availability with Federal Student Aid before proceeding.");
  }
}

function applyContributorReadiness(result: FafsaResult, answers: PassportAnswers) {
  const dependency = str(answers, "fafsa_dependency_status");
  const count = num(answers, "fafsa_required_contributor_count");

  if (dependency === "not_determined") {
    confirm(result, "The FAFSA itself must determine dependent, independent or provisionally independent status under federal student-aid rules. Do not infer it from IRS dependency, living arrangement or parental support alone.");
  }
  if (dependency === "dependent" && !yes(answers, "fafsa_parent_contributor_resolved_with_official_logic")) {
    confirm(result, "Resolve the required legal parent contributor using the FAFSA/Who’s My FAFSA Parent logic before sending invitations. For divorced or separated parents, do not choose solely based on where the student lives.");
  }
  if (count !== null && count > 0) {
    result.required_items.push(`${count} additional required contributor section${count === 1 ? "" : "s"}`);
    if (!yes(answers, "fafsa_all_required_contributors_have_accounts")) {
      block(result, "Each required contributor needs their own StudentAid.gov account before they can access, complete and sign their FAFSA section.");
    }
    if (!yes(answers, "fafsa_all_required_contributor_sections_complete")) {
      block(result, "The FAFSA cannot be fully submitted/processed through the ordinary contributor route until all required contributor sections are completed and signed.");
    }
  }
  if (!yes(answers, "fafsa_all_required_consent_approval_complete")) {
    block(result, "Required FAFSA consent and approval for federal tax information is incomplete. Federal Student Aid cannot calculate federal aid eligibility without the required student/contributor consent and approval.");
  }
  if (yes(answers, "fafsa_contributor_without_ssn")) {
    result.warnings.push("A required nonstudent contributor without an SSN can create a StudentAid.gov account under the current FAFSA process; do not substitute another person's account or omit the contributor solely because they lack an SSN.");
  }
}

export function evaluateFafsa(answers: PassportAnswers): FafsaResult {
  const action = str(answers, "fafsa_action");
  const result = makeResult(action);
  applyAwardYear(result, answers);

  if (action === "not_sure") {
    confirm(result, "Choose whether the task is starting/completing FAFSA, dependency/contributors, unusual circumstances, parent refusal, correction, verification, school list, deadlines, status, or a financial-aid-office adjustment.");
    result.next_step = "Open the FAFSA dashboard or student FAFSA steps and identify the current stage before collecting more documents.";
    return result;
  }

  if (action === "start_or_resume") {
    if (!yes(answers, "student_has_studentaid_account")) block(result, "The student needs their own StudentAid.gov account to complete the FAFSA online.");
    result.required_items.push("StudentAid.gov account", "Correct award-year FAFSA", "Student identity and financial information", "List of schools to receive FAFSA information");
    applyContributorReadiness(result, answers);
    if (!yes(answers, "fafsa_state_deadline_checked")) confirm(result, "Check the applicable state aid deadline; state funds may use earlier priority deadlines than the federal FAFSA deadline.");
    if (!yes(answers, "fafsa_school_deadline_checked")) confirm(result, "Check each target school's financial-aid deadline and any additional institutional forms.");
    result.next_step = "Open the official FAFSA, start/resume the correct award year, complete the student section first, then track each required contributor until all sections, consent and signatures are complete.";
    return result;
  }

  if (action === "determine_dependency") {
    if (!yes(answers, "student_has_studentaid_account")) result.conditional_items.push("Create the student's StudentAid.gov account before completing the online FAFSA dependency questions.");
    const dependency = str(answers, "fafsa_dependency_status");
    if (dependency === "not_determined") {
      confirm(result, "Complete the FAFSA personal-circumstances questions so the official form can determine dependent, independent or provisionally independent status.");
      result.next_step = "Use the FAFSA personal-circumstances/dependency questions; do not use IRS tax dependency as a substitute.";
    } else {
      result.required_items.push(`FAFSA dependency result: ${label(dependency)}`);
      result.next_step = dependency === "dependent" ? "Continue to the contributor-selection branch and identify the required legal parent contributor." : dependency === "provisionally_independent" ? "Submit the provisionally independent FAFSA branch and contact each school's financial aid office for the required unusual-circumstances review." : "Continue the FAFSA using the independent-student financial/contributor questions that the form presents.";
    }
    return result;
  }

  if (action === "identify_contributors") {
    const dependency = str(answers, "fafsa_dependency_status");
    if (dependency === "dependent") {
      if (!yes(answers, "fafsa_parent_contributor_resolved_with_official_logic")) {
        confirm(result, "Use Who’s My FAFSA Parent? or the FAFSA contributor questions to determine the correct parent. Divorced/separated-parent selection uses current support/income-and-assets rules, not simply custody or residence.");
      } else {
        result.required_items.push("Invite the legal parent identified by the official FAFSA contributor logic");
      }
    } else if (dependency === "independent") {
      result.warnings.push("Independent students do not provide parent information, but a married student may still need a spouse contributor when the FAFSA identifies one, such as when current spouses did not file jointly.");
    } else if (dependency === "provisionally_independent") {
      confirm(result, "Do not force a parent invitation into a provisional-independence case. The school financial aid office must review the unusual circumstances.");
    } else {
      confirm(result, "Determine FAFSA dependency status first; contributor requirements depend on that result.");
    }
    if (yes(answers, "fafsa_contributor_without_ssn")) result.warnings.push("A nonstudent contributor without an SSN can create a StudentAid.gov account under the current FAFSA process.");
    result.next_step = "Use the FAFSA contributor prompts and Who’s My FAFSA Parent? tool, then send the invitation to the exact contributor identified by the official flow.";
    return result;
  }

  if (action === "complete_contributor") {
    applyContributorReadiness(result, answers);
    result.required_items.push("Each contributor uses their own StudentAid.gov account", "Complete only the contributor's assigned section", "Provide required consent/approval and signature");
    result.next_step = "Open the contributor invitation from the contributor's own StudentAid.gov account, complete the assigned section, provide consent/approval and sign; then verify the student's FAFSA status tracker shows the section complete.";
    return result;
  }

  if (action === "unusual_circumstances") {
    if (!yes(answers, "student_has_studentaid_account")) block(result, "The student needs their own StudentAid.gov account to complete the unusual-circumstances FAFSA branch online.");
    if (!yes(answers, "fafsa_unusual_circumstances_prevent_parent_contact")) {
      block(result, "The unusual-circumstances branch is for situations where the student cannot contact a parent or contact would pose a risk. Parent unwillingness alone belongs to a different FAFSA branch.");
    } else {
      confirm(result, "The student may submit without parent information as provisionally independent, but the school's financial aid administrator must review the unusual circumstances and documentation before final dependency status/aid can be resolved.");
      result.required_items.push("FAFSA unusual-circumstances responses", "Documentation requested by the school's financial aid office");
    }
    result.next_step = "Complete and submit the FAFSA unusual-circumstances branch, then contact each school's financial aid office promptly for its dependency-override/provisional-independence documentation process.";
    return result;
  }

  if (action === "parent_refusal_unsub_only") {
    if (!yes(answers, "fafsa_parent_refuses_information")) {
      block(result, "Do not use the parent-refusal branch unless the parent is actually refusing to provide FAFSA information. Other inability-to-contact/risk situations belong to unusual circumstances.");
    } else {
      confirm(result, "A dependent student whose parents refuse FAFSA information can request consideration for a Direct Unsubsidized Loan only. A school financial aid administrator must determine this; this branch does not provide Pell Grant, subsidized loan or Federal Work-Study eligibility.");
      result.required_items.push("FAFSA response indicating parent refusal", "School financial aid office determination for Direct Unsubsidized Loan only");
    }
    result.next_step = "Submit the appropriate FAFSA parent-refusal response and contact the school's financial aid office for its Direct Unsubsidized Loan-only review.";
    return result;
  }

  if (action === "make_correction") {
    if (!yes(answers, "fafsa_form_submitted")) block(result, "There is no submitted FAFSA to correct. Update the current draft instead.");
    if (!yes(answers, "fafsa_submission_processed")) confirm(result, "Wait for the FAFSA submission to process or follow any Action Required status before assuming the normal correction flow is available.");
    const type = str(answers, "fafsa_correction_type");
    if (type === "online_typo_signature_consent_contact_school") {
      result.required_items.push("Processed FAFSA / FAFSA Submission Summary", "Use Make a Correction for the supported online change");
      result.next_step = "Open the processed FAFSA in My Activity or the FAFSA Submission Summary and choose Make a Correction.";
    } else if (type === "contributor_own_section") {
      result.warnings.push("A contributor can start a correction only for their own FAFSA section; the student can start and submit corrections across the FAFSA form.");
      result.next_step = "Have the contributor sign in to their own StudentAid.gov account and correct only their assigned section, or have the student initiate the appropriate correction.";
    } else if (type === "amended_tax_return_or_financial_change") {
      confirm(result, "Amended tax information or a significant financial change may require the school's financial aid office rather than an ordinary online FAFSA correction.");
      result.next_step = "Contact the school's financial aid office and ask whether the change requires professional judgment or school-side FAFSA adjustment documentation.";
    } else {
      confirm(result, "Review the FAFSA Submission Summary to determine whether the change is an online correction or a school financial-aid-office action.");
    }
    return result;
  }

  if (action === "verification") {
    if (!yes(answers, "fafsa_form_submitted") || !yes(answers, "fafsa_submission_processed")) block(result, "Verification is a post-processing school review. First obtain a processed FAFSA and FAFSA Submission Summary.");
    if (!yes(answers, "fafsa_selected_for_verification")) {
      result.warnings.push("No verification selection is recorded in the supplied facts. Continue monitoring the FAFSA Submission Summary and school communications.");
      result.next_step = "Review the FAFSA Submission Summary and each school's financial aid portal/messages for any verification request.";
    } else if (!yes(answers, "fafsa_school_verification_request_received")) {
      confirm(result, "The student is selected for verification, but the school's required documents/actions are not yet known. Do not guess the verification package.");
      result.next_step = "Contact or monitor the school's financial aid office/portal for the exact verification request and deadline.";
    } else {
      confirm(result, "Follow the school's exact verification request and deadline. Verification requirements are school-administered and can be case-specific.");
      result.required_items.push("School verification request", "Documents specifically requested by the financial aid office");
      result.next_step = "Submit the exact verification documents to the school through its approved channel by the school deadline.";
    }
    return result;
  }

  if (action === "add_remove_school") {
    if (!yes(answers, "fafsa_form_submitted") || !yes(answers, "fafsa_submission_processed")) block(result, "Add/remove-school corrections are normally made from a processed FAFSA. First complete processing or update the current draft before submission.");
    if (!yes(answers, "fafsa_school_list_change_needed")) result.warnings.push("No school-list change is recorded in the supplied facts.");
    result.warnings.push("The online FAFSA can send information to up to 20 schools. Federal aid does not depend on school-list order, but some states can have ordering rules for state aid.");
    result.next_step = "Open the processed FAFSA, choose Make a Correction, add/remove the correct schools or federal school codes, and re-check any state ordering requirement.";
    return result;
  }

  if (action === "special_financial_circumstances") {
    if (!yes(answers, "fafsa_form_submitted")) block(result, "Federal Student Aid instructs students with special financial circumstances to complete/submit the FAFSA first, then request an aid adjustment from the school.");
    if (!yes(answers, "fafsa_special_financial_change_exists")) block(result, "No special financial circumstance is recorded for this professional-judgment route.");
    else confirm(result, "The school's financial aid administrator decides whether and how to adjust FAFSA data or the aid offer based on documented special financial circumstances.");
    result.required_items.push("Submitted FAFSA", "Documentation of the changed financial circumstances requested by the school");
    result.next_step = "Contact the financial aid office at each relevant school and request its professional-judgment / aid-adjustment process; do not substitute a different tax year in the FAFSA on your own.";
    return result;
  }

  if (action === "deadline_check") {
    result.required_items.push("Correct FAFSA award year", "Federal FAFSA deadline", "State aid deadline", "Each school's financial-aid deadline and additional-form requirements");
    if (!yes(answers, "fafsa_state_deadline_checked")) confirm(result, "State aid deadlines can be substantially earlier than the federal deadline and some programs award funds while available.");
    if (!yes(answers, "fafsa_school_deadline_checked")) confirm(result, "School priority deadlines are separate from the federal FAFSA deadline and can affect institutional aid.");
    result.next_step = "Confirm all three deadline layers—federal, state, and each school—and submit as early as practical for limited state/school funds.";
    return result;
  }

  if (action === "check_status_submission_summary") {
    if (!yes(answers, "fafsa_form_submitted")) block(result, "No submitted FAFSA exists to track yet.");
    else if (!yes(answers, "fafsa_submission_processed")) {
      result.required_items.push("StudentAid.gov My Activity status tracker");
      result.next_step = "Open My Activity and monitor Draft/In Progress/Action Required/In Review status until the FAFSA is processed; resolve any Action Required item shown by Federal Student Aid.";
    } else {
      result.required_items.push("FAFSA Submission Summary", "Review Eligibility Overview, FAFSA Form Answers, School Information and Next Steps");
      result.next_step = "Open the FAFSA Submission Summary, review the official SAI/eligibility information and Next Steps, and act on any correction or verification request.";
    }
    return result;
  }

  confirm(result, "Use the current Federal Student Aid FAFSA guidance to resolve this case.");
  return result;
}

function present(raw: unknown): ProcessPresentation {
  const result = raw as FafsaResult;
  return {
    status: result.status,
    title: result.title,
    subtitle: `Resolved FAFSA route · Sources verified ${result.sources_verified}`,
    summary: [
      { label: "FAFSA task", value: label(result.service_family) },
      { label: "Routing status", value: result.status === "READY" ? "Correct procedural branch identified" : result.status === "NOT_READY" ? "A prerequisite conflicts with this route" : "Federal Student Aid or school confirmation required" }
    ],
    blockers: result.blockers,
    warnings: result.warnings,
    requiredItems: result.required_items,
    conditionalItems: result.conditional_items,
    nextStep: result.next_step,
    sourcesVerified: result.sources_verified,
    rawResult: result
  };
}

function resolveLinks(answers: PassportAnswers): ProcessOfficialLink[] {
  const action = str(answers, "fafsa_action");
  const year = str(answers, "fafsa_award_year");
  const labels: string[] = ["Federal Student Aid — FAFSA"];
  if (["start_or_resume", "determine_dependency", "identify_contributors", "complete_contributor", "unusual_circumstances", "parent_refusal_unsub_only"].includes(action)) labels.push("Federal Student Aid — student FAFSA steps", "Federal Student Aid — create StudentAid.gov account");
  if (action === "identify_contributors" || action === "complete_contributor") labels.push("Federal Student Aid — parent FAFSA steps", "Federal Student Aid — Who’s My FAFSA Parent?");
  if (["make_correction", "add_remove_school", "verification", "check_status_submission_summary"].includes(action)) labels.push("Federal Student Aid — FAFSA Submission Summary / corrections", "Federal Student Aid — after submitting FAFSA");
  if (action === "deadline_check" || year === "2026_27") labels.push("Federal Student Aid — 2026–27 FAFSA form and deadlines");
  if (year === "2027_28") labels.push("Federal Student Aid — 2027–28 FAFSA Beta 2");
  if (action === "start_or_resume") labels.push("Federal Student Aid — FAFSA checklist");
  return SOURCE_LINKS.filter((link) => labels.includes(link.label));
}

export function createFafsaModule(entry: ProcessCatalogEntry): ProcessModule {
  return {
    entry,
    questionnaire,
    storageKey: `official-checklist:${questionnaire.id}:answers`,
    eyebrow: "UNITED STATES · FEDERAL STUDENT AID · AWARD YEAR → DEPENDENCY → CONTRIBUTORS → SUBMISSION → FOLLOW-UP",
    questionLabels: QUESTION_LABELS,
    questionHints: {
      fafsa_award_year: "Choose the school year for which aid is needed. FAFSA rules, tax-year data and deadlines are award-year specific.",
      fafsa_dependency_status: "Federal student-aid dependency is determined by the FAFSA under federal law; it is not the same as being claimed on a parent's tax return.",
      fafsa_parent_contributor_resolved_with_official_logic: "For separated/divorced/remarried families, use the FAFSA's current contributor logic or Who’s My FAFSA Parent? rather than choosing the parent based only on custody or residence.",
      fafsa_all_required_consent_approval_complete: "Consent and approval are required even when a contributor did not file a U.S. federal tax return.",
      fafsa_special_financial_change_exists: "Examples can include job/income loss or other financial changes not reflected by the required FAFSA tax-year information. The school decides professional judgment."
    },
    labelOption: label,
    sourceLinks: SOURCE_LINKS,
    resolveSourceLinks: (answers) => resolveLinks(answers),
    evaluate: (answers) => evaluateFafsa(answers),
    present
  };
}
