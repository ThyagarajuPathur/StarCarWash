import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, verifyLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(phone);
            setStep('otp');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyLogin(phone, otp);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h1>{step === 'phone' ? 'Login' : 'Verify OTP'}</h1>
                {error && <div className="error-message">{error}</div>}

                {step === 'phone' ? (
                    <form onSubmit={handleSendOtp}>
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="form-group">
                            <label htmlFor="otp">OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('phone')}
                            style={{ marginTop: '1rem', background: 'transparent', color: '#6c757d', textDecoration: 'underline' }}
                        >
                            Back to Phone
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
