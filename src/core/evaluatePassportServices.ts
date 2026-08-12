import type { PassportAnswers, ResultStatus } from "../types";

export type PassportServiceRouterResult = {
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

const VERIFIED = "2026-08-12";

function result(
  serviceFamily: string,
  title: string,
  status: ResultStatus,
  requiredItems: string[],
  conditionalItems: string[],
  warnings: string[],
  blockers: string[],
  nextStep: string
): PassportServiceRouterResult {
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

export function evaluatePassportServices(answers: PassportAnswers): PassportServiceRouterResult {
  const service = typeof answers.requested_passport_service === "string" ? answers.requested_passport_service : "not_resolved";

  switch (service) {
    case "fresh_ordinary_passport": {
      const held = answers.fresh_ever_held_ordinary_passport;
      if (held === true) {
        return result(
          service,
          "Fresh Ordinary Passport",
          "NOT_READY",
          [],
          [],
          [],
          ["You indicated that the applicant has previously held an Ordinary Indian Passport. That normally requires the Re-issue service family rather than Fresh."],
          "Return to the service router and choose Passport Re-issue unless an authoritative Mission instruction says Fresh is required for this case."
        );
      }
      return result(
        service,
        "Fresh Ordinary Passport",
        held === false ? "READY" : "NEEDS_AUTHORITATIVE_CONFIRMATION",
        [
          "Use the Government Passport Seva Fresh Ordinary Passport application branch.",
          "Resolve adult/minor category and the correct Indian Mission/Post for the applicant's U.S. residence.",
          "Use the current Passport Seva Fresh document advisor for the exact applicant category.",
          "Complete the required online photograph/signature upload and the current VFS registration/payment/submission flow."
        ],
        [
          "For a U.S.-born child, complete the applicable Consular birth registration / citizenship-by-descent prerequisite before treating the passport package as ready.",
          "Tatkaal is not assumed for every Fresh category; run the current eligibility rules before choosing it."
        ],
        ["This router verifies the service family; it does not replace the applicant-specific Fresh document advisor."],
        [],
        "Continue with the Fresh Ordinary Passport checklist and current Passport Seva document advisor."
      );
    }

    case "passport_reissue": {
      const held = answers.reissue_ever_held_ordinary_passport;
      if (held === false) {
        return result(
          service,
          "Passport Re-issue",
          "NOT_READY",
          [],
          [],
          [],
          ["You indicated that the applicant has never held an Ordinary Indian Passport. A routine Re-issue route is therefore inconsistent with the applicant facts."],
          "Return to the service router and choose Fresh Ordinary Passport unless another authoritative travel-document category applies."
        );
      }
      return result(
        service,
        "Passport Re-issue",
        held === true ? "READY" : "NEEDS_AUTHORITATIVE_CONFIRMATION",
        [
          "Use the detailed Passport Re-issue preflight already published in Official Checklist.",
          "Resolve the exact Re-issue reason: expiry/due-to-expire, pages exhausted, lost/stolen, damaged, Short Validity Passport renewal, change in particulars, or another authoritative case.",
          "Resolve jurisdiction, Regular/Tatkaal eligibility, booklet/validity, fees and the correct adult/minor checklist before submission."
        ],
        ["Lost/stolen, damaged, change-of-particulars and Short Validity Passport cases have additional branch-specific controls."],
        [],
        [],
        "Open 'Indian Passport Re-issue in the U.S.' from All Processes and run the full preflight."
      );
    }

    case "renewal_short_validity_passport": {
      const held = answers.svp_ever_held_ordinary_passport;
      if (held === false) {
        return result(service, "Renewal of Short Validity Passport", "NOT_READY", [], [], [], ["Short Validity Passport renewal is a Re-issue case and requires a previously issued passport."], "Choose the service family that matches the applicant's actual document history.");
      }
      return result(
        service,
        "Renewal of Short Validity Passport",
        "NEEDS_AUTHORITATIVE_CONFIRMATION",
        [
          "Classify the application as Ordinary Passport → Re-issue → Renewal of Short Validity Passport.",
          "Preserve the reason the earlier passport was issued with short validity.",
          "Use the current SVP-specific evidence requested for that original reason."
        ],
        [],
        ["Do not collapse SVP renewal into ordinary expiry. The evidence can depend on why short validity was imposed."],
        [],
        "Confirm the SVP-specific evidence with the current Mission/VFS guidance, then continue through the Re-issue preflight."
      );
    }

    case "emergency_certificate": {
      const oneWay = answers.ec_one_way_return_to_india;
      if (oneWay === false) {
        return result(service, "Emergency Certificate", "NOT_READY", [], [], [], ["An Emergency Certificate is a one-way emergency travel document to India. It is not the correct path when the applicant needs a normal passport for continuing international travel."], "Choose Regular/Tatkaal passport processing or another travel-document category that matches the required travel outcome.");
      }
      return result(
        service,
        "Emergency Certificate",
        oneWay === true ? "READY" : "NEEDS_AUTHORITATIVE_CONFIRMATION",
        [
          "Use the Mission-controlled Emergency Certificate application rather than the normal VFS passport Re-issue package.",
          "Prepare the current EC application, photographs, EC affidavit, passport copies/original when available, U.S. address proof, travel statement and current EC/ICWF payment.",
          "For lost/stolen cases include the police report; for lost/stolen/damaged cases include Annexure F."
        ],
        ["Additional undertaking/affidavit requirements depend on passport availability, U.S. status and the applicant's circumstances."],
        ["Issuance timing depends on confirmation of passport particulars and Indian nationality; do not assume same-day issuance."],
        [],
        "Follow the responsible Indian Mission's current Emergency Certificate instructions and submission route."
      );
    }

    case "police_clearance_certificate": {
      const touristOnly = answers.pcc_tourist_visa_only;
      if (touristOnly === true) {
        return result(service, "Police Clearance Certificate (PCC)", "NOT_READY", [], [], [], ["Current VFS PCC guidance states that the Indian-national PCC service is not issued for persons going abroad on a tourist visa."], "Confirm the actual purpose and use the service that matches it before paying or submitting.");
      }
      return result(
        service,
        "Police Clearance Certificate (PCC)",
        touristOnly === false ? "READY" : "NEEDS_AUTHORITATIVE_CONFIRMATION",
        [
          "Complete the Government Passport Seva PCC application and record the ARN/application reference.",
          "Resolve the correct Indian Mission/VFS centre from U.S. residence.",
          "Use the current PCC-specific VFS checklist, submission route and fee display."
        ],
        [],
        ["PCC supporting documents and fees are dynamic by applicant facts/jurisdiction; do not reuse the passport Fresh/Re-issue checklist."],
        [],
        "Open the current VFS PCC workflow for the verified jurisdiction and prepare its applicant-specific checklist."
      );
    }

    case "global_entry_background_verification":
      return result(
        service,
        "Global Entry Program Background Verification",
        "READY",
        [
          "Apply for Global Entry with U.S. CBP first.",
          "Submit the required information through Passport Seva for India-side background verification.",
          "Submit the physical application, current passport copy, present-address proof and applicable fee through the current VFS route."
        ],
        [],
        ["This is not PCC or passport issuance. The Consulate does not define a firm processing timeline because multiple government departments participate in vetting."],
        [],
        "Continue with the current CGI/VFS Global Entry Program background-verification instructions."
      );

    case "surrender_indian_passport": {
      const acquired = answers.surrender_acquired_foreign_nationality;
      if (acquired === false) {
        return result(service, "Surrender of Indian Passport", "NOT_READY", [], [], [], ["You indicated that the applicant has not acquired foreign nationality. Do not enter the surrender branch solely because the passport is expiring or no longer needed."], "Use Fresh/Re-issue or another service that matches the applicant's citizenship and passport facts.");
      }
      return result(
        service,
        "Surrender of Indian Passport",
        acquired === true ? "READY" : "NEEDS_AUTHORITATIVE_CONFIRMATION",
        [
          "Use the Government Surrender service rather than Passport Fresh/Re-issue/PCC.",
          "Resolve whether the Indian passport is available, lost or otherwise unavailable because supporting evidence can differ.",
          "Complete the mandatory online photograph/signature upload and the current VFS surrender checklist/submission route."
        ],
        [],
        ["A former Indian citizen who has acquired another country's nationality must not continue using an Indian passport."],
        [],
        "Continue with the current Government/VFS Surrender of Indian Passport workflow."
      );
    }

    case "diplomatic_passport":
    case "official_passport":
      return result(
        service,
        service === "diplomatic_passport" ? "Diplomatic Passport" : "Official Passport",
        "NEEDS_AUTHORITATIVE_CONFIRMATION",
        [
          "Confirm entitlement and official sponsorship through the competent Government authority.",
          "Use the Passport Seva Diplomatic/Official Passport workflow and designated institutional submission channel.",
          "Prepare the category-specific official ID, Head of Office/forwarding documents, clearance and existing-passport/safe-custody evidence required for the case."
        ],
        [],
        ["Diplomatic/Official passports are separate categories, not ordinary-passport upgrades. Do not use the ordinary VFS Fresh/Re-issue checklist unless an authoritative instruction explicitly requires it."],
        [],
        "Confirm the sponsoring authority and designated Passport Seva/Mission route before collecting or submitting the final package."
      );

    case "identity_certificate":
      return result(
        service,
        "Identity Certificate",
        "NEEDS_AUTHORITATIVE_CONFIRMATION",
        [
          "Confirm that the applicant is legally eligible for an Identity Certificate rather than an Ordinary Indian Passport.",
          "Resolve the competent issuing authority and current jurisdiction-specific workflow.",
          "Collect only the category-specific evidence requested by the current authoritative source."
        ],
        [],
        ["The current U.S. OKF bundle verifies this travel-document family but does not yet have a universal U.S. applicant checklist."],
        [],
        "Confirm the applicant's Identity Certificate eligibility and Mission-specific checklist before proceeding."
      );

    case "passport_adverse_action_appeal": {
      const received = answers.appeal_adverse_action_received;
      if (received === false) {
        return result(service, "Passport Adverse Action / Appeal", "NOT_READY", [], [], [], ["The appeal route is for an actual passport rejection/refusal, impounding, revocation or other appealable adverse action."], "Use the routine service family that matches the applicant's actual request unless an adverse-action notice exists.");
      }
      return result(
        service,
        "Passport Adverse Action / Appeal",
        "NEEDS_AUTHORITATIVE_CONFIRMATION",
        [
          "Capture the adverse-action notice, authority, file/application reference and date exactly as issued.",
          "Use the Passport Seva appeal route for the affected application/file where the location is supported.",
          "Prepare the speaking order/adverse-action notice and other supporting documents required for the specific appeal."
        ],
        [],
        ["Preserve any deadline and the authority named in the notice. Do not file a replacement Fresh/Re-issue application merely to bypass the adverse action unless instructed by the deciding authority."],
        [],
        "Review the actual adverse-action notice and current Passport Seva appeal instructions before filing."
      );
    }

    case "not_sure":
    case "not_resolved":
    default:
      return result(
        service,
        "Indian Passport Service Classification",
        "NEEDS_AUTHORITATIVE_CONFIRMATION",
        [
          "Determine the requested outcome first: first ordinary passport, replacement/renewal, one-way emergency travel, PCC, GEP verification, surrender after foreign nationality, special passport/travel document, or appeal.",
          "Do not collect a document checklist until the service family is resolved."
        ],
        [],
        ["Choosing the wrong service family can invalidate Government/VFS forms, fees, appointments and supporting documents."],
        [],
        "Review the service descriptions and select the outcome that matches the applicant's facts."
      );
  }
}
