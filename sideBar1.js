import React from 'react';
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
import { FaHome, FaUser, FaBook, FaQuestion, FaEnvelope, FaBars } from 'react-icons/fa';

const Sidebar = ({ isOpen, toggle }) => {
  return (
    <div style={{
      width: isOpen ? '250px' : '50px',
      minHeight: '100vh',
      backgroundColor: '#007bff',
      color: 'white',
      transition: 'width 0.3s',
      position: 'fixed', // keeps the sidebar fixed during page scroll
    }}>
      <Navbar color="faded" light>
        <NavbarBrand href="/" className="mr-auto">
          {isOpen && 'Bootstrap Sidebar'}
        </NavbarBrand>
        <NavbarToggler onClick={toggle} className="mr-2">
          <FaBars style={{ color: 'white' }} />
        </NavbarToggler>
        <Collapse isOpen={isOpen} navbar>
          <Nav navbar>
            <NavItem>
              <NavLink href="#"><FaHome /> {isOpen && 'Home'}</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#"><FaUser /> {isOpen && 'About'}</NavLink>
            </NavItem>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                <FaBook /> {isOpen && 'Pages'}
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>
                  Portfolio
                </DropdownItem>
                <DropdownItem>
                  FAQ
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <NavItem>
              <NavLink href="#"><FaQuestion /> {isOpen && 'FAQ'}</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#"><FaEnvelope /> {isOpen && 'Contact'}</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};

export default Sidebar;
