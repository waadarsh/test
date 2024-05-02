import React, { useState } from 'react';
import { Container, Button } from 'reactstrap';  // Ensure Button is imported if not already
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { FaBars } from 'react-icons/fa'; // Import icon for the button

const AdminPage = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  if (!user || !user.uname) {
    return <div>Loading user data, please wait...</div>;
  }
  
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar isOpen={isOpen} />
      <Container fluid style={{ marginLeft: isOpen ? '250px' : '50px', transition: 'margin-left 0.3s', paddingLeft: '20px' }}>
        <Topbar />
        <Button onClick={toggle} style={{ marginBottom: '10px' }}>
          <FaBars /> {/* Icon for the button */}
        </Button>
        <h2>Admin Dashboard</h2>
        <p>Welcome, {user.uname}. You have administrative access.</p>
        <button onClick={logout}>Logout</button>
      </Container>
    </div>
  );
};

export default AdminPage;
