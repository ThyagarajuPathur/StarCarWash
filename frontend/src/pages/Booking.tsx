import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableDates, createBooking, type AvailableDate } from '../api/bookings';
import { useAuth } from '../context/AuthContext';
import '../styles/main.scss';

type Step = 'service' | 'date' | 'details' | 'review' | 'success';

const services = [
    { id: 1, name: 'Interior Wash', price: '$20' },
    { id: 2, name: 'Exterior Wash', price: '$15' },
    { id: 3, name: 'Full Wash', price: '$30' },
];

const Booking: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [step, setStep] = useState<Step>('service');
    const [selectedService, setSelectedService] = useState<number>(0);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
    const [details, setDetails] = useState({ name: '', phone: '', vehicle: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (step === 'date') {
            fetchDates();
        }
    }, [step]);

    // Pre-fill user details if available
    useEffect(() => {
        if (user) {
            setDetails(prev => ({
                ...prev,
                name: user.name || prev.name,
                phone: user.phone || prev.phone
            }));
        }
    }, [user]);

    const fetchDates = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const dates = await getAvailableDates(today);
            setAvailableDates(dates);
        } catch (err) {
            setError('Failed to load available dates');
        } finally {
            setLoading(false);
        }
    };

    const handleServiceSelect = (id: number) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/booking' } } });
            return;
        }
        setSelectedService(id);
        setStep('date');
    };

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setStep('details');
    };

    const [phoneError, setPhoneError] = useState('');

    const validatePhone = (phone: string) => {
        const regex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
        if (!phone) return 'Phone number is required';
        if (!regex.test(phone)) return 'Invalid Indian phone number';
        return '';
    };

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const error = validatePhone(details.phone);
        if (error) {
            setPhoneError(error);
            return;
        }
        setStep('review');
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDetails({ ...details, phone: value });
        if (phoneError) setPhoneError(validatePhone(value));
    };

    const handleConfirmBooking = async () => {
        setLoading(true);
        setError('');
        const pError = validatePhone(details.phone);
        if (pError) {
            setPhoneError(pError);
            setStep('details');
            setLoading(false);
            return;
        }
        try {
            await createBooking({
                serviceId: selectedService,
                date: selectedDate,
                customerName: details.name,
                customerPhone: details.phone,
                vehicleDetails: details.vehicle,
                notes: details.notes,
            });
            setStep('success');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const getServiceName = (id: number) => services.find(s => s.id === id)?.name;
    const getServicePrice = (id: number) => services.find(s => s.id === id)?.price;

    const renderStep = () => {
        switch (step) {
            case 'service':
                return (
                    <div>
                        <h2>Select a Service</h2>
                        <div className="service-list">
                            {services.map((s) => (
                                <div key={s.id} className="service-card" onClick={() => handleServiceSelect(s.id)}>
                                    <h3>{s.name}</h3>
                                    <p>{s.price}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'date':
                return (
                    <div>
                        <h2>Select a Date</h2>
                        {loading ? <p>Loading dates...</p> : (
                            <div className="date-list">
                                {availableDates.map((d) => (
                                    <div
                                        key={d.date}
                                        className={`date-card ${!d.isAvailable ? 'disabled' : ''}`}
                                        onClick={() => d.isAvailable && handleDateSelect(d.date)}
                                    >
                                        <p>{new Date(d.date).toLocaleDateString()}</p>
                                        <small>{d.isAvailable ? 'Available' : 'Full'}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="actions">
                            <button className="btn-secondary" onClick={() => setStep('service')}>Back</button>
                        </div>
                    </div>
                );
            case 'details':
                return (
                    <form onSubmit={handleDetailsSubmit}>
                        <h2>Enter Details</h2>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                required
                                value={details.name}
                                onChange={(e) => setDetails({ ...details, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                required
                                className={phoneError ? 'input-error' : ''}
                                value={details.phone}
                                onChange={handlePhoneChange}
                                placeholder="+91 9876543210"
                            />
                            {phoneError && <span className="error-text">{phoneError}</span>}
                        </div>
                        <div className="form-group">
                            <label>Vehicle Details</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Toyota Camry, ABC-123"
                                value={details.vehicle}
                                onChange={(e) => setDetails({ ...details, vehicle: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Notes (Optional)</label>
                            <textarea
                                value={details.notes}
                                onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                            />
                        </div>
                        <div className="actions">
                            <button type="button" className="btn-secondary" onClick={() => setStep('date')}>Back</button>
                            <button type="submit" className="btn-primary">Review Booking</button>
                        </div>
                    </form>
                );
            case 'review':
                return (
                    <div className="review-step">
                        <h2>Review & Confirm</h2>
                        <div className="review-details">
                            <p><strong>Service:</strong> {getServiceName(selectedService)} ({getServicePrice(selectedService)})</p>
                            <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                            <p><strong>Name:</strong> {details.name}</p>
                            <p><strong>Phone:</strong> {details.phone}</p>
                            <p><strong>Vehicle:</strong> {details.vehicle}</p>
                            {details.notes && <p><strong>Notes:</strong> {details.notes}</p>}
                        </div>
                        <div className="actions">
                            <button className="btn-secondary" onClick={() => setStep('details')}>Back</button>
                            <button className="btn-primary" onClick={handleConfirmBooking} disabled={loading}>
                                {loading ? 'Confirming...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                );
            case 'success':
                return (
                    <div className="success-message">
                        <div className="icon">🎉</div>
                        <h2>Booking Confirmed!</h2>
                        <p>Your booking for {new Date(selectedDate).toLocaleDateString()} is confirmed.</p>
                        <div className="actions" style={{ justifyContent: 'center', gap: '1rem' }}>
                            <button className="btn-primary" onClick={() => navigate('/')}>Home</button>
                            <button className="btn-secondary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="booking-page">
            <div className="booking-container">
                <h1>Book a Wash</h1>
                {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                {renderStep()}
            </div>
        </div>
    );
};

export default Booking;
