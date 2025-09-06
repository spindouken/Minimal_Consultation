import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const SessionBrowser = () => {
    const [sessionIds, setSessionIds] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionData, setSessionData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSessionIds();
    }, []);

    const fetchSessionIds = async () => {
        try {
            setError(null);
            const response = await fetch('http://localhost:8000/sessions');
            if (!response.ok) {
                throw new Error('Failed to fetch sessions');
            }
            const data = await response.json();
            setSessionIds(data.session_ids);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSessionSelect = async (sessionId) => {
        try {
            setIsLoading(true);
            setError(null);
            setSelectedSession(sessionId);
            const response = await fetch(`http://localhost:8000/sessions/${sessionId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch session data');
            }
            const data = await response.json();
            setSessionData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2>Past Sessions</h2>
            <button onClick={fetchSessionIds}>Refresh Sessions</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {sessionIds.map(id => (
                    <li key={id} onClick={() => handleSessionSelect(id)} style={{ cursor: 'pointer', textDecoration: selectedSession === id ? 'underline' : 'none' }}>
                        {id}
                    </li>
                ))}
            </ul>

            {isLoading && <p>Loading session data...</p>}

            {sessionData && (
                 <div>
                    <h3>Session: {sessionData.session_id}</h3>
                    {sessionData.transcript && (
                        <div>
                            <h4>Transcript</h4>
                            <p>{sessionData.transcript}</p>
                        </div>
                    )}
                    {sessionData.summary && (
                        <div>
                            <h4>Summary</h4>
                            <ReactMarkdown>{sessionData.summary}</ReactMarkdown>
                        </div>
                    )}
                    {sessionData.notes && (
                        <div>
                            <h4>Notes</h4>
                            <h5>Key Points:</h5>
                            <ul>
                                {sessionData.notes.key_points.map((point, index) => (
                                    <li key={index}>{point}</li>
                                ))}
                            </ul>
                            <h5>Action Items:</h5>
                            <ul>
                                {sessionData.notes.action_items.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SessionBrowser;
