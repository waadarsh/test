// src/components/LoginPage.js
import React, { useState } from 'react';

const LoginPage = ({ authenticate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');  // Clear any existing errors
    setIsLoading(true);  // Show a loading indicator

    try {
      await authenticate(username, password);
      setPassword('');  // Clear password on success or failure for security
    } catch (error) {
      setError('Failed to login. Check your username and password.');
      setIsLoading(false);
      setPassword('');  // Clear password on failure
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error" aria-live="assertive">{error}</p>}
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
