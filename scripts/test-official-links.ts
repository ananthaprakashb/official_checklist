import assert from "node:assert/strict";
import { landingOfficialLinks, resultOfficialLinks } from "../src/engine/processOfficialLinks";
import { getProcessModule, listProcesses } from "../src/engine/registry";
import type { ProcessPresentation } from "../src/engine/types";
import type { PassportAnswers } from "../src/types";

const presentation: ProcessPresentation = {
  status: "READY",
  title: "Test",
  subtitle: "Test",
  summary: [],
  blockers: [],
  warnings: [],
  requiredItems: [],
  conditionalItems: [],
  nextStep: "Continue",
  sourcesVerified: "2026-08-30",
  rawResult: {}
};

function urls(processId: string, answers: PassportAnswers = {}): string[] {
  const module = getProcessModule(processId);
  assert.ok(module, `Missing live process module ${processId}`);
  return resultOfficialLinks(module, answers, presentation).map((link) => link.url);
}

const live = listProcesses().filter((entry) => entry.status === "live");
for (const entry of live) {
  const module = getProcessModule(entry.id);
  assert.ok(module, `${entry.id}: every live process must have a registered module`);
  assert.ok(module.sourceLinks.length > 0, `${entry.id}: every live process must retain source links`);

  const landing = landingOfficialLinks(module);
  assert.ok(landing.length > 0, `${entry.id}: every live process must expose at least one official work link`);
  assert.equal(new Set(landing.map((link) => link.url)).size, landing.length, `${entry.id}: landing official links must be unique`);

  for (const link of landing) {
    assert.ok(link.label.trim().length > 0, `${entry.id}: official link label is required`);
    assert.ok(link.url.startsWith("https://"), `${entry.id}: official links must use HTTPS: ${link.url}`);
    assert.ok(!link.url.includes("r.jina.ai"), `${entry.id}: third-party read-through proxies must not be exposed as official links`);
  }
}

assert.ok(urls("usa-immigration-services", {
  requested_us_immigration_service: "nonimmigrant_visa_application",
  nonimmigrant_visa_category: "visitor_or_business"
}).some((url) => url.startsWith("https://ceac.state.gov/genniv")), "DS-160 route must expose CEAC");

assert.ok(urls("usa-immigration-services", {
  requested_us_immigration_service: "i94_record_or_correction",
  i94_issue: "retrieve_record"
}).some((url) => url.startsWith("https://i94.cbp.dhs.gov")), "I-94 route must expose the CBP I-94 portal");

assert.ok(urls("usa-immigration-services", {
  requested_us_immigration_service: "green_card_replace_or_renew",
  green_card_action: "remove_marriage_conditions"
}).some((url) => url === "https://www.uscis.gov/i-751"), "two-year marriage conditions must expose Form I-751 rather than only I-90");

assert.ok(urls("usa-employment-green-card", {
  employment_gc_stage: "consular_processing"
}).some((url) => url.startsWith("https://ceac.state.gov/IV/")), "employment consular route must expose CEAC immigrant visa / DS-260");

const passportLinks = urls("india-us-passport-reissue", {});
assert.ok(passportLinks.includes("https://embassy.passportindia.gov.in/"), "passport reissue must expose the Government of India overseas Passport Seva portal");
assert.ok(passportLinks.includes("https://services.vfsglobal.com/usa/en/ind/apply-passport"), "passport reissue must expose the official VFS India USA passport workflow");

console.log(`PASS Official Links Tests: ${live.length} live process modules expose official work links with route-aware portal selection.`);
