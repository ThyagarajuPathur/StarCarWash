import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';
import '../styles/main.scss';

const Profile: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const updatedData = await updateProfile({ name, phone });
            // Update local user state specifically (assuming API returns the updated user object or we merge it)
            // The API we wrote returns { message, user: { ... } }
            if (user) {
                const refreshedUser = { ...user, name, phone, ...updatedData.user };
                updateUser(refreshedUser);
            }
            setStatus('success');
            setMessage('Profile updated successfully!');
        } catch (err: any) {
            setStatus('error');
            setMessage('Failed to update profile. Please try again.');
        }
    };

    if (!user) {
        return <div className="profile-page">Please log in to view your profile.</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <h1>My Profile</h1>
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={user.email} disabled className="input-disabled" />
                        <small>Email cannot be changed.</small>
                    </div>

                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                        />
                    </div>

                    {status === 'success' && <div className="success-message">{message}</div>}
                    {status === 'error' && <div className="error-message">{message}</div>}

                    <button type="submit" className="btn-primary" disabled={status === 'loading'}>
                        {status === 'loading' ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
