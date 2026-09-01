# Deploy Civic Preflight ADK to Google Cloud Run

Civic Preflight uses Google Agent Development Kit (ADK) for agent orchestration and Google Cloud Run for the hosted agent runtime.

The Cloud Run service contains the ADK API server plus the existing deterministic Official Checklist engine. Gemini handles navigation and explanation; government-process decisions continue to come from the deterministic evaluator registry.

## Google Cloud project

Civic Preflight is deployed to:

```text
gen-lang-client-0244443076
```

The deployment code defaults to this project. `GOOGLE_CLOUD_PROJECT` may still override it for another environment, but the hackathon configuration, examples and deployment instructions all target `gen-lang-client-0244443076`.

## Prerequisites

- Node.js 24.13+
- Google Cloud CLI (`gcloud`)
- billing enabled for `gen-lang-client-0244443076`
- a Gemini API key stored in Google Secret Manager in this project

### Windows: verify `gcloud` before deployment

The TypeScript ADK Cloud Run deploy command invokes `gcloud` internally. On Windows, Google Cloud CLI must therefore be installed and visible in the same terminal where `npm run adk:deploy:cloud-run` is executed.

After installing Google Cloud CLI, close the existing PowerShell/Command Prompt and open a new terminal so the updated PATH is loaded. Verify:

```bat
where gcloud
gcloud --version
```

If either command fails, do not retry the ADK deployment yet. Fix the Google Cloud CLI installation/PATH first.

Then initialize/authenticate and select the Civic Preflight project:

```bash
gcloud init
gcloud auth login
gcloud config set project gen-lang-client-0244443076
gcloud config get-value project
```

The last command should print:

```text
gen-lang-client-0244443076
```

The deployment wrapper performs the `gcloud` availability check before starting ADK deployment so a missing CLI fails immediately with an actionable message.

Enable the required APIs in the same project:

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  --project=gen-lang-client-0244443076
```

On Windows Command Prompt or PowerShell, run the service names on one line if the shell does not support the backslash continuation syntax:

```bat
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com --project=gen-lang-client-0244443076
```

## Store the Gemini key in Secret Manager

Do not put the production Gemini key in the repository or directly in the Cloud Run command.

Create a Secret Manager secret named `GEMINI_API_KEY` in `gen-lang-client-0244443076` and add the Gemini API key as its latest version. The deployment maps that secret to the Cloud Run environment variable `GEMINI_API_KEY`.

If the Cloud Run runtime service account cannot read the secret, grant it `roles/secretmanager.secretAccessor` on this secret before deployment.

Google ADK Cloud Run deployment also uses Cloud Build. If the project's build identity lacks permission, grant the appropriate Cloud Build builder role as described in the ADK Cloud Run deployment documentation.

## Local deployment settings

Add these values to your local `.env` file:

```text
GOOGLE_CLOUD_PROJECT=gen-lang-client-0244443076
GOOGLE_CLOUD_LOCATION=us-west1
CIVIC_PREFLIGHT_CLOUD_RUN_SERVICE=civic-preflight-agent
CIVIC_PREFLIGHT_MODEL=gemini-3.5-flash-lite
CIVIC_PREFLIGHT_GEMINI_SECRET=GEMINI_API_KEY
CIVIC_PREFLIGHT_CLOUD_RUN_PUBLIC=true
CIVIC_PREFLIGHT_CLOUD_RUN_WITH_UI=false
```

`CIVIC_PREFLIGHT_CLOUD_RUN_PUBLIC=true` is appropriate for the hackathon demo because the existing browser application will need to call the agent without a Google identity token. For a private/internal deployment, set it to `false`.

`CIVIC_PREFLIGHT_CLOUD_RUN_WITH_UI=true` can be useful temporarily while validating the deployment, but the ADK development UI is not intended to replace the Civic Preflight production UI.

## Deploy

From the repository root:

```bash
npm install
npm run adk:deploy:cloud-run
```

For the TypeScript ADK CLI, deployment runs from the current project directory. The ADK command receives only ADK-supported flags:

```text
npx adk deploy cloud_run
  --project=gen-lang-client-0244443076
  --region=us-west1
  --service_name=civic-preflight-agent
```

The wrapper then uses `gcloud` separately to:

1. attach the Secret Manager value as `GEMINI_API_KEY`;
2. set `CIVIC_PREFLIGHT_MODEL`;
3. grant `roles/run.invoker` to `allUsers` when public access is requested; and
4. resolve and print the deployed Cloud Run URL.

This separation is intentional. Passing `--allow-unauthenticated`, `--set-secrets`, or `--set-env-vars` through the TypeScript ADK command can be interpreted as source-path input by the current TypeScript deployment implementation.

No local API key value is passed by the script. Only the Secret Manager secret name is sent to Google Cloud.

## Expected result

A successful deployment ends with output similar to:

```text
Civic Preflight ADK deployment completed.
Cloud Run URL: https://civic-preflight-agent-<generated-id>.<region>.run.app
```

This URL becomes the backend endpoint for the next integration phase, where the Official Checklist React UI will send natural-language user requests to the ADK agent and render verified results returned by the deterministic process engine.

## Validation

The deployment argument builder is covered by the normal CI gate:

```bash
npm run test:cloud-run
npm run validate
```

The test does not contact Google Cloud or require a Gemini API key.

## Trust boundary

Cloud Run changes where the ADK agent executes; it does not change who makes official-process decisions.

```text
User
  -> Cloud Run
  -> Google ADK Civic Preflight Navigator
  -> ADK tools
  -> Official Checklist deterministic evaluator
  -> READY / NOT_READY / NEEDS_AUTHORITATIVE_CONFIRMATION
```

The model must never upgrade uncertainty, invent a government rule, or bypass the evaluator.
