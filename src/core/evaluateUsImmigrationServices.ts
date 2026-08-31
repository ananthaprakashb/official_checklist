import type { PassportAnswers, ResultStatus } from "../types";

export type UsImmigrationServiceRouterResult = {
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

const VERIFIED = "2026-08-30";

function result(
  serviceFamily: string,
  title: string,
  status: ResultStatus,
  requiredItems: string[],
  conditionalItems: string[],
  warnings: string[],
  blockers: string[],
  nextStep: string
): UsImmigrationServiceRouterResult {
  return {
    status,
    service_family: serviceFamily,
    title,
    required_items: requiredItems,
    conditional_items: conditionalItems,
    blockers,
    warnings,
    next_step: nextStep,
    sources_verified: VERIFIED
  };
}

export function evaluateUsImmigrationServices(answers: PassportAnswers): UsImmigrationServiceRouterResult {
  const service = typeof answers.requested_us_immigration_service === "string"
    ? answers.requested_us_immigration_service
    : "not_resolved";

  switch (service) {
    case "employment_green_card": {
      const stage = answers.employment_green_card_stage;
      if (stage === "perm") {
        return result(service, "Employment-Based Green Card — PERM Stage", "READY", [
          "Confirm whether the selected employment-based immigrant category actually requires permanent labor certification.",
          "When PERM is required, the employer follows the Department of Labor permanent labor certification process before the I-140 petition.",
          "Preserve the certified labor-certification case data for the downstream immigrant petition."
        ], ["Some employment-based routes, including certain self-petitions or statutory exceptions, do not use PERM."], [], [], "Complete the correct employer-side PERM branch only if the immigrant category requires it, then continue to the I-140 stage.");
      }
      if (stage === "i140") {
        return result(service, "Employment-Based Green Card — I-140 Stage", "READY", [
          "Choose the exact I-140 immigrant classification before assembling evidence.",
          "Include the labor certification when the selected category requires one.",
          "Resolve whether the beneficiary will pursue adjustment of status in the United States or immigrant-visa processing abroad."
        ], [], ["I-140 approval is a petition milestone; it does not by itself make Form I-485 immediately fileable."], [], "After the petition stage, evaluate visa availability and the beneficiary's adjustment-versus-consular route.");
      }
      if (stage === "i485") {
        return result(service, "Employment-Based Green Card — Adjustment of Status", "NEEDS_AUTHORITATIVE_CONFIRMATION", [
          "Confirm the beneficiary is physically in the United States and independently eligible for adjustment of status.",
          "Check the current Department of State Visa Bulletin and the USCIS monthly filing-chart selection.",
          "Compare the priority date with the applicable category and country cutoff before treating Form I-485 as fileable."
        ], ["If the category is current and the applicant is otherwise eligible, ancillary I-765 and I-131 filings may have separate category and travel consequences."], ["Visa availability can advance, retrogress or become unavailable; this gate must be checked again immediately before filing."], [], "Verify the current Visa Bulletin/USCIS filing chart and adjustment eligibility before building the I-485 package.");
      }
      if (stage === "consular") {
        return result(service, "Employment-Based Green Card — Consular Processing", "NEEDS_AUTHORITATIVE_CONFIRMATION", [
          "Confirm the approved immigrant petition is designated for consular processing and has reached the Department of State/NVC stage.",
          "Confirm visa-number availability for preference-limited categories.",
          "Follow NVC/CEAC instructions for fees, DS-260, civil documents and interview preparation when the case is eligible to proceed."
        ], [], ["Do not start DS-260 solely because I-140 is approved; wait until NVC/CEAC instructs the case to proceed."], [], "Use the NVC case status and current Visa Bulletin to determine whether immigrant-visa document collection can begin.");
      }
      return result(service, "Employment-Based Green Card", "NEEDS_AUTHORITATIVE_CONFIRMATION", ["Identify the current case stage: PERM, I-140, I-485 eligibility, or consular/NVC processing."], [], ["The correct checklist changes substantially by stage."], [], "Resolve the current employment-green-card stage before collecting a filing checklist.");
    }

    case "family_green_card": {
      const location = answers.family_beneficiary_location;
      if (location === "outside_us") {
        return result(service, "Family-Based Green Card — Consular Route", "READY", [
          "Establish the correct qualifying family relationship and I-130 category.",
          "After USCIS petition approval and NVC intake, follow CEAC fee and document instructions.",
          "Complete DS-260 and the current civil/financial-support document workflow when NVC instructs the case to proceed."
        ], ["Family-preference categories may need to wait for visa-number availability; immediate-relative cases follow different availability rules."], [], [], "Continue through I-130 → NVC/CEAC → DS-260 → medical/interview using the applicant's exact family classification.");
      }
      if (location === "inside_us") {
        return result(service, "Family-Based Green Card — Adjustment Route", "NEEDS_AUTHORITATIVE_CONFIRMATION", [
          "Establish the correct I-130 relationship/category.",
          "Confirm the beneficiary is independently eligible to adjust status in the United States.",
          "Determine whether a visa is immediately available and whether concurrent I-130/I-485 filing is permitted for this category."
        ], [], ["Physical presence in the United States alone does not make a beneficiary eligible for adjustment of status."], [], "Confirm the family category, adjustment eligibility and visa availability before choosing concurrent or sequential filing.");
      }
      return result(service, "Family-Based Green Card", "NEEDS_AUTHORITATIVE_CONFIRMATION", ["Determine whether the beneficiary will pursue eligible adjustment of status inside the United States or immigrant-visa processing abroad."], [], [], [], "Resolve beneficiary location and the intended adjustment-versus-consular route.");
    }

    case "adjustment_of_status": {
      const inside = answers.aos_currently_inside_us;
      if (inside === false) {
        return result(service, "Adjustment of Status (Form I-485)", "NOT_READY", [], [], [], ["Form I-485 is an adjustment application for a person physically present in the United States. A beneficiary processing from abroad belongs in the immigrant-visa/consular route instead."], "Return to the service classifier and choose Immigrant Visa / NVC / DS-260 unless an authoritative exception applies.");
      }
      return result(service, "Adjustment of Status (Form I-485)", "NEEDS_AUTHORITATIVE_CONFIRMATION", [
        "Identify the underlying immigrant basis and petition/category.",
        "Confirm the applicant is physically present in the United States and otherwise eligible to adjust.",
        "For numerically limited categories, verify current visa availability and the USCIS filing chart before filing."
      ], [], ["Adjustment eligibility is category-specific and may involve admissibility/status-history issues that cannot be resolved from location alone."], [], "Verify the underlying category and current filing eligibility before assembling Form I-485.");
    }

    case "immigrant_visa_consular_processing":
      return result(service, "Immigrant Visa / NVC / DS-260", "READY", [
        "Confirm the approved immigrant petition is routed to Department of State consular processing.",
        "Wait for NVC/CEAC instructions before paying case fees or submitting DS-260.",
        "Submit the required financial-support and civil documents for the case type and bring required originals/certified copies to the immigrant visa interview."
      ], ["Preference-limited family/employment cases may remain at NVC until the priority date permits further processing."], [], [], "Use the NVC/CEAC case instructions and the current Visa Bulletin when applicable, then prepare medical examination and interview documents.");

    case "nonimmigrant_visa_application": {
      const category = answers.nonimmigrant_visa_category;
      if (category === "other_or_not_sure" || category === undefined) {
        return result(service, "Nonimmigrant Visa / DS-160", "NEEDS_AUTHORITATIVE_CONFIRMATION", ["Resolve the intended nonimmigrant visa classification before completing DS-160 and paying/scheduling."], [], ["Supporting evidence and interview-waiver rules vary by visa category and consular post."], [], "Identify the visa category and the U.S. Embassy/Consulate that will process the application.");
      }
      const conditional: string[] = [];
      if (category === "petition_based_worker") conditional.push("Have the underlying Form I-129/I-797 petition information available and keep DS-160 answers aligned with the approved/receipted petition.");
      if (category === "student_or_exchange") conditional.push("Have the applicable SEVIS, Form I-20 or Form DS-2019 information available for DS-160 and interview preparation.");
      return result(service, "Nonimmigrant Visa / DS-160", "READY", [
        "Complete and electronically submit DS-160 for the correct visa classification.",
        "Save the DS-160 confirmation and follow the selected U.S. Embassy/Consulate's current fee, interview-waiver and appointment instructions.",
        "Prepare the visa-category-specific documents required by the processing post."
      ], conditional, ["Submitting DS-160 is the first application step; it does not itself create an interview appointment or visa eligibility."], [], "Continue with the current Embassy/Consulate instructions for the selected nonimmigrant visa category.");
    }

    case "h1b_petition": {
      const caseType = answers.h1b_case_type;
      if (caseType === "not_sure" || caseType === undefined) {
        return result(service, "H-1B Employer Petition", "NEEDS_AUTHORITATIVE_CONFIRMATION", ["Classify the H-1B filing as cap-subject selected, cap-exempt, change of employer, extension, amendment, or another supported branch."], [], [], [], "Resolve the H-1B case type before using an I-129 checklist.");
      }
      const conditional = caseType === "cap_selected" ? ["Include/align the selected H-1B registration/beneficiary confirmation and the identity document used for registration when the current cap process requires it."] : [];
      return result(service, "H-1B Employer Petition", "READY", [
        "The petitioning employer files Form I-129 under the correct H-1B branch.",
        "Use the current H-1B classification supplement and Department of Labor LCA requirements.",
        "Keep employer, beneficiary, worksite, role and requested action consistent across the petition evidence."
      ], conditional, ["Cap-subject, cap-exempt, change-employer, extension and amendment filings are not interchangeable checklists."], [], "Build the I-129 package for the exact H-1B case type, then route any later visa application separately through DS-160.");
    }

    case "h4_status": {
      const action = answers.h4_action;
      if (action === "extend_or_change_inside_us") {
        return result(service, "H-4 Extension / Change of Status", "READY", ["Confirm the applicant is eligible to use Form I-539 for the requested H-4 extension/change inside the United States.", "Align H-4 evidence with the principal H-1B status/petition and family relationship."], [], [], [], "Continue with the current Form I-539 H-4 extension/change-of-status instructions.");
      }
      if (action === "visa_abroad") {
        return result(service, "H-4 Visa Abroad", "READY", ["Use the Department of State nonimmigrant visa process and DS-160 for H-4 visa issuance abroad.", "Prepare the principal H-1B petition/status evidence, relationship evidence and post-specific visa documents."], [], ["Do not file Form I-539 merely to obtain an H-4 visa stamp abroad."], [], "Follow the selected U.S. Embassy/Consulate's current H-4 visa instructions after DS-160.");
      }
      return result(service, "H-4 Status or Visa", "NEEDS_AUTHORITATIVE_CONFIRMATION", ["Determine whether the applicant needs an extension/change of H-4 status inside the U.S. or an H-4 visa abroad."], [], [], [], "Resolve inside-U.S. status versus visa-abroad before choosing I-539 or DS-160.");
    }

    case "h4_ead": {
      const basis = answers.h4_ead_basis;
      if (basis === "neither") {
        return result(service, "H-4 Employment Authorization (c)(26)", "NOT_READY", [], [], [], ["The selected facts do not show the qualifying H-1B principal basis required for H-4 spouse EAD under category (c)(26): approved I-140 or a qualifying AC21 H-1B extension basis."], "Confirm whether a qualifying basis exists before filing Form I-765 under (c)(26).");
      }
      if (basis === "not_sure" || basis === undefined) {
        return result(service, "H-4 Employment Authorization (c)(26)", "NEEDS_AUTHORITATIVE_CONFIRMATION", ["Determine whether the H-1B principal has an approved I-140 or a qualifying AC21 extension basis."], [], [], [], "Resolve the (c)(26) eligibility basis before building the I-765 package.");
      }
      return result(service, "H-4 Employment Authorization (c)(26)", "READY", [
        "File Form I-765 using the correct H-4 spouse eligibility category (c)(26).",
        "Document current H-4 status/extension and the qualifying marital relationship.",
        basis === "approved_i140" ? "Document the H-1B principal's approved Form I-140 basis." : "Document the qualifying AC21 H-1B extension basis."
      ], [], [], [], "Continue with the current I-765 (c)(26) instructions and evidence for initial, renewal or replacement as applicable.");
    }

    case "employment_authorization": {
      const known = answers.ead_category_known;
      if (known === false || known === undefined) {
        return result(service, "Employment Authorization Document (Form I-765)", "NEEDS_AUTHORITATIVE_CONFIRMATION", ["Identify the exact I-765 eligibility category before using a document checklist."], [], ["I-765 is shared by many categories; selecting the wrong eligibility code can change evidence, fee and filing rules."], [], "Resolve the eligibility category and whether this is an initial, renewal or replacement request.");
      }
      return result(service, "Employment Authorization Document (Form I-765)", "READY", ["Use Form I-765 under the exact eligibility category.", "Classify the request as initial, renewal or replacement and use the current category-specific evidence/filing instructions."], [], [], [], "Continue with the current Form I-765 instructions for the resolved eligibility category.");
    }

    case "travel_document": {
      const type = answers.travel_document_type;
      if (type === "other_or_not_sure" || type === undefined) {
        return result(service, "USCIS Travel Document", "NEEDS_AUTHORITATIVE_CONFIRMATION", ["Identify whether the requested document is advance parole, reentry permit, refugee travel document, TPS travel authorization or another current I-131 family use."], [], [], [], "Resolve the travel-document type before using an I-131 checklist.");
      }
      const warnings = type === "advance_parole" ? ["Advance parole does not guarantee admission; CBP makes the admission/parole decision at the port of entry. Travel while Form I-485 is pending can affect the adjustment case subject to category-specific exceptions."] : [];
      return result(service, "USCIS Travel Document", "READY", ["Use the current Form I-131 route for the selected travel-document type.", "Follow the type-specific evidence, biometrics and presence/travel rules rather than a generic I-131 checklist."], [], warnings, [], "Continue with the current I-131 instructions for the selected travel-document family.");
    }

    case "green_card_replace_or_renew": {
      const action = answers.green_card_action;
      if (action === "remove_marriage_conditions") {
        return result(service, "Remove Marriage-Based Conditions", "NOT_READY", [], [], [], ["Form I-90 is not the route to remove conditions from a two-year marriage-based Permanent Resident Card."], "Use the Form I-751 removal-of-conditions process rather than I-90.");
      }
      if (action === "remove_investor_conditions") {
        return result(service, "Remove Investor Conditions", "NOT_READY", [], [], [], ["Form I-90 is not the route to remove conditions from conditional permanent residence based on investment."], "Use the Form I-829 removal-of-conditions process rather than I-90.");
      }
      if (action === "not_sure" || action === undefined) {
        return result(service, "Green Card Maintenance", "NEEDS_AUTHORITATIVE_CONFIRMATION", ["Determine whether the need is ten-year card renewal, replacement/correction, or removal of two-year conditions."], [], [], [], "Resolve card type and requested action before choosing I-90, I-751 or I-829.");
      }
      return result(service, "Renew / Replace / Correct Green Card", "READY", ["Use Form I-90 for the resolved ten-year-card renewal, qualifying replacement or card-correction branch.", "Use the current branch-specific evidence and fee rules."], [], [], [], "Continue with the current I-90 instructions for the selected card-maintenance action.");
    }

    case "naturalization": {
      const mayAlready = answers.naturalization_may_already_be_citizen;
      if (mayAlready === true) {
        return result(service, "Naturalization / Citizenship", "NOT_READY", [], [], [], ["The applicant may already have acquired or derived U.S. citizenship. Do not file N-400 merely to obtain citizenship evidence before resolving existing citizenship status."], "Resolve whether the person is already a U.S. citizen and the correct citizenship-documentation route before considering N-400.");
      }
      return result(service, "Naturalization (Form N-400)", "NEEDS_AUTHORITATIVE_CONFIRMATION", ["Identify the N-400 eligibility basis, such as the general lawful-permanent-resident rule, marriage-based rule or another supported provision.", "Verify residence, physical-presence, continuous-residence and other basis-specific requirements before filing."], [], ["The classifier does not predict discretionary adjudication or replace applicant-specific legal analysis."], [], "Run a basis-specific naturalization eligibility checklist before filing N-400.");
    }

    case "change_of_address": {
      const pending = answers.change_address_pending_uscis_case;
      const conditional = pending === true ? ["Update the address for each relevant pending USCIS case so notices/documents route correctly."] : [];
      return result(service, "USCIS Change of Address", "READY", ["Most noncitizens subject to the requirement should report the new address to USCIS within the current required timeframe.", "Do not rely on a USPS forwarding/change-of-address request to update USCIS."], [...conditional, "If the immigration case is in Department of State/NVC processing, update that agency separately when required.", "Affidavit-of-support sponsors may have a separate Form I-865 address-reporting duty."], [], [], "Use the current USCIS change-of-address service and separately update every other agency/case record that has an independent address requirement.");
    }

    case "i94_record_or_correction": {
      const issue = answers.i94_issue;
      if (issue === "retrieve_record") {
        return result(service, "Retrieve I-94", "READY", ["Retrieve the latest electronic I-94 from the official CBP I-94 service and verify class of admission and admit-until information."], [], [], [], "Save/verify the current I-94 and investigate any discrepancy before relying on it for another filing.");
      }
      if (issue === "not_found") {
        return result(service, "I-94 Not Found", "READY", ["Retry the CBP I-94 search using biographic and travel-document information exactly as used at admission.", "If the record still cannot be found, follow current CBP support/Deferred Inspection guidance."], [], [], [], "Resolve the missing CBP admission record before using I-94 data in another application.");
      }
      if (issue === "cbp_entry_error") {
        return result(service, "Correct CBP Entry I-94", "READY", ["Contact an appropriate CBP Deferred Inspection Site for review of an error made at the port of entry.", "Bring the admission/travel and status evidence needed to show the correct classification, biographic data or authorized period."], [], [], [], "Use CBP Deferred Inspection for a CBP-created entry error.");
      }
      if (issue === "uscis_issued_error") {
        return result(service, "Correct USCIS-Issued I-94", "READY", ["Use the USCIS correction/replacement route applicable to an I-94 issued by USCIS rather than asking CBP Deferred Inspection to change a USCIS-created record."], [], [], [], "Follow the current USCIS correction instructions for the notice/I-94 that contains the error.");
      }
      if (issue === "extend_or_change_status") {
        return result(service, "Extend / Change Nonimmigrant Status", "NOT_READY", [], [], [], ["CBP Deferred Inspection corrects qualifying CBP admission errors; it is not a substitute for a USCIS extension-of-stay or change-of-status application."], "Use the status-specific USCIS petition/application route, such as Form I-539 where eligible, instead of asking CBP to rewrite the I-94.");
      }
      return result(service, "I-94 Record / Correction", "NEEDS_AUTHORITATIVE_CONFIRMATION", ["Determine whether the need is record retrieval, a CBP port-of-entry error, a USCIS-issued I-94 error, or an actual request to extend/change status."], [], [], [], "Identify who created the record and what outcome is needed before choosing CBP or USCIS.");
    }

    case "not_sure":
    case "not_resolved":
    default:
      return result(service, "U.S. Immigration & Visa Service Classification", "NEEDS_AUTHORITATIVE_CONFIRMATION", [
        "Identify the intended outcome first: permanent residence, temporary visa/status, employment authorization, travel document, resident-card maintenance, citizenship, address update or I-94 correction.",
        "Identify whether the applicant/beneficiary is inside or outside the United States when that changes the controlling agency."
      ], [], ["Choosing a form before identifying the service family can send a case to the wrong agency or stage."], [], "Choose the desired immigration outcome and current case stage before collecting a filing checklist.");
  }
}
