import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './LoginPage';
import AdminPage from './AdminPage';
import UserPage from './UserPage';
import ProtectedRoute from './ProtectedRoute';

const App = () => {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
  }, [user]);

  const authenticate = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/login', { username, password });
      setUser({ uname: response.data.uname, role: response.data.role.toLowerCase() });
    } catch (error) {
      console.error('Authentication failed:', error);
      alert('Authentication failed, check console for details.');
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    window.location.href = '/login';
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
