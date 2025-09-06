# Product Requirements Document (PRD)
Product Name: Consultation AI Prototype (Barebones Webapp)
Goal: Provide an easy-to-use local webapp that records conversations, transcribes them, summarizes them, and generates structured notes. Proof-of-concept for open-source consultations.

## Objectives

Enable users to record any conversation (consultation, meeting, personal journaling).

Provide real-time transcription using external STT APIs (Whisper API, Deepgram, Google STT).

Generate summaries and structured notes with LLM APIs (OpenAI/Claude/Gemini).

Save all audio, transcripts, summaries, and notes locally (filesystem).

Deliver a clean, intuitive UI/UX through a React webapp.

## Target Users

Developers exploring GenAI consultation use cases.

Individuals who want to capture, summarize, and structure their own conversations.

Researchers testing voice + LLM pipelines.

## Deliverables

Frontend: React dashboard with Start/Stop recording, transcript panel, summary panel, save/load sessions.

Backend: FastAPI with endpoints for audio upload, transcription, summarization, and saving outputs.

Local Storage: Folder structure with all consultation artifacts (audio, transcript, summary, notes).

Prototype Transparency: Plaintext/JSON outputs for easy inspection.