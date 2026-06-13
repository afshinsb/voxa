# Voxa — AI Rail Project Memory

This file is local AI Rail project memory for coding agents and reviewers.

GitHub Issues are the source of truth for task execution. Do not create or follow a separate `.rail/ROADMAP.md`. Keep this file aligned with the GitHub roadmap issue when the roadmap changes.

## Product summary

Voxa is a prerelease multi-provider AI voice studio for writing, refining, translating, and generating narration. It supports OpenAI, Gemini, ElevenLabs, and local mock providers through server-side Next.js route handlers.

The product goal for the functional MVP is a trustworthy single-user/local-first studio where the UI accurately reflects backend/provider capability, provider configuration is safe and understandable, and core generation flows can be verified without paid keys through mock mode.

## Stack

- Framework: Next.js 15 app router
- UI: React 19, TypeScript, Tailwind CSS, Radix UI primitives, lucide-react
- State: Zustand with browser persistence
- Audio/history storage: browser local storage for metadata plus IndexedDB for generated audio blobs
- Server routes: Next.js route handlers under `src/app/api/*`
- Providers:
  - TTS: OpenAI, Gemini, ElevenLabs, mock
  - Text rewrite/translate: OpenAI, Gemini, mock
- Deployment shape: local `npm run dev`, Next standalone production build, Docker Compose
- Checks/scripts currently known:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
  - `npm run samples:tones -- <character>`

## Non-negotiables

- GitHub Issues are the task source of truth.
- Work one issue at a time through the AI Rail loop.
- Do not implement work from future issues while working on the current issue.
- Do not create duplicate roadmap/issues.
- Do not create `.rail/ROADMAP.md`.
- Do not commit or close issues from coding-agent passes unless the human explicitly asks.
- Keep diffs focused and small enough for review.
- Touch only files needed for the active issue.
- Do not expose provider API keys or secret values to the frontend, API responses, logs, or docs.
- Server-side route handlers remain the boundary for provider calls.
- Browser-local history/audio cache is acceptable for MVP; do not add accounts, cloud sync, or server media storage unless a later explicit issue says so.
- Prefer truth/backbone/configuration fixes before UI polish.
- Run only focused checks related to the active issue unless explicitly asked otherwise.
- Stop and explain if an issue requires broader architecture changes.

## Current state

- README describes Voxa as prerelease `0.3.0-alpha.0`.
- Core app renders `Studio` from `src/app/page.tsx`.
- Provider API routes exist:
  - `POST /api/tts`
  - `POST /api/rewrite`
  - `POST /api/translate`
  - `GET /api/providers`
  - `GET /api/health`
- Voice characters and tone presets are centralized in `src/lib/voice-config.ts`.
- TTS provider implementations exist under `src/providers/tts/`.
- Text provider implementations exist under `src/providers/text/`.
- Settings UI currently contains mostly static provider setup guidance plus generation mode controls.
- Header/provider health fetches `/api/providers` and shows high-level status.
- Generated history metadata persists in Zustand storage; generated audio blobs are cached in IndexedDB.
- Mock provider mode exists and should be preserved as the no-key local/demo path.

## Known risky or broken areas

- Provider defaults/docs drift:
  - README and `.env.example` position OpenAI as stable default for both TTS and text.
  - `activeTextProvider()` currently falls back to `mock`.
- Provider configuration knowledge is spread across env helpers, provider config, provider index files, settings copy, and docs.
- API route request bodies are only lightly validated.
- Invalid provider names can fall through to defaults in provider factory code.
- API error handling can expose raw unexpected/provider messages to clients.
- Settings panel can look more configurable than it really is because it shows static env examples instead of live status.
- Generation mode labels imply behavior that is not equally supported by every provider.
- Local history/audio cache can lose blobs while metadata remains, creating confusing unavailable-audio states.
- No dedicated mock-mode smoke path exists yet for release confidence.

## Target state for functional MVP

- Provider defaults, README, `.env.example`, `/api/providers`, `/api/health`, and settings UI all tell the same truth.
- Provider registry/config is centralized enough to avoid future drift.
- API routes validate input clearly and fail safely before provider calls.
- Unknown provider names return explicit safe errors instead of silently using OpenAI.
- Client-facing errors are safe and consistent; server logs retain useful non-secret debugging context.
- Settings panel reflects live provider status and missing env variable names without exposing secret values.
- Generation mode copy and behavior are provider-aware.
- Local history/audio-cache limitations are clear and recoverable.
- Mock mode can verify the MVP flow without paid provider credentials.
- Release readiness is documented and easy to follow.

## Phased roadmap

Source of truth: GitHub issue #1, `Roadmap: Voxa functional MVP`.

### Phase 1 — Foundation / truth alignment

Goal: make repo truth, provider defaults, and diagnostics reliable before adding more features.

Planned work:
- Align provider defaults across code, README, and `.env.example`.
- Add centralized provider registry/config helpers.
- Improve provider and health diagnostics.
- Document current MVP limits clearly.

### Phase 2 — API safety / request contracts

Goal: reduce brittle behavior and make route handlers safe enough for real use.

Planned work:
- Add shared request validation for TTS and text transforms.
- Normalize or reject invalid provider names.
- Clamp/validate speed and text length.
- Return safe client errors while logging useful server details.
- Make provider errors consistent across OpenAI, Gemini, ElevenLabs, and mock.

### Phase 3 — UI/backbone connection

Goal: remove misleading controls and connect UI panels to real server state.

Planned work:
- Replace static provider setup blocks with live `/api/providers` data.
- Show selected provider, configured/missing env, active model, and demo mode status in settings.
- Make generation mode copy match backend behavior per provider.
- Improve preview/generation behavior so history/cache semantics are clear.

### Phase 4 — Core functionality hardening

Goal: make MVP generation flows reliable without adding accounts or heavy architecture.

Planned work:
- Clarify and harden generation modes.
- Keep long-form/chunking behavior limited to providers where it is actually supported.
- Improve local media cache cleanup and unavailable-audio UX.
- Add focused mock-mode smoke checks.

### Phase 5 — Safety / polish / release readiness

Goal: make Voxa presentable as a functional MVP.

Planned work:
- Add release-readiness checklist.
- Add Docker/local deployment troubleshooting.
- Add focused accessibility/mobile checks for studio, modals, history, and audio dock.
- Keep visual polish after backbone truth is stable.

## Current phase

Current phase: Phase 1 — Foundation / truth alignment.

Reason: no implementation issues have been completed yet in the new AI Rail sequence, and the first recommended work is provider default/docs truth alignment.

## Issue roadmap grouped by phase

### Phase 1 — Foundation / truth alignment

- #2 — 01 Align provider defaults and documentation truth
- #3 — 02 Add shared provider registry helpers
- #7 — 06 Improve provider and health diagnostics

### Phase 2 — API safety / request contracts

- #4 — 03 Add shared API request validation
- #5 — 04 Sanitize API error responses
- #6 — 05 Harden provider selection for unknown names

### Phase 3 — UI/backbone connection

- #8 — 07 Connect settings panel to live provider status
- #9 — 08 Make generation mode behavior provider-aware

### Phase 4 — Core functionality hardening

- #10 — 09 Improve local history and audio cache recovery UX

### Phase 5 — Safety / polish / release readiness

- #11 — 10 Add mock-mode smoke checks and release readiness docs

## Next recommended issue

Next issue: #2 — 01 Align provider defaults and documentation truth.

Why first:
- It is the safest foundation issue.
- It fixes a real truth mismatch between docs/env expectations and runtime default behavior.
- Later provider registry, health, and settings work should build on the corrected default strategy.

Suggested focused checks for #2:
- `npm run typecheck`
- Optional quick manual review of README and `.env.example` provider setup snippets.

## Known blockers / postponed work

- Server-side generated media library is postponed.
- User accounts/auth/sync are postponed.
- Provider key management UI is postponed; `.env` remains the configuration surface for MVP.
- Cloud storage/history sync is postponed.
- Full automated integration test suite is postponed; first target is a lightweight mock-mode smoke path.
- New provider additions are postponed until the existing provider backbone is stable.
- Deep UI redesign/polish is postponed until provider truth, API safety, and settings backbone are fixed.

## AI Rail workflow reminder

Human workflow:

```bash
rail n
# paste generated prompt into coding agent

rail v
# paste review prompt into AI reviewer

rail s "type(scope): message"
```

The coding agent should read the current GitHub issue body and this project memory, implement only that issue, then stop for human review.
