import fafsaEntryJson from "../../data/usa/education/fafsa/process.v1.json";
import type { PassportAnswers } from "../types";
import { createFafsaModule } from "./fafsaModule";
import {
  evaluateProcess as evaluateBaseProcess,
  getProcessBySlug as getBaseProcessBySlug,
  getProcessModule as getBaseProcessModule,
  listProcesses as listBaseProcesses
} from "./registryBase";
import type { ProcessCatalogEntry, ProcessModule, ProcessPresentation } from "./types";

const fafsaEntry = fafsaEntryJson as ProcessCatalogEntry;
const fafsaModule = createFafsaModule(fafsaEntry);

export function listProcesses(): ProcessCatalogEntry[] {
  return [...listBaseProcesses(), fafsaEntry];
}

export function getProcessBySlug(slug: string): ProcessCatalogEntry | undefined {
  const normalized = slug.replace(/^\/+|\/+$/g, "");
  if (normalized === fafsaEntry.slug) return fafsaEntry;
  return getBaseProcessBySlug(normalized);
}

export function getProcessModule(id: string): ProcessModule | undefined {
  if (id === fafsaEntry.id) return fafsaModule;
  return getBaseProcessModule(id);
}

export function evaluateProcess(id: string, answers: PassportAnswers): ProcessPresentation {
  if (id === fafsaEntry.id) return fafsaModule.present(fafsaModule.evaluate(answers));
  return evaluateBaseProcess(id, answers);
}
