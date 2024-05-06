import React, { useState } from 'react';
import { Container, Button } from 'reactstrap';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AssignmentRequest from './AssignmentRequest';
import Reports from './Reports';

const AdminPage = ({ user, logout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    const router = useRouter();

    if (!user || !user.uname) {
        return <div>Loading user data, please wait...</div>;
    }

    let ComponentToRender;
    switch (router.pathname) {
        case '/admin/assignment-request':
            ComponentToRender = AssignmentRequest;
            break;
        case '/admin/reports':
            ComponentToRender = Reports;
            break;
        default:
            ComponentToRender = () => <div>Nothing matched your route</div>;
            break;
    }

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar isOpen={isOpen} logout={logout} />
            <Container
                fluid
                style={{
                    marginLeft: isOpen ? '250px' : '1px',
                    transition: 'margin-left 0.3s',
                    padding: '0em 1em 1em 1em',
                }}
            >
                <Topbar toggleSidebar={toggle} />
                <Button onClick={toggle} style={{ marginBottom: '10px' }}>
                    Toggle Sidebar
                </Button>
                <h2>Admin Dashboard</h2>
                <p>Welcome, {user.uname}. You have administrative access.</p>
                <ComponentToRender />
            </Container>
        </div>
    );
};

export default AdminPage;
