// src/UserPage.js
import React from 'react';

const UserPage = ({ user, logout }) => {
  return (
    <div>
      <h2>User Dashboard</h2>
      <p>Welcome, {user.uname}. This is your user-specific dashboard.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default UserPage;
