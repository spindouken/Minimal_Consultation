from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import datetime
import shutil
import json
from deepgram import DeepgramClient, PrerecordedOptions
import openai

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3000/",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSIONS_DIR = "sessions"

# Deepgram Client Initialization
DEEPGRAM_API_KEY = os.getenv("STT_API_KEY")
if not DEEPGRAM_API_KEY:
    raise ValueError("STT_API_KEY environment variable not set")
deepgram = DeepgramClient(DEEPGRAM_API_KEY)

# OpenAI Client Initialization
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set")
openai.api_key = OPENAI_API_KEY


@app.on_event("startup")
async def startup_event():
    os.makedirs(SESSIONS_DIR, exist_ok=True)

@app.get("/health")
def read_root():
    return {"status": "ok"}

@app.post("/sessions")
async def create_session():
    """Creates a new consultation session."""
    session_id = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    session_dir = os.path.join(SESSIONS_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    return {"session_id": session_id}

@app.post("/sessions/{session_id}/upload-audio")
async def upload_audio(session_id: str, file: UploadFile = File(...)):
    """Uploads an audio file to a specific session."""
    session_dir = os.path.join(SESSIONS_DIR, session_id)
    if not os.path.isdir(session_dir):
        raise HTTPException(status_code=404, detail="Session not found")

    audio_path = os.path.join(session_dir, "audio.wav")

    try:
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save audio file: {str(e)}")

    return {"message": "Audio uploaded successfully", "session_id": session_id}


@app.post("/sessions/{session_id}/transcribe")
async def transcribe_audio(session_id: str):
    """Transcribes the audio file for a specific session."""
    session_dir = os.path.join(SESSIONS_DIR, session_id)
    audio_path = os.path.join(session_dir, "audio.wav")

    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found for this session")

    try:
        with open(audio_path, "rb") as audio_file:
            source = {"buffer": audio_file, "mimetype": "audio/wav"}
            options = PrerecordedOptions(
                model="nova-2",
                smart_format=True,
            )
            response = deepgram.listen.prerecorded.v("1").transcribe_file(source, options)
            transcript = response.results.channels[0].alternatives[0].transcript

            transcript_path = os.path.join(session_dir, "transcript.txt")
            with open(transcript_path, "w") as f:
                f.write(transcript)

            return {"session_id": session_id, "transcript": transcript}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to transcribe audio: {str(e)}")


@app.post("/sessions/{session_id}/summarize")
async def summarize_transcript(session_id: str):
    """Summarizes the transcript for a specific session."""
    session_dir = os.path.join(SESSIONS_DIR, session_id)
    transcript_path = os.path.join(session_dir, "transcript.txt")

    if not os.path.exists(transcript_path):
        raise HTTPException(status_code=404, detail="Transcript not found for this session")

    with open(transcript_path, "r") as f:
        transcript = f.read()

    try:
        prompt = f"""
        Please summarize the following consultation transcript. Also, extract key points and action items.
        Provide the output in a JSON format with three keys: "summary", "key_points", and "action_items".
        - "summary" should be a string containing a markdown-formatted summary.
        - "key_points" should be an array of strings.
        - "action_items" should be an array of strings.

        Transcript:
        ---
        {transcript}
        ---
        """
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes transcripts."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        data = json.loads(content)

        summary = data.get("summary", "")
        key_points = data.get("key_points", [])
        action_items = data.get("action_items", [])

        # Save the outputs
        summary_path = os.path.join(session_dir, "summary.md")
        with open(summary_path, "w") as f:
            f.write(summary)

        notes_path = os.path.join(session_dir, "notes.json")
        with open(notes_path, "w") as f:
            json.dump({"key_points": key_points, "action_items": action_items}, f, indent=2)

        return {
            "session_id": session_id,
            "summary": summary,
            "notes": {"key_points": key_points, "action_items": action_items}
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to summarize transcript: {str(e)}")


@app.get("/sessions")
async def get_sessions():
    """Lists all available session IDs."""
    try:
        session_ids = [d for d in os.listdir(SESSIONS_DIR) if os.path.isdir(os.path.join(SESSIONS_DIR, d))]
        return {"session_ids": session_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list sessions: {str(e)}")


@app.get("/sessions/{session_id}")
async def get_session_data(session_id: str):
    """Retrieves all data for a specific session."""
    session_dir = os.path.join(SESSIONS_DIR, session_id)
    if not os.path.isdir(session_dir):
        raise HTTPException(status_code=404, detail="Session not found")

    data = {"session_id": session_id}

    # Read transcript
    transcript_path = os.path.join(session_dir, "transcript.txt")
    if os.path.exists(transcript_path):
        with open(transcript_path, "r") as f:
            data["transcript"] = f.read()

    # Read summary
    summary_path = os.path.join(session_dir, "summary.md")
    if os.path.exists(summary_path):
        with open(summary_path, "r") as f:
            data["summary"] = f.read()

    # Read notes
    notes_path = os.path.join(session_dir, "notes.json")
    if os.path.exists(notes_path):
        with open(notes_path, "r") as f:
            data["notes"] = json.load(f)

    return data
