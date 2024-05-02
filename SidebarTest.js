import React from 'react';
import {
  Collapse,
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button
} from 'reactstrap';
import { FaRegEdit, FaBookOpen, FaThumbsUp, FaChartBar, FaBars } from 'react-icons/fa';

const Sidebar = ({ isOpen, toggle, logout }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: isOpen ? '250px' : '60px',
      backgroundColor: '#343a40',
      color: 'white',
      transition: 'width 0.3s',
      position: 'fixed',
      overflowX: 'hidden'
    }}>
      <Navbar color="dark" dark>
        <NavbarBrand href="/" className="mr-auto" style={{ display: isOpen ? 'block' : 'none' }}>Reactstrap</NavbarBrand>
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
      <div style={{ marginTop: 'auto', padding: '10px' }}>
        <Button onClick={logout} style={{ width: '100%', backgroundColor: '#343a40', borderColor: '#343a40' }}>Logout</Button>
      </div>
    </div>
  );
};

export default Sidebar;
