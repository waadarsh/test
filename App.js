// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './LoginPage';
import AdminPage from './AdminPage';
import UserPage from './UserPage';
import ProtectedRoute from './ProtectedRoute';

const App = () => {
  const [user, setUser] = useState(null);

  const authenticate = (username, password) => {
    axios.get('http://localhost:8000/login', { auth: { username, password } })
      .then(response => {
        setUser({ uname: response.data.uname, role: response.data.role });
      })
      .catch(error => {
        console.error('Authentication failed:', error);
        alert('Authentication failed, check console for details.');
      });
  };

  const logout = () => {
    setUser(null); // Clear the user state
    // Prevent going back to the last authenticated route
    window.history.pushState(null, null, window.location.href);
  };

  return (
    <Router>
      <Switch>
        <Route path="/login">
          {user ? <Redirect to={`/${user.role === 'admin' ? 'admin' : 'user'}`} /> : <LoginPage authenticate={authenticate} />}
        </Route>
        <ProtectedRoute path="/admin" component={AdminPage} user={user} logout={logout} />
        <ProtectedRoute path="/user" component={UserPage} user={user} logout={logout} />
        <Redirect from="/" to="/login" />
      </Switch>
    </Router>
  );
};

export default App;
