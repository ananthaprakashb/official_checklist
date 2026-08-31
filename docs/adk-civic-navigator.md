# Civic Preflight Navigator — Google ADK

Civic Preflight uses Google's Agent Development Kit (ADK) as the orchestration layer above the existing deterministic Official Checklist engine.

The agent is intentionally **not** allowed to invent or override government-process decisions.

```text
User
  |
  v
Civic Preflight Navigator (Google ADK)
  |
  +--> search_processes
  +--> get_process_questions
  +--> evaluate_process
                |
                v
       Official Checklist engine
                |
                v
 READY / NOT_READY / NEEDS_AUTHORITATIVE_CONFIRMATION
```

## Why ADK is above the deterministic engine

ADK handles natural-language navigation and tool orchestration. Existing Official Checklist evaluators remain the source of truth for process classification, blockers, required items, conditional items, next steps and source-verification state.

The agent must preserve the evaluator status exactly and must not turn `NEEDS_AUTHORITATIVE_CONFIRMATION` into `READY`.

## Requirements

The current TypeScript ADK 2.x toolchain requires:

- Node.js 24.13.0 or later
- npm 11.8.0 or later
- a Gemini API key for interactive agent runs

Install dependencies:

```bash
npm install
```

Create a local `.env` file:

```text
GEMINI_API_KEY=your_key_here
CIVIC_PREFLIGHT_MODEL=gemini-flash-latest
```

`CIVIC_PREFLIGHT_MODEL` is optional.

## Run

Interactive CLI:

```bash
npm run adk:run
```

ADK development web UI:

```bash
npm run adk:web
```

The ADK web UI is for development/debugging, not the production user interface.

## Tools

### `search_processes`

Searches the versioned process catalog and returns candidate processes, including status, source freshness and whether a deterministic evaluator is registered.

It performs discovery only. A matching process is not an eligibility decision.

### `get_process_questions`

Returns the registered process questionnaire with user-facing labels, conditional requirements, options, freshness metadata and authoritative source links.

### `evaluate_process`

Calls the existing registered evaluator through `src/engine/registry.ts` and returns the standardized presentation:

- `READY`
- `NOT_READY`
- `NEEDS_AUTHORITATIVE_CONFIRMATION`
- blockers
- warnings
- required items
- conditional items
- next step
- source verification date
- authoritative source links

The ADK layer does not duplicate government rules.

## Validation

Tool adapters can be tested without a Gemini API key:

```bash
npm run test:adk
```

The test is included in the normal `npm run validate` merge gate.

## Next phase

After the navigator flow is working end-to-end, add an `create_action_plan` tool that converts a verified Official Checklist result into personal Task Board items without changing the verified official requirements.
