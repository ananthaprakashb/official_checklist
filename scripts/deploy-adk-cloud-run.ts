import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  buildAdkCloudRunArgs,
  buildCloudRunDescribeArgs,
  buildCloudRunPublicAccessArgs,
  buildCloudRunRuntimeUpdateArgs,
  buildGcloudInvocation,
  buildNpxInvocation,
  getCloudRunDeployConfig,
  type CliInvocation
} from "../src/adk/cloudRun";

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

function runInherited(invocation: CliInvocation, env: NodeJS.ProcessEnv = process.env): void {
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: process.cwd(),
    env,
    stdio: "inherit"
  });
  if (result.error) throw result.error;
  if ((result.status ?? 1) !== 0) throw new Error(`Command failed with exit code ${result.status ?? 1}`);
}

function runCaptured(invocation: CliInvocation): string {
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"]
  });
  if (result.error) throw result.error;
  if ((result.status ?? 1) !== 0) throw new Error(`Command failed with exit code ${result.status ?? 1}`);
  return result.stdout ?? "";
}

function assertGcloudAvailable(): void {
  const result = spawnSync(
    buildGcloudInvocation(["--version"]).command,
    buildGcloudInvocation(["--version"]).args,
    {
      cwd: process.cwd(),
      env: process.env,
      encoding: "utf8",
      stdio: "ignore"
    }
  );

  if (result.error || (result.status ?? 1) !== 0) {
    throw new Error(
      "Google Cloud CLI (gcloud) is not available in this terminal. Install the Google Cloud CLI, reopen the terminal so PATH is refreshed, then run `gcloud --version`, `gcloud init`, and retry `npm run adk:deploy:cloud-run`."
    );
  }
}

loadDotEnv(resolve(process.cwd(), ".env"));

try {
  const config = getCloudRunDeployConfig();

  console.log("Deploying Civic Preflight ADK agent to Google Cloud Run");
  console.log(`Project: ${config.project}`);
  console.log(`Region: ${config.region}`);
  console.log(`Service: ${config.serviceName}`);
  console.log(`Model: ${config.model}`);
  console.log(`Gemini secret: ${config.secretName}:latest`);
  console.log(`Public access: ${config.publicAccess ? "enabled" : "disabled"}`);
  console.log(`ADK web UI: ${config.withUi ? "enabled" : "disabled"}`);

  console.log("\nPreflight: checking Google Cloud CLI...");
  assertGcloudAvailable();

  console.log("\n1/4 Deploying the TypeScript ADK service...");
  const adkInvocation = buildNpxInvocation(buildAdkCloudRunArgs(config));
  runInherited(adkInvocation, {
    ...process.env,
    // TypeScript ADK delegates to gcloud. Keep the deploy non-interactive; public IAM is applied explicitly below.
    CLOUDSDK_CORE_DISABLE_PROMPTS: "1"
  });

  console.log("\n2/4 Attaching Gemini Secret Manager value and model configuration...");
  runInherited(buildGcloudInvocation(buildCloudRunRuntimeUpdateArgs(config)));

  if (config.publicAccess) {
    console.log("\n3/4 Granting public Cloud Run invoker access...");
    runInherited(buildGcloudInvocation(buildCloudRunPublicAccessArgs(config)));
  } else {
    console.log("\n3/4 Keeping Cloud Run authenticated (no public IAM grant requested)...");
  }

  console.log("\n4/4 Resolving deployed service URL...");
  const descriptionText = runCaptured(buildGcloudInvocation(buildCloudRunDescribeArgs(config)));
  const description = JSON.parse(descriptionText) as { status?: { url?: string } };
  const serviceUrl = description.status?.url;
  if (!serviceUrl) throw new Error("Cloud Run deployed, but status.url was not returned by gcloud describe");

  console.log("\nCivic Preflight ADK deployment completed.");
  console.log(`Cloud Run URL: ${serviceUrl}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
