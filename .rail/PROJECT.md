# Project Memory

This file is the local AI Rail project memory and roadmap brain.

GitHub Issues are the active task execution queue.
The GitHub roadmap issue is the remote roadmap mirror.
AI/planning agents create and update the roadmap.
AI Rail imports roadmap memory and tracks completed issue state.

<!-- AI RAIL MANAGED ROADMAP START -->

# Voxa - AI Rail Project Memory

## Product summary

Voxa is a prerelease multi-provider AI voice studio for writing, refining, translating, and generating narration. The functional MVP target is a trustworthy single-user/local-first studio where a user can paste or write a script, optionally rewrite or translate it, choose a branded voice character/tone/speed, generate narration, play/download the result, and keep a small browser-local history.

The MVP should make provider setup safe and understandable, ensure UI controls reflect real backend capability, keep provider calls behind server-side Next.js routes, and provide a mock-mode confidence path that works without paid provider credentials.

## Stack

- Framework: Next.js 15 App Router.
- Runtime/UI: React 19, TypeScript, Tailwind CSS, Radix UI primitives, lucide-react.
- State: Zustand with browser persistence.
- Audio/history storage: browser local storage for history metadata plus IndexedDB for generated audio blobs.
- Server routes: Next.js route handlers under `src/app/api/*`.
- Providers: OpenAI, Gemini, ElevenLabs, and mock for TTS; OpenAI, Gemini, and mock for text rewrite/translate.
- Provider backbone: shared provider registry/config helpers exist under `src/lib/provider-registry.ts` and `src/lib/provider-config.ts`.
- Deployment shape: local `npm run dev`, Next standalone production build, Docker Compose.
- Known scripts/checks: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run samples:tones -- <character>`.

## Non-negotiables

- GitHub Issues are the task source of truth.
- Work one issue at a time through the AI Rail loop.
- Do not implement work from future issues while working on the current issue.
- Do not create duplicate roadmap/issues.
- Do not create `.rail/ROADMAP.md`.
- Do not edit `.rail/PROJECT.md` remotely unless the human explicitly asks.
- Do not commit, push, open PRs, or close issues from coding-agent passes unless the human explicitly asks.
- Keep diffs focused and small enough for review.
- Touch only files needed for the active issue.
- Prefer backbone/configuration/foundation fixes before visual polish.
- Do not expose provider API keys or secret values to the frontend, API responses, logs, docs, screenshots, or generated artifacts.
- Server-side route handlers remain the boundary for provider calls.
- Browser-local history/audio cache is acceptable for MVP; do not add accounts, cloud sync, server media storage, or key-management UI unless a later explicit issue says so.
- Run only focused checks related to the active issue unless explicitly asked otherwise.
- Stop and explain if an issue requires broader architecture changes.

## Current state

- README describes Voxa as prerelease `0.3.0-alpha.0`.
- Core app renders `Studio` from `src/app/page.tsx`.
- Main studio UI is implemented in `src/components/studio.tsx`.
- API routes exist for TTS, rewrite, translate, provider status, and health.
- Voice characters and tone presets are centralized in `src/lib/voice-config.ts`.
- TTS provider implementations exist under `src/providers/tts/`.
- Text provider implementations exist under `src/providers/text/`.
- Provider defaults and docs agree on OpenAI as production default for both voice and text, with explicit mock demo mode.
- Provider names, labels, required env vars, model defaults, and selected health metadata are centralized enough to reduce drift.
- Settings UI still contains mostly static provider setup guidance plus generation mode controls.
- Header/provider health fetches `/api/providers` and shows high-level active provider status.
- Text rewrite/translate modal is wired to `/api/rewrite` and `/api/translate`.
- Generate and preview flows are wired to `/api/tts`.
- Generated history metadata persists in Zustand storage; generated audio blobs are cached separately in IndexedDB.
- Mock provider mode exists and should remain the no-key local/demo path.
- Dockerfile and docker-compose deployment files exist.
- No dedicated mock-mode smoke/release readiness path is formalized yet.

## Missing backend/backbone/configuration

- API routes validate empty text but do not strongly validate the full request contract.
- Invalid provider names can still silently fall through to default provider factories until provider selection is hardened.
- Health/provider diagnostics are useful but still too shallow for first-run setup, Docker debugging, or release confidence.
- Settings panel is mostly static env guidance rather than a live provider status/configuration diagnostic panel.
- Mock-mode smoke/release checks are not yet formalized.
- Generation mode capability is provider-specific, but the UI presents it globally.
- Local history metadata and IndexedDB audio blobs can drift.

## Fake UI or unimplemented/misleading controls

- Settings provider setup copy can imply configurable UI behavior, but provider selection/configuration is still `.env` driven.
- Generation mode labels imply quota/consistency behavior across providers, but support is provider-specific and currently clearest for Gemini chunking/retry behavior.
- Local history metadata can remain even if IndexedDB audio blobs are unavailable, creating confusing playback/download states.
- Provider setup UI explains env snippets but does not yet surface live active/missing provider state inside settings.

## Risky/broken areas

- API route request bodies are loosely typed and under-validated.
- Unknown provider names can resolve to OpenAI instead of explicit safe errors.
- API error handling can expose raw unexpected/provider messages to clients.
- Provider errors are inconsistent across adapters.
- Settings UI can look more configurable than it really is.
- Local history/audio cache is browser-local only and can drift between metadata and blobs.
- No dedicated mock-mode smoke path exists yet for release confidence.

## Target state

- Provider defaults, README, `.env.example`, `/api/providers`, `/api/health`, and settings UI all tell the same truth.
- Provider registry/config remains the shared source for provider metadata.
- API routes validate input clearly and fail safely before provider calls.
- Unknown provider names return explicit safe errors instead of silently using OpenAI.
- Client-facing errors are safe and consistent; server logs retain useful non-secret debugging context.
- Settings panel reflects live provider status and missing env variable names without exposing secret values.
- Generation mode copy and behavior are provider-aware.
- Local history/audio-cache limitations are clear and recoverable.
- Mock mode can verify the MVP flow without paid provider credentials.
- Release readiness is documented and easy to follow.

## Blockers/postponed items

- Server-side generated media library is postponed.
- User accounts/auth/sync are postponed.
- Provider key management UI is postponed; `.env` remains the configuration surface for MVP.
- Cloud storage/history sync is postponed.
- Full automated integration test suite is postponed; first target is a lightweight mock-mode smoke path.
- New provider additions are postponed until the existing provider backbone is stable.
- Deep UI redesign/polish is postponed until provider truth, API safety, and settings backbone are fixed.

## Completed work summary

Provider default/documentation truth is aligned, and provider metadata is now centralized enough for later health, validation, settings, and provider-selection work to build on it.

## Next recommended issue/task

Next recommended task: #4 - 03 Add shared API request validation.

Why next:
- It is the safest next backbone issue after provider defaults and registry are in place.
- It prevents bad input from reaching provider code.
- It makes later provider-selection and error-sanitization work cleaner.

Suggested focused check for that task: `npm run typecheck`.

## Workflow notes

Human workflow:

```bash
rail import
rail n
# paste generated prompt into coding agent

rail v
# paste review prompt into AI reviewer

rail s "type(scope): message"
```

The coding agent should read only the current GitHub issue body and this project memory, implement only that issue, then stop for human review. Exact phase/task state lives only in the strict Rail roadmap block below.

<!-- AI RAIL ROADMAP START -->

## Phase P1 - Foundation / truth alignment
Status: active

### Goal
Make provider defaults, provider metadata, and setup truth reliable before deeper feature work.

### Completion criteria
- Runtime defaults and documentation agree on production and mock modes.
- Provider names, labels, required env variables, and model defaults are centralized.
- Provider and health diagnostics are clear enough for setup debugging without exposing secrets.

### Tasks
- [x] #2 | P1-T01 | Align provider defaults and documentation truth
- [x] #3 | P1-T02 | Add shared provider registry helpers
- [ ] #7 | P1-T03 | Improve provider and health diagnostics
- [ ] TBD | P1-T04 | Document current MVP limits after diagnostics stabilize

## Phase P2 - API safety / request contracts
Status: active

### Goal
Make route handlers reject invalid input and fail safely before provider calls.

### Completion criteria
- Bad inputs return clear 4xx responses with stable safe codes.
- Unknown provider names do not silently call OpenAI.
- Client-facing errors do not leak raw provider or implementation detail.
- Existing mock-mode TTS, rewrite, and translate flows still work.

### Tasks
- [x] #4 | P2-T01 | Add shared API request validation
- [ ] #5 | P2-T02 | Sanitize API error responses
- [ ] #6 | P2-T03 | Harden provider selection for unknown names
- [ ] TBD | P2-T04 | Normalize provider adapter error codes after safety fixes

## Phase P3 - UI/backbone connection
Status: planned

### Goal
Remove misleading controls and connect settings/history/generation UI to real backend capability.

### Completion criteria
- Settings shows live provider status instead of only static snippets.
- Missing env variable names are visible without secret values.
- Generation mode guidance is accurate for the active TTS provider.
- Local history/audio unavailable states are understandable and recoverable.

### Tasks
- [ ] #8 | P3-T01 | Connect settings panel to live provider status
- [ ] #9 | P3-T02 | Make generation mode behavior provider-aware
- [ ] #10 | P3-T03 | Improve local history and audio cache recovery UX
- [ ] TBD | P3-T04 | Add focused mobile/accessibility cleanup for studio panels

## Phase P4 - Mock confidence / release readiness
Status: planned

### Goal
Make Voxa demonstrable and checkable as a functional MVP without paid provider credentials.

### Completion criteria
- Mock mode verifies health, provider status, rewrite, translate, and TTS flows.
- Release-readiness docs explain local, Docker, mock, and production checks.
- MVP checks are lightweight enough to run before shipping future AI Rail issues.

### Tasks
- [ ] #11 | P4-T01 | Add mock-mode smoke checks and release readiness docs
- [ ] TBD | P4-T02 | Add Docker troubleshooting notes after smoke path exists
- [ ] TBD | P4-T03 | Add final MVP demo checklist

## Phase P5 - Post-MVP expansion
Status: planned

### Goal
Postpone heavier product work until the functional MVP backbone is safe, truthful, and demo-ready.

### Completion criteria
- Expansion work is split into future issues only after MVP safety and readiness are stable.
- Accounts, cloud sync, server media, provider key UI, and new providers are not mixed into MVP backbone issues.

### Tasks
- [ ] TBD | P5-T01 | Plan server-side generated media library
- [ ] TBD | P5-T02 | Plan accounts/auth/history sync
- [ ] TBD | P5-T03 | Plan provider key management UI
- [ ] TBD | P5-T04 | Plan new provider additions
- [ ] TBD | P5-T05 | Plan full integration/CI suite

<!-- AI RAIL ROADMAP END -->

<!-- AI RAIL MANAGED ROADMAP END -->

## Roadmap maintenance rules

- Keep the full roadmap here.
- Keep only the active execution slice as GitHub implementation issues.
- Do not create `.rail/ROADMAP.md`.
- Do not use GitHub Issues for the entire 100-task roadmap.
- Use `rail import` after `rail plan --copy` or `rail phase --copy`.
- Use `rail s` to ship/close one issue and mark it completed locally.
