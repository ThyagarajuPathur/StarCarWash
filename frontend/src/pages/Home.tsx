import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/main.scss';

const Home: React.FC = () => {
    return (
        <div className="home-page" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#007bff' }}>Welcome to Star Car Wash</h1>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#6c757d' }}>
                Premium car wash services at your convenience.
            </p>
            <Link to="/booking" style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                backgroundColor: '#007bff',
                color: '#fff',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '1.25rem',
                fontWeight: 'bold'
            }}>
                Book Now
            </Link>
        </div>
    );
};

export default Home;
