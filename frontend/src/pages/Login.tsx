import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

const Login: React.FC = () => {
    const [error, setError] = useState('');
    const { googleLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            try {
                await googleLogin(credentialResponse.credential);
                navigate(from, { replace: true });
            } catch (err: any) {
                console.error("Login Failed", err);
                setError(err.response?.data?.message || 'Login Failed');
            }
        }
    };

    const handleGoogleError = () => {
        setError('Google Login Failed');
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h1>Login</h1>
                {error && <div className="error-message">{error}</div>}

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
