import React from 'react';
import './App.css';
import AudioRecorder from './components/AudioRecorder';
import SessionBrowser from './components/SessionBrowser';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Consultation AI Prototype</h1>
      </header>
      <main>
        <AudioRecorder />
        <hr />
        <SessionBrowser />
      </main>
    </div>
  );
}

export default App;
