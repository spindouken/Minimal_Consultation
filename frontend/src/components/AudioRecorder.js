import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

const AudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [transcript, setTranscript] = useState('');
    const [summary, setSummary] = useState('');
    const [notes, setNotes] = useState(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [transcriptionSuccess, setTranscriptionSuccess] = useState(false);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    const handleStartRecording = async () => {
        try {
            setUploadSuccess(false);
            setTranscriptionSuccess(false);
            setTranscript('');
            setSummary('');
            setNotes(null);
            const response = await fetch('http://localhost:8000/sessions', { method: 'POST' });
            if (!response.ok) {
                throw new Error('Failed to start session');
            }
            const data = await response.json();
            setSessionId(data.session_id);
            setStatusMessage(`Session started: ${data.session_id}`);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };
            mediaRecorder.current.onstop = handleStop;
            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error starting recording:", error);
            setStatusMessage(`Error: ${error.message}`);
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
        }
    };

    const handleStop = async () => {
        setIsRecording(false);
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        audioChunks.current = [];

        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');

        try {
            setStatusMessage('Uploading audio...');
            const response = await fetch(`http://localhost:8000/sessions/${sessionId}/upload-audio`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Failed to upload audio');
            }
            const data = await response.json();
            setStatusMessage(`Upload successful! Session: ${data.session_id}`);
            setUploadSuccess(true);
        } catch (error) {
            console.error("Error uploading audio:", error);
            setStatusMessage(`Error: ${error.message}`);
        }
    };

    const handleTranscribe = async () => {
        if (!sessionId) return;
        try {
            setIsTranscribing(true);
            setStatusMessage('Transcribing...');
            const response = await fetch(`http://localhost:8000/sessions/${sessionId}/transcribe`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to transcribe audio');
            }
            const data = await response.json();
            setTranscript(data.transcript);
            setStatusMessage('Transcription complete.');
            setTranscriptionSuccess(true);
        } catch (error) {
            console.error("Error transcribing audio:", error);
            setStatusMessage(`Error: ${error.message}`);
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleSummarize = async () => {
        if (!sessionId) return;
        try {
            setIsSummarizing(true);
            setStatusMessage('Summarizing...');
            const response = await fetch(`http://localhost:8000/sessions/${sessionId}/summarize`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to summarize transcript');
            }
            const data = await response.json();
            setSummary(data.summary);
            setNotes(data.notes);
            setStatusMessage('Summarization complete.');
        } catch (error) {
            console.error("Error summarizing transcript:", error);
            setStatusMessage(`Error: ${error.message}`);
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div>
            <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
                <p><strong>Notice:</strong> This prototype uses external APIs (Deepgram for transcription, OpenAI for summarization) to process your audio. Your data will be sent to these services.</p>
            </div>
            <h2>Audio Recorder</h2>
            <div>
                <button onClick={handleStartRecording} disabled={isRecording}>
                    Start Recording
                </button>
                <button onClick={handleStopRecording} disabled={!isRecording}>
                    Stop Recording
                </button>
                <button onClick={handleTranscribe} disabled={!uploadSuccess || isTranscribing}>
                    Transcribe
                </button>
                <button onClick={handleSummarize} disabled={!transcriptionSuccess || isSummarizing}>
                    Summarize
                </button>
            </div>
            <p>
                Status:
                <span style={{
                    height: '10px',
                    width: '10px',
                    backgroundColor: isRecording ? 'green' : 'red',
                    borderRadius: '50%',
                    display: 'inline-block',
                    marginLeft: '5px'
                }}></span>
                {isRecording ? ' Recording...' : ' Stopped'}
            </p>
            {statusMessage && <p>{statusMessage}{isTranscribing || isSummarizing ? '...' : ''}</p>}

            {transcript && (
                <div>
                    <h3>
                        Transcript
                        <span style={{fontSize: '0.8em', marginLeft: '10px'}}>
                            <input type="checkbox" id="redact" name="redact" disabled />
                            <label htmlFor="redact" style={{color: '#888'}}> Redact PII (coming soon)</label>
                        </span>
                    </h3>
                    <p>{transcript}</p>
                </div>
            )}

            {summary && (
                <div>
                    <h3>Summary</h3>
                    <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
            )}

            {notes && (
                <div>
                    <h3>Notes</h3>
                    <h4>Key Points:</h4>
                    <ul>
                        {notes.key_points.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                    <h4>Action Items:</h4>
                    <ul>
                        {notes.action_items.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;
