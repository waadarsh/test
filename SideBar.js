import React, { useState } from 'react';
import { Collapse, Button, CardBody, Card, Nav, NavItem, NavLink } from 'reactstrap';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div>
      <Button color="primary" onClick={toggle} style={{ marginBottom: '1rem' }}>Toggle</Button>
      <Collapse isOpen={isOpen}>
        <Card>
          <CardBody>
            <Nav vertical>
              <NavItem>
                <NavLink href="#">Dashboard</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#">Profiles</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#">Settings</NavLink>
              </NavItem>
              {/* You can add more NavItems here */}
            </Nav>
          </CardBody>
        </Card>
      </Collapse>
    </div>
  );
};

export default Sidebar;
