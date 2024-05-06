
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LoginPage from '../components/LoginPage';
import AdminPage from '../components/AdminPage';
import UserPage from '../components/UserPage';
import ProtectedRoute from '../components/ProtectedRoute';
import axios from 'axios';

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        if (user) {
            sessionStorage.setItem('user', JSON.stringify(user));
        } else {
            sessionStorage.removeItem('user');
        }
    }, [user]);

    const authenticate = async (username, password) => {
        try {
            const response = await axios.post('/api/login', { username, password });
            setUser({ uname: response.data.uname, role: response.data.role.toLowerCase() });
            router.push(response.data.role.toLowerCase() === 'admin' ? '/admin' : '/user');
        } catch (error) {
            console.error('Authentication failed:', error);
            alert('Authentication failed, check console for details.');
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <>
            {user ? (
                user.role === 'admin' ? (
                    <ProtectedRoute component={AdminPage} user={user} logout={logout} />
                ) : (
                    <ProtectedRoute component={UserPage} user={user} logout={logout} />
                )
            ) : (
                <LoginPage authenticate={authenticate} />
            )}
        </>
    );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LoginPage from '../components/LoginPage';
import AdminPage from '../components/AdminPage';
import UserPage from '../components/UserPage';
import Navigate from '../components/Navigate';
import axios from 'axios';

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        sessionStorage.setItem('user', user ? JSON.stringify(user) : '');
    }, [user]);

    const authenticate = async (username, password) => {
        try {
            const response = await axios.post('/api/login', { username, password });
            setUser({ uname: response.data.uname, role: response.data.role.toLowerCase() });
        } catch (error) {
            console.error('Authentication failed:', error);
            alert('Authentication failed. Check the console for details.');
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('user');
        router.push('/login');
    };

    if (!user) {
        return <LoginPage authenticate={authenticate} />;
    }

    return <Navigate user={user} logout={logout} />;
}

