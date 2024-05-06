// components/Navigate.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Navigate = ({ user, logout }) => {
    const router = useRouter();

    useEffect(() => {
        if (user.role === 'admin') {
            router.push({
                pathname: '/admin',
                query: { user: JSON.stringify(user), logout: JSON.stringify(logout) },
            });
        } else {
            router.push({
                pathname: '/user',
                query: { user: JSON.stringify(user), logout: JSON.stringify(logout) },
            });
        }
    }, [user, logout, router]);

    return null;
};

export default Navigate;
