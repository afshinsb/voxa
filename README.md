# Voxa

Voxa is a prerelease multi-provider AI voice studio for writing, refining, and generating narration. It supports OpenAI, Gemini, ElevenLabs, and a local mock provider through server-side Next.js route handlers.

Current prerelease: `0.3.0-alpha.0`

## Provider Strategy

- OpenAI is the default stable provider and uses fixed provider voice IDs.
- Gemini is an experimental expressive provider. Its voice profiles are treated as voice directions, not fixed character voices, because voice identity can vary between generations or long text.
- ElevenLabs is the premium voice consistency provider when configured with a voice ID.
- Mock is demo mode for local UI testing without API keys.

For long narration, OpenAI or ElevenLabs may be more consistent. Gemini prioritizes low request count by default and does not auto-chunk on free-tier style usage.

## Features

- Text-to-speech with OpenAI, Gemini, ElevenLabs, or local mock audio
- Persian and English rewrite or translation before generation
- Provider-aware voices or Gemini voice directions
- Six branded voice characters: Chloe, Vivian, Mia, Titan, Vincent, and Adam
- Provider-specific TTS adapters that keep character identity separate from tone delivery
- Generation modes: lowest quota usage, balanced, and highest consistency
- Long-form Gemini consistency warnings
- Browser-local history with cached audio playback and download actions
- Modern audio dock with playback, downloads, and request-lifecycle progress
- Theme and UI choice persistence
- Keyboard shortcuts: `Cmd/Ctrl + Enter`, `Cmd/Ctrl + K`, `Cmd/Ctrl + Shift + R`
- Server-only API key handling through Next.js route handlers

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

The sample environment uses OpenAI as the stable default. Add an API key before generating production audio:

```bash
TTS_PROVIDER=openai
TEXT_PROVIDER=openai
OPENAI_API_KEY=<your-openai-api-key>
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TEXT_MODEL=gpt-4o-mini
```

For local testing without API keys:

```bash
TTS_PROVIDER=mock
TEXT_PROVIDER=mock
```

For Gemini:

```bash
TTS_PROVIDER=gemini
TEXT_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_TTS_MODEL=gemini-2.5-flash-preview-tts
GEMINI_TTS_VOICE=Kore
GEMINI_TEXT_MODEL=gemini-2.0-flash
```

For ElevenLabs:

```bash
TTS_PROVIDER=elevenlabs
TEXT_PROVIDER=openai
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
OPENAI_API_KEY=<your-openai-api-key>
```

## Voice Characters And Tones

Voxa keeps one universal voice and tone config in `src/lib/voice-config.ts`.

Characters control the base speaker:

- Chloe: young, playful, trendy valley-girl style
- Vivian: polished professional assistant
- Mia: thin, soft, light, airy feminine voice
- Titan: extremely deep, thick masculine voice
- Vincent: cinematic dubbed narrator
- Adam: balanced, natural, trustworthy male voice

Tones control delivery only:

- Calm, Warm, Cheerful, Whisper, Energetic, Cinematic, Intimate, Storyteller

Provider adapters translate the same character/tone pair differently:

- OpenAI receives a fixed provider voice ID plus detailed natural-language instructions.
- Gemini receives stricter identity-preservation prompts and character-specific prebuilt voice mapping.
- ElevenLabs prioritizes stable voice IDs and voice settings such as stability, similarity boost, style, speed, and speaker boost.

To compare tone differences for one character, start the app and run:

```bash
npm run samples:tones -- chloe
```

Generated comparison files are written to `samples/tts-tone-comparison/` and ignored by Git.

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run start
```

## Docker

Create `.env` first, then run:

```bash
docker compose up --build
```

The production image uses Next.js standalone output and serves the app on port `3000`.

## API Routes

- `POST /api/tts` generates audio and returns base64 audio data.
- `POST /api/rewrite` rewrites text for natural spoken delivery.
- `POST /api/translate` translates Persian to English or English to Persian.
- `GET /api/providers` returns provider availability and active defaults.
- `GET /api/health` returns runtime health metadata.

## Architecture

Provider implementations live in:

```text
src/providers/tts/
src/providers/text/
```

The frontend never receives provider API keys. Route handlers instantiate providers on the server from environment variables, making the app suitable for deployment on Vercel or as a Dockerized full app. For Cloudflare-style deployments, keep provider calls in server routes or move the provider layer into a worker-compatible API service.

Local UI state is stored in browser storage. Generated history audio is cached in IndexedDB so refreshed history items can still play and download while the browser keeps that cache.

## Release Notes

`0.3.0-alpha.0` is a prerelease focused on branded voice characters, provider-specific TTS adapters, stronger tone control, generated media cache cleanup, and mobile/player UX fixes.
