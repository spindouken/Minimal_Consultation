# Implementation Plan

- [ ] 1. Set up containerized project structure and core infrastructure
    - Create Docker Compose configuration for FastAPI backend and React frontend
    - Add `.env` file for API keys (STT + LLM)
    - Implement basic FastAPI application with health check endpoint and CORS middleware
    - Create React application with routing and minimal layout components (header, dashboard container)
    - _Requirements: Functional 1, Non-Functional Local-first_

- [ ] 2. Implement audio recording and upload
    - [ ] 2.1 Backend audio handling
        - Implement `/upload-audio` endpoint in FastAPI to accept audio chunks
        - Save audio files locally in `/sessions/[timestamp]/audio.wav`
        - Add validation for supported formats (`.wav`, `.mp3`)
        - _Requirements: Functional 1, Guardrails Transparency_

    - [ ] 2.2 Frontend audio capture
        - Create microphone capture component with browser MediaRecorder API
        - Implement Start/Stop recording buttons with clear status indicator
        - Send recorded audio chunks to backend endpoint
        - _Requirements: Functional 1, Guardrails Consent Indicator_

- [ ] 3. Add transcription system (STT API integration)
    - [ ] 3.1 Backend transcription service
        - Integrate Whisper API (or Deepgram/Google STT) for transcription
        - Save transcript to `/sessions/[timestamp]/transcript.txt`
        - Return transcript updates to frontend
        - _Requirements: Functional 2_

    - [ ] 3.2 Frontend transcript display
        - Add transcript panel to dashboard with auto-scrolling
        - Display real-time updates as text is received
        - _Requirements: Functional 2_

- [ ] 4. Add summarization and structured notes
    - [ ] 4.1 Backend summarizer service
        - Implement `summarizer.py` to call LLM API (OpenAI/Claude/Gemini)
        - Generate free-text summary (`summary.md`)
        - Generate structured notes (`notes.json` with key_points + action_items)
        - Save outputs to session folder
        - _Requirements: Functional 3_

    - [ ] 4.2 Frontend summary + notes panel
        - Add summary panel to display Markdown-formatted text
        - Add notes panel with JSON → rendered as collapsible list items
        - _Requirements: Functional 3_

- [ ] 5. Local storage + session management
    - Save all artifacts (audio, transcript, summary, notes) in per-session folders under `/sessions/`
    - Add backend endpoint to list sessions + retrieve stored artifacts
    - Implement “Past Sessions” tab in frontend to view previous conversations
    - _Requirements: Functional 4, 5_

- [ ] 6. UX polish and guardrails
    - Add recording status light (green = recording, red = stopped)
    - Add processing indicator (spinner while summary is generating)
    - Show clear warning if APIs are being used (transparency)
    - Ensure transcript redaction toggle placeholder exists (future feature)
    - _Requirements: Guardrails Consent, Transparency, Local-first_
