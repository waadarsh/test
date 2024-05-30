// src/SessionList.js
import React, { useState } from 'react';
import axios from 'axios';

const SessionList = ({ userId }) => {
  const [sessions, setSessions] = useState([]);
  const [chatHistories, setChatHistories] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/sessions/${userId}`);
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchChatHistories = async (sessionId) => {
    try {
      const response = await axios.get(`http://localhost:8000/chathistory/${sessionId}`);
      setChatHistories(response.data.chat_histories);
      setSelectedSession(sessionId);
    } catch (error) {
      console.error('Error fetching chat histories:', error);
    }
  };

  return (
    <div>
      <button onClick={fetchSessions}>Get Sessions</button>
      <div>
        {sessions.length > 0 && (
          <div>
            <h3>Sessions:</h3>
            <ul>
              {sessions.map((session, index) => (
                <li key={session.session_id}>
                  <span>Chat {index + 1}</span> | 
                  <span> Created At: {new Date(session.created_at).toLocaleString()}</span>
                  <button onClick={() => fetchChatHistories(session.session_id)}>Get Chat Histories</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>
        {selectedSession && chatHistories.length > 0 && (
          <div>
            <h3>Chat Histories for Session: {selectedSession}</h3>
            <ul>
              {chatHistories.map((chat) => (
                <li key={chat.id}>
                  <span>{new Date(chat.created_at).toLocaleString()}</span>: 
                  <span> {chat.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionList;
