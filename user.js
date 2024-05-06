import UserPage from '../components/UserPage';
import ProtectedRoute from '../components/ProtectedRoute';

const User = ({ user, logout }) => {
    return <ProtectedRoute component={UserPage} user={user} logout={logout} />;
};

User.getInitialProps = ({ query }) => {
    const user = query.user ? JSON.parse(query.user) : null;
    const logout = query.logout ? JSON.parse(query.logout) : null;
    return { user, logout };
};

export default User;
