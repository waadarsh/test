// src/AdminPage.js
import React, {useState} from 'react';
import {Container} from 'reactstrap';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AdminPage = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen)

  if(!user || !user.uname){
    return <div>Loading user data, please wait...</div>
  }
  
  return (
    <div style={{display:'flex'}}>
      <Sidebar isOpen={isOpen} toggle={toggle} />
      <Container fluid style={{ marginLeft: isOpen ? '250px' : '50px', transition: 'margin-left 0.3s', paddingLeft: '20px' }}>
        <Topbar />
        <h2>Admin Dashboard</h2>
        <p>Welcome, {user.uname}. You have administrative access.</p>
        <button onClick={logout}>Logout</button>
      </Container>
    </div>
  );
};

export default AdminPage;
