# Consultation AI Prototype

This project is a barebones web application that records conversations, transcribes them, summarizes them, and generates structured notes. It's designed as a proof-of-concept for a local-first, AI-powered consultation tool.

## How to Run the Project

Follow these steps to get the application running on your local machine.

### Prerequisites

*   [Docker](https://www.docker.com/products/docker-desktop/) installed on your machine.
*   An API key from [Deepgram](https://deepgram.com/) for transcription services.
*   An API key from [OpenAI](https://openai.com/) for summarization services.

### Step 1: Create the Environment File

In the root directory of the project, create a new file named `.env`. This file will store your secret API keys. Copy the following content into the `.env` file:

```
# .env file

# Speech-to-Text API Key (Deepgram)
STT_API_KEY=YOUR_DEEPGRAM_API_KEY_HERE

# Large Language Model API Key (OpenAI)
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
```

Replace `YOUR_DEEPGRAM_API_KEY_HERE` and `YOUR_OPENAI_API_KEY_HERE` with your actual API keys.

### Step 2: Build and Run the Application

Open a terminal in the root directory of the project and run the following command:

```bash
docker-compose up --build
```

This command will:
1.  Build the Docker images for the `frontend` and `backend` services based on their respective `Dockerfile`s.
2.  Start the containers for both services.

The first time you run this, it may take a few minutes to download the base images and install the dependencies.

### Step 3: Access the Application

Once the containers are running, you can access the web application by opening your browser and navigating to:

[http://localhost:3000](http://localhost:3000)

The backend API is available at `http://localhost:8000`, and you can view its health status at `http://localhost:8000/health`.

## How to Use the Application

1.  **Record Audio**: Click **Start Recording** to begin recording audio from your microphone. A green light will indicate that recording is active. Click **Stop Recording** when you are finished.
2.  **Transcribe**: After stopping the recording, the audio is uploaded. Click the **Transcribe** button to process the audio with Deepgram. The transcript will appear on the page.
3.  **Summarize**: Once transcription is complete, click the **Summarize** button to send the transcript to OpenAI. A summary and structured notes (key points and action items) will be displayed.
4.  **View Past Sessions**: The **Past Sessions** section at the bottom of the page lists all previous sessions by their timestamp. Click on a session ID to load and view its saved data.

## Project Structure

The project is organized into a frontend and a backend service, containerized with Docker.

*   `docker-compose.yml`: The main configuration file for Docker Compose. It defines the services, networks, and volumes for the application and is the entry point for running the project.
*   `.env`: Stores the API keys for external services. This file is loaded by Docker Compose and is not checked into version control.
*   `frontend/`: Contains the React application.
    *   `Dockerfile`: Instructions to build the frontend Docker image.
    *   `package.json`: Lists the Node.js dependencies for the frontend.
    *   `src/`: Contains the React source code.
        *   `App.js`: The main application component that lays out the page.
        *   `components/AudioRecorder.js`: The component responsible for the entire workflow: recording, uploading, transcribing, and summarizing.
        *   `components/SessionBrowser.js`: The component for browsing and viewing past sessions.
*   `backend/`: Contains the FastAPI application.
    *   `Dockerfile`: Instructions to build the backend Docker image.
    *   `requirements.txt`: Lists the Python dependencies for the backend.
    *   `app/main.py`: The main FastAPI application file, containing all API endpoints for session management, audio processing, and data retrieval.
*   `sessions/`: This directory is created automatically by the backend service. It stores all the data for each consultation, with each session organized in its own timestamped subdirectory.
    *   `audio.wav`: The raw audio recording.
    *   `transcript.txt`: The text transcript.
    *   `summary.md`: A markdown-formatted summary.
    *   `notes.json`: Structured notes including key points and action items.
