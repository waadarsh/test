import React from 'react';
import {
  Collapse, Navbar, NavbarBrand, Nav, NavItem, Button
} from 'reactstrap';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { FaRegEdit, FaBookOpen, FaThumbsUp, FaChartBar } from 'react-icons/fa';

const Sidebar = ({ isOpen, logout }) => {
  return (
    <div style={{
      width: isOpen ? '250px' : '60px',
      minHeight: '100vh',
      backgroundColor: '#343a40',
      color: 'white',
      transition: 'width 0.3s',
      position: 'fixed',
      overflowX: 'hidden'
    }}>
      <Navbar color="dark" dark>
        <NavbarBrand href="/" className="mr-auto" style={{ display: isOpen ? 'block' : 'none' }}>
          Reactstrap
        </NavbarBrand>
        <Collapse isOpen={isOpen} navbar>
          <Nav vertical>
            <NavItem>
              <RouterNavLink className="nav-link" to="/assignment-request"><FaRegEdit /> {isOpen && 'Assignment Request'}</RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink className="nav-link" to="/resource-management"><FaBookOpen /> {isOpen && 'Resource Management'}</RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink className="nav-link" to="/approval-management"><FaThumbsUp /> {isOpen && 'Approval Management'}</RouterNavLink>
            </NavItem>
            <NavItem>
              <RouterNavLink className="nav-link" to="/reports"><FaChartBar /> {isOpen && 'Reports'}</RouterNavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
      <div style={{ marginTop: 'auto', padding: '10px' }}>
        <Button onClick={logout} style={{ width: '100%', backgroundColor: '#343a40', borderColor: '#343a40' }}>Logout</Button>
      </div>
    </div>
  );
};

export default Sidebar;
