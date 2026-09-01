import assert from "node:assert/strict";
import {
  buildAdkCloudRunArgs,
  buildCloudRunDescribeArgs,
  buildCloudRunPublicAccessArgs,
  buildCloudRunRuntimeUpdateArgs,
  buildGcloudInvocation,
  buildNpxInvocation,
  DEFAULT_GOOGLE_CLOUD_PROJECT,
  getCloudRunDeployConfig
} from "../src/adk/cloudRun";

assert.equal(DEFAULT_GOOGLE_CLOUD_PROJECT, "gen-lang-client-0244443076");

const defaultProjectConfig = getCloudRunDeployConfig({ GOOGLE_CLOUD_LOCATION: "us-west1" });
assert.equal(defaultProjectConfig.project, "gen-lang-client-0244443076");

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

const adkArgs = buildAdkCloudRunArgs(config);
assert.deepEqual(adkArgs.slice(0, 3), ["adk", "deploy", "cloud_run"]);
assert.ok(adkArgs.includes("--project=demo-project"));
assert.ok(adkArgs.includes("--region=us-west1"));
assert.ok(adkArgs.includes("--service_name=civic-preflight-agent"));
assert.ok(adkArgs.includes("--with_ui"));
assert.ok(!adkArgs.includes("--"));
assert.ok(!adkArgs.some((arg) => arg.includes("allow-unauthenticated")));
assert.ok(!adkArgs.some((arg) => arg.startsWith("--set-secrets")));

const runtimeArgs = buildCloudRunRuntimeUpdateArgs(config);
assert.deepEqual(runtimeArgs.slice(0, 4), ["run", "services", "update", "civic-preflight-agent"]);
assert.ok(runtimeArgs.includes("--set-secrets=GEMINI_API_KEY=civic-preflight-gemini-key:latest"));
assert.ok(runtimeArgs.includes("--set-env-vars=CIVIC_PREFLIGHT_MODEL=gemini-3.5-flash-lite"));
assert.ok(runtimeArgs.includes("--quiet"));

const publicArgs = buildCloudRunPublicAccessArgs(config);
assert.deepEqual(publicArgs.slice(0, 4), ["run", "services", "add-iam-policy-binding", "civic-preflight-agent"]);
assert.ok(publicArgs.includes("--member=allUsers"));
assert.ok(publicArgs.includes("--role=roles/run.invoker"));

const describeArgs = buildCloudRunDescribeArgs(config);
assert.deepEqual(describeArgs.slice(0, 4), ["run", "services", "describe", "civic-preflight-agent"]);
assert.ok(describeArgs.includes("--format=json"));

const privateConfig = getCloudRunDeployConfig({
  GOOGLE_CLOUD_PROJECT: "demo-project",
  GOOGLE_CLOUD_LOCATION: "us-central1"
});
const privateAdkArgs = buildAdkCloudRunArgs(privateConfig);
assert.ok(!privateAdkArgs.includes("--with_ui"));
assert.equal(privateConfig.serviceName, "civic-preflight-agent");
assert.equal(privateConfig.model, "gemini-3.5-flash-lite");

const windowsNpx = buildNpxInvocation(["adk", "deploy", "cloud_run"], "win32", "C:\\Windows\\System32\\cmd.exe");
assert.equal(windowsNpx.command, "C:\\Windows\\System32\\cmd.exe");
assert.deepEqual(windowsNpx.args.slice(0, 5), ["/d", "/s", "/c", "npx.cmd", "adk"]);

const windowsGcloud = buildGcloudInvocation(["run", "services", "describe"], "win32", undefined);
assert.equal(windowsGcloud.command, "cmd.exe");
assert.deepEqual(windowsGcloud.args, ["/d", "/s", "/c", "gcloud.cmd", "run", "services", "describe"]);

const unixNpx = buildNpxInvocation(["adk", "deploy"], "linux");
assert.equal(unixNpx.command, "npx");
assert.deepEqual(unixNpx.args, ["adk", "deploy"]);

const unixGcloud = buildGcloudInvocation(["run", "services"], "linux");
assert.equal(unixGcloud.command, "gcloud");
assert.deepEqual(unixGcloud.args, ["run", "services"]);

console.log("Cloud Run ADK deployment configuration tests passed.");
