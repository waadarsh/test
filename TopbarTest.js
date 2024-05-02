import React from 'react';
import { Navbar, NavbarBrand, Button, Row, Col } from 'reactstrap';
import { FaBars } from 'react-icons/fa';

const Topbar = ({ toggleSidebar }) => {
  return (
    <Navbar className="my-2" color="secondary" dark expand="md">
      <Row noGutters={true} style={{ width: '100%' }}>
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

        {/* Optional Column for extra content if needed, currently empty for alignment */}
        <Col xs="auto">
          {/* Intentionally left blank or add more content if needed */}
        </Col>
      </Row>
    </Navbar>
  );
}

export default Topbar;
