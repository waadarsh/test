// src/components/Topbar.js
import React from 'react';
import {Navbar, NavbarBrand} from 'reactstrap';

const Topbar = () => {
  return (
    <Navbar className="my-2" color="secondary" dark>
    <NavbarBrand href="/">Reactstrap</NavbarBrand>
    </Navbar>
  );
}

export default Topbar;
