import questionnaireJson from "../../data/usa/social-security/benefits/questionnaire.v1.json";
import type { PassportAnswers, Questionnaire, ResultStatus } from "../types";
import { labelOption } from "../uiText";
import type { ProcessCatalogEntry, ProcessModule, ProcessOfficialLink, ProcessPresentation } from "./types";

export type SsaBenefitsResult = {
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
  retirement_own_record: "Retirement benefit on your own work record",
  spouse_benefit: "Spouse benefit on a living worker's record",
  divorced_spouse_benefit: "Divorced-spouse benefit on a living former spouse's record",
  survivor_spouse: "Surviving-spouse benefit",
  surviving_divorced_spouse: "Surviving-divorced-spouse benefit",
  survivor_child: "Survivor benefit for a child",
  survivor_dependent_parent: "Survivor benefit for a dependent parent",
  child_family_benefit: "Child/family benefit on a living worker's record",
  compare_or_switch_benefits: "Compare or switch between Social Security benefit types",
  work_while_receiving: "Work while receiving Social Security benefits",
  benefits_outside_us: "Receive Social Security benefits outside the United States",
  ssa_record_confirms_eligible: "SSA record shows retirement eligibility",
  ssa_record_confirms_not_eligible: "SSA record shows not currently eligible",
  receiving_retirement_or_disability: "Worker is receiving Retirement or Disability",
  eligible_but_not_receiving: "Worker may be eligible but is not receiving benefits",
  age_62_eligible_not_receiving: "Former spouse is at least 62 and eligible but has not filed",
  not_eligible_or_not_sure: "Not eligible / not sure",
  not_remarried: "Not remarried",
  remarried_before_50: "Remarried before age 50",
  remarried_50_to_59: "Remarried between ages 50 and 59",
  remarried_60_or_later: "Remarried at age 60 or later",
  retirement: "Retirement",
  spouse_or_family: "Spouse / family",
  survivor: "Survivor",
  disability: "Disability",
  none: "No current benefit",
  under_fra_all_2026: "Under full retirement age for all of 2026",
  reaches_fra_in_2026: "Reach full retirement age during 2026",
  at_or_over_fra: "At or over full retirement age",
  ssi: "Supplemental Security Income (SSI)",
  not_sure: "Not sure"
};

const QUESTION_LABELS: Record<string, string> = {
  ssa_benefit_goal: "What Social Security benefit question or application do you need help routing?",
  ssa_applicant_age: "What is the applicant's age?",
  ssa_own_retirement_eligibility: "Does the applicant's SSA record currently show eligibility for Retirement benefits?",
  ssa_desired_start_within_four_months: "Do you want Retirement benefits to start within the next four months?",
  ssa_current_marriage_years: "How many years have you been married to the worker?",
  ssa_caring_for_qualifying_child: "Are you caring for the worker's/deceased worker's entitled child age 15 or younger, or a child with a qualifying disability?",
  ssa_living_worker_status: "What is the living spouse's Social Security benefit status?",
  ssa_applicant_has_own_retirement_benefit: "Are you also eligible for Retirement benefits on your own work record?",
  ssa_divorced_marriage_years: "How many years did the marriage to the former spouse last?",
  ssa_currently_married: "Are you currently married?",
  ssa_ex_spouse_status: "What is the former spouse's Retirement/Disability status?",
  ssa_years_since_divorce: "How many continuous years have passed since the divorce became final?",
  ssa_survivor_has_qualifying_disability: "For an applicant under age 60, is there a disability that may meet SSA's disabled-survivor rules?",
  ssa_survivor_marriage_months: "How many months were you married to the deceased worker immediately before the worker's death?",
  ssa_survivor_divorced_marriage_years: "How many years did the marriage to the deceased former spouse last?",
  ssa_survivor_remarriage_timing: "Which remarriage timing best describes the survivor?",
  ssa_child_age: "What is the child's age?",
  ssa_child_unmarried: "Is the child unmarried?",
  ssa_child_full_time_k12: "Is the child a full-time elementary/secondary (K–12) student?",
  ssa_child_disability_before_22: "Did the child's disability begin before age 22?",
  ssa_dependent_parent_supported_by_worker: "Was the parent financially supported by the deceased worker as required for dependent-parent benefits?",
  ssa_current_benefit_type: "What Social Security benefit are you receiving now?",
  ssa_possible_other_benefit_type: "What other benefit type might also apply?",
  ssa_work_benefit_type: "Which benefit are you receiving while working?",
  ssa_work_fra_status_2026: "What is your full-retirement-age status for 2026?",
  ssa_expected_2026_earnings: "What are your expected 2026 earnings from work?",
  ssa_abroad_benefit_type: "Which benefit type is involved while living or working outside the United States?"
};

const SOURCE_LINKS: ProcessOfficialLink[] = [
  { label: "SSA — Retirement benefits", url: "https://www.ssa.gov/retirement" },
  { label: "SSA — apply for Retirement", url: "https://www.ssa.gov/apply" },
  { label: "my Social Security account", url: "https://www.ssa.gov/myaccount/" },
  { label: "SSA — Family benefits", url: "https://www.ssa.gov/family" },
  { label: "SSA — Family benefit eligibility", url: "https://www.ssa.gov/family/eligibility" },
  { label: "SSA — spouse/divorced-spouse application information", url: "https://www.ssa.gov/forms/ssa-2.html" },
  { label: "SSA — Survivor benefits", url: "https://www.ssa.gov/survivor" },
  { label: "SSA — Survivor eligibility", url: "https://www.ssa.gov/survivor/eligibility" },
  { label: "SSA — how to apply for Survivor benefits", url: "https://www.ssa.gov/faqs/en/questions/KA-02083.html" },
  { label: "SSA — Retirement/spouse filing rules", url: "https://www.ssa.gov/benefits/retirement/planner/claiming.html" },
  { label: "SSA — working while receiving benefits", url: "https://www.ssa.gov/benefits/retirement/planner/whileworking.html" },
  { label: "SSA — 2026 COLA and earnings-test limits", url: "https://www.ssa.gov/cola/factsheets/2026.html" },
  { label: "SSA — International Programs", url: "https://www.ssa.gov/international/" },
  { label: "SSA — services for beneficiaries outside the U.S.", url: "https://www.ssa.gov/foreign/" }
];

const label = (value: string) => LABELS[value] ?? labelOption(value);
const str = (answers: PassportAnswers, key: string) => typeof answers[key] === "string" ? answers[key] as string : "not_sure";
const num = (answers: PassportAnswers, key: string) => typeof answers[key] === "number" ? answers[key] as number : null;
const yes = (answers: PassportAnswers, key: string) => answers[key] === true;

function makeResult(service: string): SsaBenefitsResult {
  return {
    status: "READY",
    service_family: service,
    title: label(service),
    required_items: [],
    conditional_items: [],
    blockers: [],
    warnings: [],
    next_step: "Continue with the current Social Security Administration instructions for this resolved benefit family.",
    sources_verified: VERIFIED
  };
}
function block(result: SsaBenefitsResult, message: string) {
  result.status = "NOT_READY";
  result.blockers.push(message);
}
function confirm(result: SsaBenefitsResult, message: string) {
  if (result.status === "READY") result.status = "NEEDS_AUTHORITATIVE_CONFIRMATION";
  result.warnings.push(message);
}

function applyChildEligibility(result: SsaBenefitsResult, answers: PassportAnswers) {
  const age = num(answers, "ssa_child_age");
  if (!yes(answers, "ssa_child_unmarried")) {
    confirm(result, "SSA's ordinary child-benefit rule is for an unmarried child. Married-child exceptions are fact-specific and require SSA confirmation.");
  }
  if (age === null) {
    confirm(result, "Confirm the child's age before choosing the child-benefit branch.");
    return;
  }
  if (age <= 17) return;
  if (age >= 18 && age <= 19 && yes(answers, "ssa_child_full_time_k12")) return;
  if (yes(answers, "ssa_child_disability_before_22")) {
    confirm(result, "A child age 18+ may qualify based on a disability beginning before age 22, but SSA must determine the disability and other entitlement facts.");
    return;
  }
  block(result, "The supplied age/school/disability facts do not fit the ordinary SSA child-benefit age branches. Recheck the child-benefit category before applying.");
}

export function evaluateSsaBenefits(answers: PassportAnswers): SsaBenefitsResult {
  const goal = str(answers, "ssa_benefit_goal");
  const result = makeResult(goal);
  const age = num(answers, "ssa_applicant_age");

  if (goal === "not_sure") {
    confirm(result, "Resolve whether the case is the worker's own Retirement benefit, spouse/divorced-spouse Family benefit, Survivor benefit, child/dependent-parent benefit, work/earnings issue, benefit switch, or international-payment issue before applying.");
    result.next_step = "Use SSA's benefit-type pages and my Social Security account to identify the benefit family first.";
    return result;
  }

  if (goal === "retirement_own_record") {
    if (age === null || age < 62) {
      block(result, "The ordinary Social Security Retirement benefit cannot begin before age 62. If disability or another family/survivor benefit is involved, use that separate benefit route.");
    }
    const eligibility = str(answers, "ssa_own_retirement_eligibility");
    if (eligibility === "ssa_record_confirms_not_eligible") {
      block(result, "The applicant's SSA record does not currently show Retirement eligibility. Resolve insured/work-credit eligibility with SSA before filing a Retirement application.");
    } else if (eligibility === "not_sure") {
      confirm(result, "SSA's record controls whether the worker has enough covered work for Retirement benefits. Confirm eligibility in my Social Security before filing.");
    }
    result.required_items.push("my Social Security retirement estimate/eligibility review", "Requested benefit-start month", "Retirement application information including marriage/family and recent earnings facts", "Direct-deposit information");
    if (!yes(answers, "ssa_desired_start_within_four_months")) {
      result.warnings.push("SSA generally accepts a Retirement application up to four months before the requested benefit-start month. If the intended start is later, use the planner now and file closer to the start month.");
      result.next_step = "Review your SSA estimate and desired start month; file the online Retirement application when the requested start month is within SSA's application window.";
    } else {
      result.next_step = "Use the SSA online Retirement application or contact SSA if the online application cannot complete the case.";
    }
    if (age !== null && age < 70) result.warnings.push("Starting Retirement before, at, or after full retirement age changes the monthly amount. This checklist identifies the route but does not choose the claiming age for you.");
    if (age !== null && age >= 70) result.warnings.push("SSA delayed-retirement credits stop increasing at age 70; verify the intended start month and any retroactivity directly with SSA.");
    return result;
  }

  if (goal === "spouse_benefit") {
    const caring = yes(answers, "ssa_caring_for_qualifying_child");
    const marriageYears = num(answers, "ssa_current_marriage_years");
    const workerStatus = str(answers, "ssa_living_worker_status");
    if (!caring && (age === null || age < 62)) block(result, "The ordinary age-based spouse-benefit route starts at age 62. A younger spouse needs a qualifying child-in-care basis or another SSA benefit route.");
    if (marriageYears !== null && marriageYears < 1) {
      if (caring) confirm(result, "The ordinary one-year marriage rule is not met, but SSA has exceptions including some parent-of-worker's-child situations. SSA must confirm the exception before filing.");
      else block(result, "The ordinary spouse-benefit route generally requires at least one year of marriage unless an SSA exception applies.");
    }
    if (workerStatus === "eligible_but_not_receiving") {
      block(result, "A current spouse generally cannot use the ordinary spouse-benefit route until the worker is entitled to Retirement or Disability benefits. This differs from some independently entitled divorced-spouse cases.");
    } else if (workerStatus === "not_eligible_or_not_sure") {
      confirm(result, "Confirm that the worker is entitled to Retirement or Disability benefits before relying on the spouse-benefit route.");
    }
    result.required_items.push("Worker's identifying/benefit information", "Marriage information/evidence", "Applicant age/identity information", "SSA spouse-benefit application information");
    if (yes(answers, "ssa_applicant_has_own_retirement_benefit")) result.warnings.push("Current deemed-filing rules can require SSA to consider both your Retirement and spouse benefits. They are not two full benefits added together; SSA determines the applicable combined/higher payment.");
    result.next_step = "Use SSA's Family-benefit eligibility/application guidance; if eligible for both Retirement and spouse benefits, review both estimates before submitting the application.";
    return result;
  }

  if (goal === "divorced_spouse_benefit") {
    const marriageYears = num(answers, "ssa_divorced_marriage_years");
    if (age === null || age < 62) block(result, "The ordinary divorced-spouse benefit on a living former spouse's record requires the applicant to be age 62 or older.");
    if (marriageYears === null || marriageYears < 10) block(result, "The ordinary divorced-spouse route requires a marriage lasting at least 10 years.");
    if (yes(answers, "ssa_currently_married")) block(result, "The ordinary divorced-spouse route requires the applicant to be unmarried. Ask SSA about any exception or different benefit family before applying.");
    const exStatus = str(answers, "ssa_ex_spouse_status");
    if (exStatus === "age_62_eligible_not_receiving") {
      const years = num(answers, "ssa_years_since_divorce");
      if (years === null || years < 2) block(result, "When the former spouse is eligible but has not filed, independently entitled divorced-spouse rules generally require at least two continuous years since the divorce became final.");
      else result.warnings.push("The former spouse has not filed, so this is the independently entitled divorced-spouse branch rather than an ordinary spouse-on-entitled-worker branch.");
    } else if (exStatus === "not_eligible_or_not_sure") {
      confirm(result, "Confirm the former spouse's age/insured or entitlement status with SSA before relying on the divorced-spouse route.");
    }
    result.required_items.push("Former spouse identifying information", "Final divorce decree", "Marriage/divorce dates", "Applicant identity/age information");
    if (yes(answers, "ssa_applicant_has_own_retirement_benefit")) result.warnings.push("Deemed-filing rules can require SSA to consider the applicant's own Retirement benefit together with a divorced-spouse benefit; they are not added as two full payments.");
    result.next_step = "Use SSA's spouse/divorced-spouse application information and contact SSA or apply online where SSA permits the case.";
    return result;
  }

  if (goal === "survivor_spouse") {
    const caring = yes(answers, "ssa_caring_for_qualifying_child");
    const disabled = yes(answers, "ssa_survivor_has_qualifying_disability");
    if (age === null) confirm(result, "Confirm the survivor's age before applying the ordinary surviving-spouse threshold.");
    else if (age >= 60) {
      // ordinary age branch
    } else if (age >= 50 && disabled) {
      confirm(result, "A surviving spouse age 50–59 may qualify through SSA's disabled-survivor rules, but SSA must determine the disability and onset requirements.");
    } else if (caring) {
      confirm(result, "A surviving spouse below the ordinary age threshold may qualify while caring for the deceased worker's entitled child. SSA must confirm the child's entitlement and child-in-care requirements.");
    } else {
      block(result, "The supplied facts do not meet the ordinary age-60 surviving-spouse branch, the age-50–59 disabled-survivor branch, or a recorded child-in-care route.");
    }
    const months = num(answers, "ssa_survivor_marriage_months");
    if (months !== null && months < 9) confirm(result, "The ordinary surviving-spouse rule generally requires a nine-month marriage before death, but SSA has statutory exceptions. SSA must check whether an exception applies.");
    const remarriage = str(answers, "ssa_survivor_remarriage_timing");
    if (remarriage !== "not_remarried" && remarriage !== "remarried_60_or_later") confirm(result, "Remarriage timing can change survivor eligibility, with different thresholds for disabled-survivor cases. SSA must apply the exact remarriage rule to this case.");
    result.required_items.push("Deceased worker identifying information", "Marriage/death information", "Applicant age/identity information", "Any child-in-care or disability evidence that creates an earlier survivor route");
    result.warnings.push("Survivor benefits do not use deemed filing in the same way as Retirement/spouse benefits. A person eligible for both may sometimes start one benefit and switch later, but the checklist does not choose that claiming strategy.");
    result.next_step = "Contact SSA by phone or through a Social Security office. SSA does not currently accept Survivor-benefit applications online.";
    return result;
  }

  if (goal === "surviving_divorced_spouse") {
    const marriageYears = num(answers, "ssa_survivor_divorced_marriage_years");
    if (marriageYears === null || marriageYears < 10) block(result, "The ordinary surviving-divorced-spouse route generally requires a marriage lasting at least 10 years. Child-in-care survivor routes can follow different rules and should be classified separately with SSA.");
    const disabled = yes(answers, "ssa_survivor_has_qualifying_disability");
    if (age === null) confirm(result, "Confirm the surviving divorced spouse's age before applying the age/disability branch.");
    else if (age >= 60) {
      // ordinary age branch
    } else if (age >= 50 && disabled) {
      confirm(result, "A surviving divorced spouse age 50–59 may qualify through disabled-survivor rules, but SSA must determine disability/onset and other requirements.");
    } else {
      block(result, "The ordinary surviving-divorced-spouse route requires age 60+, or age 50–59 with a qualifying SSA disability. Ask SSA about a separate child-in-care survivor route if applicable.");
    }
    const remarriage = str(answers, "ssa_survivor_remarriage_timing");
    if (remarriage !== "not_remarried" && remarriage !== "remarried_60_or_later") confirm(result, "Remarriage timing can affect surviving-divorced-spouse eligibility and must be applied to the exact age/disability facts by SSA.");
    result.required_items.push("Former spouse/deceased worker identifying information", "Marriage and final divorce evidence", "Death information", "Applicant identity/age information");
    result.warnings.push("Survivor and Retirement benefits are coordinated differently from spouse/Retirement deemed filing. SSA can determine whether a later switch between benefit types is available.");
    result.next_step = "Contact SSA by phone or through a Social Security office to apply for surviving-divorced-spouse benefits; Survivor applications are not currently online.";
    return result;
  }

  if (goal === "survivor_child" || goal === "child_family_benefit") {
    applyChildEligibility(result, answers);
    result.required_items.push("Worker/deceased worker identifying information", "Child identity, age and relationship evidence", "School evidence for an age 18–19 K–12 student when applicable", "Disability evidence for an adult child route when applicable");
    if (goal === "survivor_child") {
      result.next_step = "Contact SSA to apply for the child's Survivor benefit; Survivor applications are not currently accepted online.";
    } else {
      result.next_step = "Use SSA's Family-benefit eligibility guidance and contact/apply through SSA for the child's benefit on the living worker's record.";
    }
    return result;
  }

  if (goal === "survivor_dependent_parent") {
    if (age === null || age < 62) block(result, "The ordinary dependent-parent survivor branch requires the parent to be age 62 or older.");
    if (!yes(answers, "ssa_dependent_parent_supported_by_worker")) block(result, "The supplied facts do not show the required financial dependency on the deceased worker for the dependent-parent survivor route.");
    else confirm(result, "SSA must determine whether the financial-support/dependency requirement is satisfied from the evidence and timing of support.");
    result.required_items.push("Deceased worker identifying information", "Parent identity/age information", "Evidence of the deceased worker's financial support/dependency");
    result.next_step = "Contact SSA to apply for dependent-parent Survivor benefits; SSA will determine the dependency requirement from the evidence.";
    return result;
  }

  if (goal === "compare_or_switch_benefits") {
    const current = str(answers, "ssa_current_benefit_type");
    const other = str(answers, "ssa_possible_other_benefit_type");
    confirm(result, `The current benefit (${label(current)}) and possible other benefit (${label(other)}) must be compared using the applicant's actual SSA amounts and filing rules; this checklist will not choose a lifetime claiming strategy from generic percentages.`);
    if ((current === "retirement" && other === "spouse_or_family") || (current === "spouse_or_family" && other === "retirement")) result.warnings.push("Retirement/spouse combinations can be subject to deemed filing, so a restricted application may not be available under current law.");
    if (current === "survivor" || other === "survivor") result.warnings.push("Survivor benefits are a key exception to ordinary deemed filing; SSA may permit sequencing or a later switch depending on the actual amounts and entitlement dates.");
    result.required_items.push("Current benefit type and monthly amount", "my Social Security Retirement/spouse estimates where available", "Survivor estimate from SSA when applicable", "Desired start/switch dates and work plans");
    result.next_step = "Compare the actual benefit estimates in my Social Security and/or speak with SSA before changing entitlement. Do not cancel or switch a benefit based only on this preflight.";
    return result;
  }

  if (goal === "work_while_receiving") {
    const benefit = str(answers, "ssa_work_benefit_type");
    const fra = str(answers, "ssa_work_fra_status_2026");
    const earnings = num(answers, "ssa_expected_2026_earnings");
    if (benefit === "disability") {
      confirm(result, "Disability benefits use disability-specific work incentives and substantial-gainful-activity rules, not the Retirement earnings test encoded here.");
      result.next_step = "Use SSA's Disability work rules for the disability benefit rather than the Retirement earnings-test route.";
      return result;
    }
    if (fra === "at_or_over_fra") {
      result.warnings.push("Beginning with the month full retirement age is reached, the Retirement earnings test no longer reduces Retirement/Family/Survivor benefits because of earnings.");
      result.next_step = "Continue to report any changes SSA requires; the ordinary Retirement earnings-test reduction no longer applies after the full-retirement-age month.";
      return result;
    }
    if (fra === "under_fra_all_2026") {
      if (earnings === null) confirm(result, "Enter expected 2026 earnings to compare with the current earnings-test threshold.");
      else if (earnings > 24480) confirm(result, "Expected 2026 earnings exceed the $24,480 limit for a beneficiary under full retirement age all year. SSA may withhold $1 in benefits for each $2 above the limit, subject to the special monthly rule and actual earnings.");
      else result.warnings.push("Expected 2026 earnings are at or below the $24,480 annual limit for someone under full retirement age all year, based on the amount entered.");
      result.next_step = "Use SSA's working-while-receiving guidance and report expected earnings so SSA can calculate any withholding/reconciliation.";
      return result;
    }
    if (fra === "reaches_fra_in_2026") {
      if (earnings === null) confirm(result, "Enter expected earnings, and distinguish earnings before the full-retirement-age month because only those pre-FRA earnings count toward the special 2026 limit.");
      else if (earnings > 65160) confirm(result, "Full-year earnings exceed $65,160. In the year full retirement age is reached, SSA applies the $65,160 limit only to earnings before the FRA month and withholds $1 for each $3 above that applicable limit; SSA must use the actual pre-FRA earnings.");
      else result.warnings.push("Full-year earnings are no more than the $65,160 2026 threshold. Because only earnings before the FRA month count, confirm the actual pre-FRA amount with SSA.");
      result.next_step = "Report expected earnings and the full-retirement-age month to SSA so the year-of-FRA earnings test is applied to the correct months.";
      return result;
    }
    confirm(result, "Confirm the beneficiary's full-retirement-age status before using a 2026 earnings-test threshold.");
    return result;
  }

  if (goal === "benefits_outside_us") {
    const benefit = str(answers, "ssa_abroad_benefit_type");
    confirm(result, "Payment eligibility outside the United States depends on citizenship, country of residence, benefit type and other SSA rules. Use SSA's Payments Abroad screening/international service channels for the specific case.");
    if (benefit === "ssi") result.warnings.push("SSI is a separate needs-based program with different presence/residency rules and is not the Retirement/Family/Survivor benefit route modeled here.");
    result.required_items.push("Benefit type", "Citizenship", "Country of residence", "Expected duration outside the United States", "Work outside the United States, if any");
    result.next_step = "Use SSA International Programs/Payments Abroad guidance and the Federal Benefits Unit or SSA office serving the country before assuming payments will continue unchanged.";
    return result;
  }

  confirm(result, "The selected benefit path needs SSA classification before an application or claiming decision.");
  return result;
}

function present(raw: unknown): ProcessPresentation {
  const result = raw as SsaBenefitsResult;
  return {
    status: result.status,
    title: result.title,
    subtitle: `Resolved Social Security path · Sources verified ${result.sources_verified}`,
    summary: [
      { label: "Benefit path", value: label(result.service_family) },
      { label: "Routing status", value: result.status === "READY" ? "Correct SSA path identified" : result.status === "NOT_READY" ? "Selected path conflicts with recorded facts" : "SSA/personal benefit confirmation required" }
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

function resolveSourceLinks(answers: PassportAnswers): ProcessOfficialLink[] {
  const goal = str(answers, "ssa_benefit_goal");
  const byLabel = (...parts: string[]) => SOURCE_LINKS.filter((link) => parts.some((part) => link.label.toLowerCase().includes(part.toLowerCase())));
  if (goal === "retirement_own_record") return byLabel("Retirement benefits", "apply for Retirement", "my Social Security");
  if (goal === "spouse_benefit" || goal === "divorced_spouse_benefit" || goal === "child_family_benefit") return byLabel("Family benefits", "Family benefit eligibility", "spouse/divorced-spouse", "my Social Security");
  if (["survivor_spouse", "surviving_divorced_spouse", "survivor_child", "survivor_dependent_parent"].includes(goal)) return byLabel("Survivor benefits", "Survivor eligibility", "apply for Survivor");
  if (goal === "compare_or_switch_benefits") return byLabel("filing rules", "my Social Security", "Survivor benefits");
  if (goal === "work_while_receiving") return byLabel("working while", "2026 COLA");
  if (goal === "benefits_outside_us") return byLabel("International Programs", "outside the U.S.");
  return SOURCE_LINKS;
}

export function createSsaBenefitsModule(entry: ProcessCatalogEntry): ProcessModule {
  return {
    entry,
    questionnaire,
    storageKey: `official-checklist:${questionnaire.id}:answers`,
    eyebrow: "UNITED STATES · SOCIAL SECURITY · CLASSIFY RETIREMENT / FAMILY / SURVIVOR FIRST",
    questionLabels: QUESTION_LABELS,
    questionHints: {
      ssa_benefit_goal: "Choose the benefit family or problem, not the form. Retirement, spouse, divorced-spouse and Survivor rules are not interchangeable.",
      ssa_applicant_has_own_retirement_benefit: "This matters because current deemed-filing rules can coordinate Retirement and spouse/divorced-spouse benefits.",
      ssa_survivor_has_qualifying_disability: "Do not self-certify SSA disability. A 'yes' here only routes the case to the disabled-survivor branch for SSA confirmation.",
      ssa_expected_2026_earnings: "For a person reaching full retirement age in 2026, only earnings before the FRA month are used for that year's special limit; the evaluator will flag a full-year amount that needs SSA calculation."
    },
    labelOption: label,
    sourceLinks: SOURCE_LINKS,
    resolveSourceLinks: (answers) => resolveSourceLinks(answers),
    evaluate: evaluateSsaBenefits,
    present
  };
}
