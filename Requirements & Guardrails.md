# Requirements & Guardrails
## Functional Requirements

Record audio through browser (WebRTC) and send to backend.

Transcribe audio via STT API → return transcript in near real-time.

Summarize transcript via LLM API → produce:

Free-text summary (Markdown).

Structured JSON notes (e.g., { "key_points": [], "action_items": [] }).

Save session locally:

Audio file (.wav).

Transcript (.txt).

Summary (.md).

Notes (.json).

Allow browsing and loading of past sessions in the UI.

## Non-Functional Requirements

Local-first: All data stored locally; no cloud persistence.

Transparency: Outputs should be human-readable (no hidden databases).

Portability: Project should run via docker-compose up with minimal config.

Minimal Dependencies: Keep external services limited to STT + LLM APIs for prototype stage.

## Guardrails

Consent: Show clear indicator when recording is active (status light + label).

Security: Ensure all files stay local; explicitly warn users that APIs are used for transcription/summarization.

Resource Use: Limit audio chunk size to avoid timeouts.

Extensibility: Design pipeline so Whisper (local) or local LLM can replace APIs in the future.