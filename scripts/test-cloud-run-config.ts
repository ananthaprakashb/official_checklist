import assert from "node:assert/strict";
import { buildAdkCloudRunArgs, getCloudRunDeployConfig } from "../src/adk/cloudRun";

assert.throws(
  () => getCloudRunDeployConfig({ GOOGLE_CLOUD_LOCATION: "us-west1" }),
  /GOOGLE_CLOUD_PROJECT/
);
assert.throws(
  () => getCloudRunDeployConfig({ GOOGLE_CLOUD_PROJECT: "demo-project" }),
  /GOOGLE_CLOUD_LOCATION/
);
assert.throws(
  () =>
    getCloudRunDeployConfig({
      GOOGLE_CLOUD_PROJECT: "demo-project",
      GOOGLE_CLOUD_LOCATION: "us-west1",
      CIVIC_PREFLIGHT_CLOUD_RUN_SERVICE: "Bad_Service"
    }),
  /CIVIC_PREFLIGHT_CLOUD_RUN_SERVICE/
);

const config = getCloudRunDeployConfig({
  GOOGLE_CLOUD_PROJECT: "demo-project",
  GOOGLE_CLOUD_LOCATION: "us-west1",
  CIVIC_PREFLIGHT_CLOUD_RUN_SERVICE: "civic-preflight-agent",
  CIVIC_PREFLIGHT_MODEL: "gemini-3.5-flash-lite",
  CIVIC_PREFLIGHT_GEMINI_SECRET: "civic-preflight-gemini-key",
  CIVIC_PREFLIGHT_CLOUD_RUN_PUBLIC: "true",
  CIVIC_PREFLIGHT_CLOUD_RUN_WITH_UI: "true"
});

assert.equal(config.publicAccess, true);
assert.equal(config.withUi, true);

const args = buildAdkCloudRunArgs(config);
assert.deepEqual(args.slice(0, 3), ["adk", "deploy", "cloud_run"]);
assert.ok(args.includes("--project=demo-project"));
assert.ok(args.includes("--region=us-west1"));
assert.ok(args.includes("--service_name=civic-preflight-agent"));
assert.ok(args.includes("--with_ui"));
assert.ok(args.includes("--allow-unauthenticated"));
assert.ok(args.includes("--set-secrets=GEMINI_API_KEY=civic-preflight-gemini-key:latest"));
assert.ok(args.includes("--set-env-vars=CIVIC_PREFLIGHT_MODEL=gemini-3.5-flash-lite"));

const privateConfig = getCloudRunDeployConfig({
  GOOGLE_CLOUD_PROJECT: "demo-project",
  GOOGLE_CLOUD_LOCATION: "us-central1"
});
const privateArgs = buildAdkCloudRunArgs(privateConfig);
assert.ok(privateArgs.includes("--no-allow-unauthenticated"));
assert.ok(!privateArgs.includes("--with_ui"));
assert.equal(privateConfig.serviceName, "civic-preflight-agent");
assert.equal(privateConfig.model, "gemini-3.5-flash-lite");

console.log("Cloud Run ADK deployment configuration tests passed.");
