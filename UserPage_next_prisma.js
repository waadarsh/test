import UserPage from '../components/UserPage';
import ProtectedRoute from '../components/ProtectedRoute';

const User = ({ user, logout }) => {
    return <ProtectedRoute component={UserPage} user={user} logout={logout} />;
};

User.getInitialProps = ({ query }) => {
    const user = query.user ? JSON.parse(query.user) : null;
    return {
        user,
        logout: () => {
            if (user) {
                sessionStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
    };
};

export default User;
