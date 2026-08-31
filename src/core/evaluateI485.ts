import type { PassportAnswers, ResultStatus } from "../types";

export type I485Result = {
  status: ResultStatus;
  basis: string;
  stage: string;
  filing_chart: string;
  filing_cutoff: string | null;
  filing_eligible: boolean | null;
  final_action_cutoff: string | null;
  final_action_eligible: boolean | null;
  required_items: string[];
  conditional_items: string[];
  blockers: string[];
  warnings: string[];
  next_step: string;
  sources_verified: string;
};

type Group = "eb1"|"eb2"|"eb3"|"other_workers"|"eb4"|"eb5_unreserved"|"eb5_set_aside";
type Country = "india"|"china_mainland"|"mexico"|"philippines"|"all_other";
type Cutoff = "C"|"U"|string;
type BasisRule = { group: Group; jobOfferBased: boolean; portabilityEligible: boolean; petitionFamily: string; };

const VERIFIED = "2026-08-30";
const BASIS: Record<string, BasisRule> = {
  eb1a:{group:"eb1",jobOfferBased:false,portabilityEligible:false,petitionFamily:"I-140 E11"},
  eb1b:{group:"eb1",jobOfferBased:true,portabilityEligible:true,petitionFamily:"I-140 E12"},
  eb1c:{group:"eb1",jobOfferBased:true,portabilityEligible:true,petitionFamily:"I-140 E13"},
  eb2_regular:{group:"eb2",jobOfferBased:true,portabilityEligible:true,petitionFamily:"I-140 E21"},
  eb2_niw:{group:"eb2",jobOfferBased:false,portabilityEligible:false,petitionFamily:"I-140 E21 NIW"},
  eb3_skilled:{group:"eb3",jobOfferBased:true,portabilityEligible:true,petitionFamily:"I-140 E31"},
  eb3_professional:{group:"eb3",jobOfferBased:true,portabilityEligible:true,petitionFamily:"I-140 E32"},
  eb3_other:{group:"other_workers",jobOfferBased:true,portabilityEligible:true,petitionFamily:"I-140 EW3"},
  schedule_a_eb2:{group:"eb2",jobOfferBased:true,portabilityEligible:true,petitionFamily:"I-140 Schedule A EB-2"},
  schedule_a_eb3:{group:"eb3",jobOfferBased:true,portabilityEligible:true,petitionFamily:"I-140 Schedule A EB-3"},
  eb4:{group:"eb4",jobOfferBased:false,portabilityEligible:false,petitionFamily:"I-360/category-specific"},
  eb5_unreserved:{group:"eb5_unreserved",jobOfferBased:false,portabilityEligible:false,petitionFamily:"I-526/I-526E"},
  eb5_set_aside:{group:"eb5_set_aside",jobOfferBased:false,portabilityEligible:false,petitionFamily:"I-526/I-526E"}
};

const BULLETINS: Record<string, Record<"dates_for_filing"|"final_action", Record<Group, Record<Country,Cutoff>>>> = {
  august_2026:{
    final_action:{
      eb1:{all_other:"C",china_mainland:"2023-07-01",india:"2022-10-15",mexico:"C",philippines:"C"},
      eb2:{all_other:"C",china_mainland:"2021-09-01",india:"U",mexico:"C",philippines:"C"},
      eb3:{all_other:"2024-09-01",china_mainland:"2022-01-01",india:"2014-01-01",mexico:"2024-09-01",philippines:"2023-08-01"},
      other_workers:{all_other:"2022-04-01",china_mainland:"2019-05-01",india:"2014-01-01",mexico:"2022-04-01",philippines:"2021-12-01"},
      eb4:{all_other:"2022-10-15",china_mainland:"2022-10-15",india:"2022-10-15",mexico:"2022-10-15",philippines:"2022-10-15"},
      eb5_unreserved:{all_other:"C",china_mainland:"2016-12-01",india:"U",mexico:"C",philippines:"C"},
      eb5_set_aside:{all_other:"C",china_mainland:"C",india:"C",mexico:"C",philippines:"C"}},
    dates_for_filing:{
      eb1:{all_other:"C",china_mainland:"2023-12-01",india:"2023-12-01",mexico:"C",philippines:"C"},
      eb2:{all_other:"C",china_mainland:"2022-01-01",india:"2015-01-15",mexico:"C",philippines:"C"},
      eb3:{all_other:"C",china_mainland:"2022-01-08",india:"2015-01-15",mexico:"C",philippines:"2024-01-01"},
      other_workers:{all_other:"2022-08-01",china_mainland:"2019-10-01",india:"2015-01-15",mexico:"2022-08-01",philippines:"2022-08-01"},
      eb4:{all_other:"2023-01-01",china_mainland:"2023-01-01",india:"2023-01-01",mexico:"2023-01-01",philippines:"2023-01-01"},
      eb5_unreserved:{all_other:"C",china_mainland:"2017-03-01",india:"2024-05-01",mexico:"C",philippines:"C"},
      eb5_set_aside:{all_other:"C",china_mainland:"C",india:"C",mexico:"C",philippines:"C"}}
  },
  september_2026:{
    final_action:{
      eb1:{all_other:"C",china_mainland:"2023-07-01",india:"2022-10-15",mexico:"C",philippines:"C"},
      eb2:{all_other:"C",china_mainland:"2021-09-01",india:"U",mexico:"C",philippines:"C"},
      eb3:{all_other:"2024-09-01",china_mainland:"2022-01-01",india:"2014-01-01",mexico:"2024-09-01",philippines:"2023-08-01"},
      other_workers:{all_other:"2022-04-01",china_mainland:"2019-05-01",india:"2014-01-01",mexico:"2022-04-01",philippines:"2021-12-01"},
      eb4:{all_other:"2022-12-15",china_mainland:"2022-12-15",india:"2022-12-15",mexico:"2022-12-15",philippines:"2022-12-15"},
      eb5_unreserved:{all_other:"C",china_mainland:"2016-12-01",india:"U",mexico:"C",philippines:"C"},
      eb5_set_aside:{all_other:"C",china_mainland:"C",india:"C",mexico:"C",philippines:"C"}},
    dates_for_filing:{
      eb1:{all_other:"C",china_mainland:"2023-12-01",india:"2023-12-01",mexico:"C",philippines:"C"},
      eb2:{all_other:"C",china_mainland:"2022-01-01",india:"2015-01-15",mexico:"C",philippines:"C"},
      eb3:{all_other:"C",china_mainland:"2022-01-08",india:"2015-01-15",mexico:"C",philippines:"2024-01-01"},
      other_workers:{all_other:"2022-08-01",china_mainland:"2019-10-01",india:"2015-01-15",mexico:"2022-08-01",philippines:"2022-08-01"},
      eb4:{all_other:"2023-01-01",china_mainland:"2023-01-01",india:"2023-01-01",mexico:"2023-01-01",philippines:"2023-01-01"},
      eb5_unreserved:{all_other:"C",china_mainland:"2017-03-01",india:"2024-05-01",mexico:"C",philippines:"C"},
      eb5_set_aside:{all_other:"C",china_mainland:"C",india:"C",mexico:"C",philippines:"C"}}
  }
};

function s(a:PassportAnswers,k:string,f="not_sure"){const v=a[k];return typeof v==="string"?v:f;}
function dateOk(v:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+"T00:00:00Z");return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===v;}
function eligible(c:Cutoff|null,p:string|null){if(!c||!p||!dateOk(p))return null;if(c==="C")return true;if(c==="U")return false;return p<c;}

export function evaluateI485(a:PassportAnswers):I485Result{
  const basis=s(a,"i485_basis"), stage=s(a,"i485_stage","planning"), rule=BASIS[basis];
  const country=s(a,"chargeability_country") as Country|"not_sure";
  const month=s(a,"bulletin_month","later_or_not_sure"), chart=s(a,"uscis_chart_selection","not_checked");
  const pd=a.priority_date_known===true&&typeof a.priority_date==="string"?a.priority_date.trim():null;
  const blockers:string[]=[], warnings:string[]=[], required:string[]=[], conditional:string[]=[]; let confirmNeeded=false;
  const block=(m:string)=>blockers.push(m); const confirm=(m:string)=>{warnings.push(m);confirmNeeded=true;};

  if(!rule||basis==="not_sure")confirm("Resolve the exact employment-based adjustment basis and Visa Bulletin row before filing.");
  const location=s(a,"beneficiary_location");
  if(location==="outside_us") block("Form I-485 is the U.S. adjustment route. An applicant outside the United States must resolve consular processing instead of using this filing path.");
  else if(location==="not_sure") confirm("Confirm that the applicant will be physically present in the United States and using adjustment rather than consular processing.");
  const admission=s(a,"inspected_admitted_or_paroled");
  if(admission==="no")block("The standard INA 245(a) inspection/admission/parole gate is not satisfied as recorded. Do not proceed without evaluating a different statutory adjustment basis, if any.");
  else if(admission==="not_sure")confirm("Confirm the applicant's inspection/admission/parole and adjustment jurisdiction before filing.");

  const petition=s(a,"underlying_petition_status");
  if(petition==="denied")block("The underlying immigrant petition is denied and cannot presently support this I-485 path.");
  else if(petition==="not_filed")confirm("Confirm whether the underlying petition may be concurrently filed in this category and month; do not assume concurrent filing is available.");
  else if(petition==="not_sure")confirm("Confirm the underlying immigrant petition posture before filing I-485.");
  required.push(`Document the underlying ${rule?.petitionFamily??"employment-based immigrant petition"} basis and its pending/approved posture.`);

  let filingCutoff:Cutoff|null=null, finalCutoff:Cutoff|null=null, filingEligible:boolean|null=null, finalEligible:boolean|null=null;
  if(!pd||!dateOk(pd))confirm("Enter and verify the employment-based priority date before calculating visa availability.");
  if(country==="not_sure")confirm("Resolve country of chargeability before applying Visa Bulletin cutoffs.");
  const bulletin=BULLETINS[month];
  if(!bulletin)confirm("The selected filing month is outside the bundled August/September 2026 Visa Bulletin data. Refresh authoritative DOS and USCIS chart-selection sources.");
  if(rule&&bulletin&&country!=="not_sure"){
    finalCutoff=bulletin.final_action[rule.group][country]; finalEligible=eligible(finalCutoff,pd);
    if(chart==="final_action"||chart==="dates_for_filing"){
      filingCutoff=bulletin[chart][rule.group][country]; filingEligible=eligible(filingCutoff,pd);
      if(filingEligible===false)block(`Priority date ${pd??"unknown"} is not earlier than the selected ${chart.replaceAll("_"," ")} cutoff ${filingCutoff}.`);
    } else confirm("Verify the USCIS-selected employment-based filing chart for this month; do not choose the more favorable DOS chart yourself.");
    if(finalEligible===false)warnings.push(`Final Action is not currently available for this priority date (cutoff ${finalCutoff}). A properly filed I-485 cannot be approved until a visa number is available.`);
  }

  const statusHistory=s(a,"status_history_245k");
  if(statusHistory==="possible_180_or_less_since_last_lawful_admission"){
    const lawfulAdmission=s(a,"last_entry_for_245k_was_lawful_admission");
    if(lawfulAdmission==="no")block("The potential INA 245(k) calculation is not anchored to a most recent lawful admission as required for that exemption. Evaluate another adjustment basis instead of relying on 245(k).");
    else if(lawfulAdmission==="not_sure")confirm("Confirm the applicant's most recent lawful admission before relying on INA 245(k).");
    if(rule?.group==="eb1"||rule?.group==="eb2"||rule?.group==="eb3"||rule?.group==="other_workers") confirm("A possible INA 245(k) case is recorded. Verify the category and aggregate covered violations since the most recent lawful admission; do not rely on an approximate day count.");
    else confirm("The selected category's eligibility for INA 245(k) relief must be confirmed; do not assume every employment-based category is covered identically.");
  } else if(statusHistory==="over_180_since_last_lawful_admission") block("The recorded covered status/unauthorized-employment violations exceed the 180-day INA 245(k) threshold. The standard 245(k) route does not cure this record; evaluate other statutory options separately.");
  else if(statusHistory==="other_or_not_sure") confirm("Resolve status history, unauthorized employment, and any INA 245(c)/245(k) issue before filing.");
  if(a.complex_adjustment_issue===true)confirm("A material admissibility, removal, J-1 212(e), fraud/misrepresentation, criminal, immigration-history or other individualized issue requires authoritative review before adjustment.");

  const newFiling=["planning","ready_to_file"].includes(stage);
  const edition=s(a,"current_i485_edition_confirmed");
  if(newFiling&&edition==="no")block("The current Form I-485 edition/instructions have not been confirmed."); else if(newFiling&&edition!=="yes")confirm("Confirm the current Form I-485 edition, fee and filing location immediately before filing.");
  const medical=s(a,"i693_status");
  if(newFiling&&medical==="not_ready")block("The required Form I-693 medical package is not ready; current USCIS policy can reject an I-485 filed without required I-693 initial evidence.");
  else if(newFiling&&medical==="not_required_confirmed")confirm("The I-693 is marked not required. Reconfirm that conclusion against the current I-485/I-693 instructions for this applicant before filing.");
  else if(newFiling&&medical==="not_sure")confirm("Confirm whether a current, complete Form I-693 is required and ready with this I-485 filing.");
  required.push("Prepare the current I-485 package with identity/civil records, admission/status evidence, immigrant-basis evidence, and current visa-availability support.");

  const sj=s(a,"supplement_j_status");
  if(rule?.jobOfferBased){
    if(petition==="approved"&&newFiling&&sj!=="ready"){
      if(sj==="not_applicable")block("This job-offer-based approved-petition filing is marked Supplement J not applicable; verify and correct the filing posture."); else confirm("Confirm and prepare Supplement J to document the continuing bona fide job offer when required.");
    }
    conditional.push("Supplement J may confirm the continuing bona fide job offer and is also used for qualifying INA 204(j) portability.");
  } else conditional.push("EB-1A and NIW do not use Supplement J merely to confirm a job offer or request 204(j) portability.");

  if(a.include_derivatives===true){const d=s(a,"derivative_status");conditional.push("Prepare a separate I-485 eligibility/evidence package for each qualifying derivative spouse or child.");if(d==="issue")confirm("A derivative relationship/age/eligibility issue is recorded; evaluate that derivative separately without blocking the principal automatically.");else if(d==="not_sure")confirm("Confirm each derivative's qualifying relationship, age/CSPA issues where relevant, admission/status and admissibility.");}
  if(a.request_i765_c9===true)conditional.push("Prepare a separate Form I-765 under the current pending-adjustment eligibility category, generally (c)(9), using current fees/instructions.");
  if(a.request_i131_advance_parole===true)conditional.push("Prepare a separate Form I-131 Advance Parole request using current fees/instructions; a pending request is not permission to travel.");
  if(a.planned_international_travel_before_i485_decision===true){const t=s(a,"travel_document_or_exception_confirmed");if(t==="no")block("International travel is planned without a confirmed Advance Parole document or recognized abandonment exception. Do not depart based on a pending I-131 alone.");else if(t==="not_sure")confirm("Confirm the travel document/exception and abandonment consequences before any departure while I-485 is pending.");}

  if(a.job_change_or_portability_requested===true){
    if(!rule?.portabilityEligible){confirm("This basis does not use ordinary INA 204(j) portability. Evaluate the underlying classification-specific change-of-employment/work-plan rules instead.");}
    else {const days=typeof a.i485_pending_days==="number"?a.i485_pending_days:null; if(days===null)confirm("Enter the I-485 pending duration before evaluating INA 204(j) portability."); else if(days<180)block(`The I-485 has been pending ${days} days; ordinary INA 204(j) portability requires at least 180 days.`);
      const same=s(a,"new_job_same_or_similar"); if(same==="no")block("The proposed new job is recorded as not in the same or a similar occupational classification, so the stated 204(j) portability route is not satisfied."); else if(same==="not_sure")confirm("Confirm that the new permanent job is in the same or a similar occupational classification.");
      const p=s(a,"portability_supplement_j_ready"); if(p==="no")block("A qualifying 204(j) portability request requires the Supplement J portability package; it is recorded as not ready."); else if(p==="not_sure")confirm("Confirm the Supplement J portability package and new permanent job offer.");
    }
  }
  if(a.transfer_underlying_basis_requested===true)confirm("Transfer of underlying basis is a separate discretionary process. Verify continuing eligibility, visa availability for the new basis, petition matching, and the effect on the 180-day portability clock.");

  if(stage==="rfe"||stage==="noid"){const r=s(a,"rfe_or_noid_response_status");required.push("Use the actual USCIS notice as the controlling response checklist and deadline.");if(r==="deadline_missed")block("The recorded USCIS RFE/NOID response deadline was missed. Immediate authoritative review is required.");else if(r==="not_sure")confirm("Verify the notice deadline and ensure every stated issue is answered.");else confirm("Response sufficiency remains notice- and evidence-specific even when submitted on time.");}
  if(stage==="interview"){const i=s(a,"interview_notice_status");if(i==="missed")block("The adjustment interview is recorded as missed. Follow the actual USCIS notice immediately.");else if(i!=="scheduled_and_ready")confirm("Use the actual interview notice for date, location, originals and requested evidence.");}

  if(stage==="approved"&&finalEligible===false)block("The answers record I-485 as approved while the bundled Final Action calculation shows no visa number available. Recheck the bulletin month, priority date, chargeability and decision date.");

  let next="Resolve the remaining filing-chart, adjustment-eligibility and initial-evidence gates before filing Form I-485.";
  if(["filed_pending","biometrics"].includes(stage))next=finalEligible===true?"Keep the employment basis valid, monitor USCIS notices, and preserve Final Action availability through adjudication.":"Keep the I-485 pending and employment basis valid; monitor monthly Final Action availability and USCIS notices.";
  if(stage==="rfe"||stage==="noid")next="Respond to the actual USCIS notice by its stated deadline; do not substitute the generic checklist for the notice-specific response.";
  if(stage==="interview")next="Follow the USCIS interview notice and bring the requested originals/updated evidence; recheck Final Action availability before adjudication.";
  if(stage==="approved")next="Preserve the approval notice and verify permanent-resident card production/delivery details.";
  if(stage==="denied") {confirm("The actual I-485 decision controls any motion, appeal availability, refiling or departure consequences.");next="Review the complete denial notice and any available post-decision or alternative processing path before acting.";}

  const status:ResultStatus=blockers.length?"NOT_READY":confirmNeeded?"NEEDS_AUTHORITATIVE_CONFIRMATION":"READY";
  return {status,basis,stage,filing_chart:chart,filing_cutoff:filingCutoff,filing_eligible:filingEligible,final_action_cutoff:finalCutoff,final_action_eligible:finalEligible,required_items:[...new Set(required)],conditional_items:[...new Set(conditional)],blockers,warnings:[...new Set(warnings)],next_step:next,sources_verified:VERIFIED};
}
