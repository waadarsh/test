import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './LoginPage';
import AdminPage from './AdminPage';
import UserPage from './UserPage';
import ProtectedRoute from './ProtectedRoute';

const App = () => {
  const [user, setUser] = useState(() => {
    // Retrieve user from localStorage
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [timeoutId, setTimeoutId] = useState(null);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const resetTimeout = useCallback(() => {
    // Clear the existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout
    const newTimeoutId = setTimeout(logout, 5 * 60 * 1000); // 5 minutes
    setTimeoutId(newTimeoutId);
  }, [timeoutId]);

  useEffect(() => {
    // Save or clear user in localStorage whenever it changes
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      resetTimeout(); // Reset the timeout on user change
    } else {
      localStorage.removeItem('user');
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }

    // Reset the timeout on user activity
    const events = ['mousemove', 'keydown', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimeout));

    // Clear the timeout on beforeunload and remove event listeners
    const clearTimeoutAndEvents = () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimeout));
    };

    window.addEventListener('beforeunload', clearTimeoutAndEvents);

    return clearTimeoutAndEvents;
  }, [user, resetTimeout, timeoutId]);

  const authenticate = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/login', { username, password });
      setUser({ uname: response.data.uname, role: response.data.role });
    } catch (error) {
      console.error('Authentication failed:', error);
      alert('Authentication failed, check console for details.');
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={`/${user.role === 'admin' ? 'admin' : 'user'}`} replace /> : <LoginPage authenticate={authenticate} />} />
        <Route path="/admin" element={<ProtectedRoute user={user} logout={logout} component={AdminPage} />} />
        <Route path="/user" element={<ProtectedRoute user={user} logout={logout} component={UserPage} />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
