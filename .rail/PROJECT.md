# Project Memory

This file is the local AI Rail project memory and roadmap brain.

GitHub Issues are the active task execution queue.
The GitHub roadmap issue is the remote roadmap mirror.
AI/planning agents create and update the roadmap.
AI Rail imports roadmap memory and tracks completed issue state.

## Product notes

 Voxa — AI Rail Project Memory

## Product summary

Voxa is a prerelease multi-provider AI voice studio for writing, refining, translating, and generating narration. It supports OpenAI, Gemini, ElevenLabs, and local mock providers through server-side Next.js route handlers.

Functional MVP goal: a trustworthy single-user/local-first studio where provider configuration is safe and understandable, the UI accurately reflects backend capability, core generation flows work through real providers or mock mode, and release confidence can be checked without paid keys.

## Stack

- Framework: Next.js 15 App Router
- UI: React 19, TypeScript, Tailwind CSS, Radix UI primitives, lucide-react
- State: Zustand with browser persistence
- Audio/history storage: browser local storage for metadata plus IndexedDB for generated audio blobs
- Server routes: Next.js route handlers under `src/app/api/*`
- Providers:
  - TTS: OpenAI, Gemini, ElevenLabs, mock
  - Text rewrite/translate: OpenAI, Gemini, mock
- Deployment shape: local `npm run dev`, Next standalone production build, Docker Compose
- Known scripts/checks:
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
- Do not expose provider API keys or secret values to the frontend, API responses, logs, docs, screenshots, or generated artifacts.
- Server-side route handlers remain the boundary for provider calls.
- Browser-local history/audio cache is acceptable for MVP; do not add accounts, cloud sync, or server media storage unless a later explicit issue says so.
- Prefer truth/backbone/configuration fixes before UI polish.
- Run only focused checks related to the active issue unless explicitly asked otherwise.
- Stop and explain if an issue requires broader architecture changes.

## Current state

- README describes Voxa as prerelease `0.3.0-alpha.0`.
- Core app renders `Studio` from `src/app/page.tsx`.
- API routes exist:
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
- Docker standalone deployment files exist.
- No GitHub Actions workflow was observed during this audit.

## Missing backend/backbone/configuration

- Provider config knowledge is spread across env helpers, provider config, provider factories, settings copy, and docs.
- There is no single central provider registry used by routes, health, docs/UI status, and factories.
- API routes validate empty text but not enough of the full request contract.
- Invalid provider names can silently fall through to default provider factories.
- Health/provider diagnostics are useful but still too shallow for setup/debug/release confidence.
- Settings panel is mostly static env guidance rather than a live provider status/configuration diagnostic panel.
- Mock-mode smoke/release checks are not yet formalized.

## Fake UI or unimplemented/misleading controls

- Settings provider setup copy can imply configurable UI behavior, but provider selection/configuration is still `.env` driven.
- Generation mode labels imply quota/consistency behavior across providers, but support is provider-specific and currently clearest for Gemini chunking/retry behavior.
- Local history metadata can remain even if IndexedDB audio blobs are unavailable, creating confusing playback/download states.

## Risky/broken areas

- Provider defaults/docs drift:
  - README and `.env.example` position OpenAI as stable default for both TTS and text.
  - `activeTextProvider()` currently falls back to `mock`.
- API route request bodies are loosely typed and under-validated.
- Unknown provider names can resolve to OpenAI instead of explicit safe errors.
- API error handling can expose raw unexpected/provider messages to clients.
- Settings UI can look more configurable than it really is.
- Local history/audio cache is browser-local only and can drift between metadata and blobs.
- No dedicated mock-mode smoke path exists yet for release confidence.

## Target state

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

## Full phased roadmap

### Phase 1 — Foundation / truth alignment

Goal: make repo truth, provider defaults, and diagnostics reliable before adding more features.

Planned work:

- Align provider defaults across code, README, and `.env.example`.
- Add centralized provider registry/config helpers.
- Improve provider and health diagnostics.
- Document current MVP limits clearly.

Completion criteria:

- Runtime defaults and docs agree.
- `/api/providers` and `/api/health` report selected providers clearly.
- Provider metadata comes from one reliable source or a clearly staged helper.
- Mock vs production mode is unambiguous.

### Phase 2 — API safety / request contracts

Goal: reduce brittle behavior and make route handlers safe enough for real use.

Planned work:

- Add shared request validation for TTS and text transforms.
- Normalize or reject invalid provider names.
- Clamp/validate speed and text length.
- Return safe client errors while logging useful server details.
- Make provider errors consistent across OpenAI, Gemini, ElevenLabs, and mock.

Completion criteria:

- Bad inputs return clear 4xx errors.
- Unknown providers do not silently fall through to OpenAI.
- Client errors do not leak secrets or raw implementation detail.
- Provider errors are consistent enough for the UI to display safely.

### Phase 3 — UI/backbone connection

Goal: remove misleading controls and connect UI panels to real server state.

Planned work:

- Replace static provider setup blocks with live `/api/providers` data.
- Show selected provider, configured/missing env, active model, and demo mode status in settings.
- Make generation mode copy match backend behavior per provider.
- Improve preview/generation behavior so history/cache semantics are clear.

Completion criteria:

- Settings shows live status instead of only static snippets.
- Missing env var names are visible, but secret values are never exposed.
- Generation mode UI does not overpromise unsupported behavior.
- History/audio unavailable states are understandable and recoverable.

### Phase 4 — Core functionality hardening

Goal: make MVP generation flows reliable without adding accounts or heavy architecture.

Planned work:

- Clarify and harden generation modes.
- Keep long-form/chunking behavior limited to providers where it is actually supported.
- Improve local media cache cleanup and unavailable-audio UX.
- Add focused mock-mode smoke checks.

Completion criteria:

- Mock mode exercises health, rewrite/translate, and TTS without paid keys.
- Long-form limitations are clear.
- Audio/history cache cleanup does not create confusing dead entries.
- Focused checks catch broken MVP flows quickly.

### Phase 5 — Safety / polish / release readiness

Goal: make Voxa presentable as a functional MVP.

Planned work:

- Add release-readiness checklist.
- Add Docker/local deployment troubleshooting.
- Add focused accessibility/mobile checks for studio, modals, history, and audio dock.
- Keep visual polish after backbone truth is stable.

Completion criteria:

- README/docs explain local, Docker, mock, and production setup clearly.
- Release checklist is usable before tagging/deploying.
- No high-risk fake UI/backbone mismatch remains.
- MVP can be demonstrated safely in mock mode.

## Current phase

Current phase: Phase 1 — Foundation / truth alignment.

Reason: the safest first work is correcting provider/default/docs truth before deeper API, settings, and release-readiness work.

## Active execution queue

Only this first active execution slice should exist as implementation issues right now:

1. #2 — 01 Align provider defaults and documentation truth
2. #3 — 02 Add shared provider registry helpers
3. #4 — 03 Add shared API request validation
4. #5 — 04 Sanitize API error responses
5. #6 — 05 Harden provider selection for unknown names
6. #7 — 06 Improve provider and health diagnostics
7. #8 — 07 Connect settings panel to live provider status
8. #9 — 08 Make generation mode behavior provider-aware
9. #10 — 09 Improve local history and audio cache recovery UX
10. #11 — 10 Add mock-mode smoke checks and release readiness docs

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

## Completed work if known

- Initial roadmap issue exists: #1.
- First active execution issue slice exists: #2 through #11.
- No implementation issues are known complete in this new AI Rail sequence.

## Future tasks/backlog

Do not create issues for these yet unless the roadmap is intentionally expanded:

- Server-side generated media library.
- User accounts/auth/sync.
- Provider key management UI.
- Cloud storage/history sync.
- Full automated integration suite.
- New provider additions.
- Deep UI redesign/polish.
- PR/CI automation after MVP backbone is stable.

## Blockers/postponed items

- Server-side generated media library is postponed.
- User accounts/auth/sync are postponed.
- Provider key management UI is postponed; `.env` remains the configuration surface for MVP.
- Cloud storage/history sync is postponed.
- Full automated integration test suite is postponed; first target is a lightweight mock-mode smoke path.
- New provider additions are postponed until the existing provider backbone is stable.
- Deep UI redesign/polish is postponed until provider truth, API safety, and settings backbone are fixed.

## Next recommended issue/task

Next issue: #2 — 01 Align provider defaults and documentation truth.

Why first:

- It is the safest foundation issue.
- It fixes a real truth mismatch between docs/env expectations and runtime default behavior.
- Later provider registry, health, and settings work should build on the corrected default strategy.

Suggested focused checks for #2:

- `npm run typecheck`
- Optional quick manual review of README and `.env.example` provider setup snippets.

## AI Rail workflow reminder

Human workflow:

```bash
rail n
# paste generated prompt into coding agent

rail v
# paste review prompt into AI reviewer

rail s "type(scope): message"
```

The coding agent should read only the current GitHub issue body and this project memory, implement only that issue, then stop for human review.

<!-- AI RAIL MANAGED ROADMAP END -->

## Roadmap maintenance rules

- Keep the full roadmap here.
- Keep only the active execution slice as GitHub implementation issues.
- Do not create `.rail/ROADMAP.md`.
- Do not use GitHub Issues for the entire 100-task roadmap.
- Use `rail import` after `rail plan --copy` or `rail phase --copy`.
- Use `rail s` to ship/close one issue and mark it completed locally.
