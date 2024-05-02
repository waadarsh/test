import React, { useState } from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { FaRegEdit, FaBookOpen, FaThumbsUp, FaChartBar, FaBars } from 'react-icons/fa';

const Sidebar = ({ isOpen, toggle }) => {
  return (
    <div style={{
      width: isOpen ? '250px' : '60px',
      minHeight: '100vh',
      backgroundColor: '#343a40',
      color: 'white',
      transition: 'width 0.3s',
      position: 'fixed', // keeps the sidebar fixed during page scroll
      overflowX: 'hidden' // Prevents horizontal scrollbar
    }}>
      <Navbar color="dark" dark>
        <NavbarBrand href="/" className="mr-auto" style={{ display: isOpen ? 'block' : 'none' }}>
          Reactstrap
        </NavbarBrand>
        <NavbarToggler onClick={toggle} className="mr-2" style={{ border: 'none' }}>
          <FaBars style={{ color: 'white' }} />
        </NavbarToggler>
        <Collapse isOpen={isOpen} navbar>
          <Nav vertical>
            <NavItem>
              <NavLink href="#"><FaRegEdit /> {isOpen && 'Assignment Request'}</NavLink>
            </NavItem>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                <FaBookOpen /> {isOpen && 'Resource Management'}
              </DropdownToggle>
              <DropdownMenu right dark>
                <DropdownItem>
                  Option 1
                </DropdownItem>
                <DropdownItem>
                  Option 2
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <NavItem>
              <NavLink href="#"><FaThumbsUp /> {isOpen && 'Approval Management'}</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#"><FaChartBar /> {isOpen && 'Reports'}</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};

export default Sidebar;
