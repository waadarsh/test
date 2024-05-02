import React from 'react';
import { Navbar, NavbarBrand, Button, Row, Col } from 'reactstrap';
import { FaBars, FaCog } from 'react-icons/fa';

const Topbar = ({ toggleSidebar }) => {
  return (
    <Navbar className="my-2" color="secondary" dark expand="md">
      <Row className="g-0" style={{ width: '100%' }}>
        {/* Column for the toggle button */}
        <Col xs="auto">
          <Button onClick={toggleSidebar} style={{ backgroundColor: 'transparent', border: 'none' }}>
            <FaBars style={{ color: 'white' }} />
          </Button>
        </Col>

        {/* Column for the navbar brand */}
        <Col className="d-flex justify-content-center">
          <NavbarBrand href="/">Reactstrap</NavbarBrand>
        </Col>

        {/* Column for avatars, aligned to the right */}
        <Col className="d-flex justify-content-end align-items-center">
          <div className="position-relative mr-2">
            <img src="/path/to/avatar1.jpg" alt="User 1" className="rounded-circle" style={{ width: '40px', height: '40px' }} />
            <FaCog className="position-absolute" style={{ bottom: 0, right: 0, color: 'gray', cursor: 'pointer' }} />
          </div>
          <div className="position-relative">
            <img src="/path/to/avatar2.jpg" alt="User 2" className="rounded-circle" style={{ width: '40px', height: '40px' }} />
            <FaCog className="position-absolute" style={{ bottom: 0, right: 0, color: 'gray', cursor: 'pointer' }} />
          </div>
        </Col>
      </Row>
    </Navbar>
  );
}

export default Topbar;
