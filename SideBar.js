import React, { useState } from 'react';
import { Button, Nav, NavItem, NavLink } from 'reactstrap';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  return (
    <div style={{
      width: isExpanded ? '250px' : '50px',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      transition: 'width 0.3s',
      position: 'fixed', // keeps the sidebar fixed during page scroll
    }}>
      <Button onClick={toggleSidebar} style={{ margin: '10px', width: '30px' }}>≡</Button>
      <Nav vertical>
        <NavItem>
          <NavLink href="#" style={{ display: isExpanded ? 'block' : 'none' }}>Dashboard</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="#" style={{ display: isExpanded ? 'block' : 'none' }}>Profiles</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="#" style={{ display: isExpanded ? 'block' : 'none' }}>Settings</NavLink>
        </NavItem>
        {/* Add more NavItems as needed */}
      </Nav>
    </div>
  );
};

export default Sidebar;
