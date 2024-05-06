import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ProtectedRoute = ({ component: Component, user, logout, ...rest }) => {
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    return user ? <Component user={user} logout={logout} {...rest} /> : null;
};

export default ProtectedRoute;
