export type CloudRunDeployConfig = {
  project: string;
  region: string;
  serviceName: string;
  model: string;
  secretName: string;
  publicAccess: boolean;
  withUi: boolean;
};

export type CliInvocation = {
  command: string;
  args: string[];
};

export const DEFAULT_GOOGLE_CLOUD_PROJECT = "gen-lang-client-0244443076";

const TRUTHY = new Set(["1", "true", "yes", "y", "on"]);

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is required for Cloud Run deployment`);
  return value;
}

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || !value.trim()) return fallback;
  return TRUTHY.has(value.trim().toLowerCase());
}

export function getCloudRunDeployConfig(env: NodeJS.ProcessEnv = process.env): CloudRunDeployConfig {
  const serviceName = env.CIVIC_PREFLIGHT_CLOUD_RUN_SERVICE?.trim() || "civic-preflight-agent";
  if (!/^[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?$/.test(serviceName)) {
    throw new Error(
      "CIVIC_PREFLIGHT_CLOUD_RUN_SERVICE must use lowercase letters, numbers and hyphens and start with a letter"
    );
  }

  return {
    project: env.GOOGLE_CLOUD_PROJECT?.trim() || DEFAULT_GOOGLE_CLOUD_PROJECT,
    region: required(env, "GOOGLE_CLOUD_LOCATION"),
    serviceName,
    model: env.CIVIC_PREFLIGHT_MODEL?.trim() || "gemini-3.5-flash-lite",
    secretName: env.CIVIC_PREFLIGHT_GEMINI_SECRET?.trim() || "GEMINI_API_KEY",
    publicAccess: bool(env.CIVIC_PREFLIGHT_CLOUD_RUN_PUBLIC, false),
    withUi: bool(env.CIVIC_PREFLIGHT_CLOUD_RUN_WITH_UI, false)
  };
}

/**
 * TypeScript ADK deploys the agent project from the current working directory.
 * Keep gcloud-only flags out of this argument list.
 */
export function buildAdkCloudRunArgs(config: CloudRunDeployConfig): string[] {
  const args = [
    "adk",
    "deploy",
    "cloud_run",
    `--project=${config.project}`,
    `--region=${config.region}`,
    `--service_name=${config.serviceName}`
  ];

  if (config.withUi) args.push("--with_ui");
  return args;
}

export function buildCloudRunRuntimeUpdateArgs(config: CloudRunDeployConfig): string[] {
  return [
    "run",
    "services",
    "update",
    config.serviceName,
    `--project=${config.project}`,
    `--region=${config.region}`,
    `--set-secrets=GEMINI_API_KEY=${config.secretName}:latest`,
    `--set-env-vars=CIVIC_PREFLIGHT_MODEL=${config.model}`,
    "--quiet"
  ];
}

export function buildCloudRunPublicAccessArgs(config: CloudRunDeployConfig): string[] {
  return [
    "run",
    "services",
    "add-iam-policy-binding",
    config.serviceName,
    `--project=${config.project}`,
    `--region=${config.region}`,
    "--member=allUsers",
    "--role=roles/run.invoker",
    "--quiet"
  ];
}

export function buildCloudRunDescribeArgs(config: CloudRunDeployConfig): string[] {
  return [
    "run",
    "services",
    "describe",
    config.serviceName,
    `--project=${config.project}`,
    `--region=${config.region}`,
    "--format=json"
  ];
}

function buildWindowsCmdInvocation(
  executable: string,
  args: string[],
  comspec: string | undefined = process.env.ComSpec
): CliInvocation {
  return {
    command: comspec?.trim() || "cmd.exe",
    args: ["/d", "/s", "/c", `${executable}.cmd`, ...args]
  };
}

export function buildNpxInvocation(
  args: string[],
  platform: NodeJS.Platform = process.platform,
  comspec: string | undefined = process.env.ComSpec
): CliInvocation {
  if (platform === "win32") return buildWindowsCmdInvocation("npx", args, comspec);
  return { command: "npx", args };
}

export function buildGcloudInvocation(
  args: string[],
  platform: NodeJS.Platform = process.platform,
  comspec: string | undefined = process.env.ComSpec
): CliInvocation {
  if (platform === "win32") return buildWindowsCmdInvocation("gcloud", args, comspec);
  return { command: "gcloud", args };
}
