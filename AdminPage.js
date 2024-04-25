// src/AdminPage.js
import React from 'react';

const AdminPage = ({ user, logout }) => {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome, {user.uname}. You have administrative access.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default AdminPage;
