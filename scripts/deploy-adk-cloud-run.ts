import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { buildAdkCloudRunArgs, buildNpxInvocation, getCloudRunDeployConfig } from "../src/adk/cloudRun";

function loadDotEnv(path: string): void {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv(resolve(process.cwd(), ".env"));

try {
  const config = getCloudRunDeployConfig();
  const args = buildAdkCloudRunArgs(config);
  const invocation = buildNpxInvocation(args);

  console.log("Deploying Civic Preflight ADK agent to Google Cloud Run");
  console.log(`Project: ${config.project}`);
  console.log(`Region: ${config.region}`);
  console.log(`Service: ${config.serviceName}`);
  console.log(`Model: ${config.model}`);
  console.log(`Gemini secret: ${config.secretName}:latest`);
  console.log(`Public access: ${config.publicAccess ? "enabled" : "disabled"}`);
  console.log(`ADK web UI: ${config.withUi ? "enabled" : "disabled"}`);

  const result = spawnSync(invocation.command, invocation.args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit"
  });

  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
