import React from 'react';
import { useRouter } from 'next/router';
import { Nav, NavItem, NavLink } from 'reactstrap';

const Sidebar = ({ isOpen, logout }) => {
    const router = useRouter();

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <Nav vertical>
                <NavItem>
                    <NavLink href="#" onClick={() => router.push('/admin/assignment-request')}>
                        Assignment Request
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink href="#" onClick={() to="/" => router.push('/admin/reports')}>
                        Reports
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink href="#" onClick={logout}>
                        Logout
                    </NavLink>
                </NavItem>
            </Nav>
        </div>
    );
};

export default Sidebar;
