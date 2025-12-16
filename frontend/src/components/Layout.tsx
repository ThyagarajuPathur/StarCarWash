import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/main.scss'; // Ensure global styles are loaded

const Layout: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="app-layout">
            <header className="app-header" style={{ padding: '1rem', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="logo">
                    <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>StarCarWash</Link>
                </div>
                <nav>
                    <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
                    {user ? (
                        <>
                            <Link to="/my-bookings" style={{ marginRight: '1rem' }}>My Bookings</Link>
                            {/* We might want to check for admin role here if we had it explicitly */}
                            {user.role === 'admin' && <Link to="/admin" style={{ marginRight: '1rem' }}>Admin</Link>}
                            <button onClick={logout} style={{ background: 'transparent', color: '#dc3545' }}>Logout</button>
                        </>
                    ) : (
                        <Link to="/login" style={{ color: '#007bff' }}>Login</Link>
                    )}
                </nav>
            </header>
            <main className="app-content" style={{ padding: '2rem', minHeight: '80vh' }}>
                <Outlet />
            </main>
            <footer className="app-footer" style={{ padding: '1rem', textAlign: 'center', background: '#343a40', color: '#fff' }}>
                &copy; {new Date().getFullYear()} Star Car Wash. All rights reserved.
            </footer>
        </div>
    );
};

export default Layout;
