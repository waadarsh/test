import AdminPage from '../components/AdminPage';
import ProtectedRoute from '../components/ProtectedRoute';

const Admin = ({ user, logout }) => {
    return <ProtectedRoute component={AdminPage} user={user} logout={logout} />;
};

Admin.getInitialProps = ({ query }) => {
    const user = query.user ? JSON.parse(query.user) : null;
    const logout = query.logout ? JSON.parse(query.logout) : null;
    return { user, logout };
};

export default Admin;
