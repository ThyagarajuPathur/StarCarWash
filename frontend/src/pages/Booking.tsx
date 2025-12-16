import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableDates, requestBookingOtp, confirmBooking, type AvailableDate } from '../api/bookings';
import '../styles/main.scss';

type Step = 'service' | 'date' | 'details' | 'otp' | 'success';

const services = [
    { id: 1, name: 'Interior Wash', price: '$20' },
    { id: 2, name: 'Exterior Wash', price: '$15' },
    { id: 3, name: 'Full Wash', price: '$30' },
];

const Booking: React.FC = () => {
    const [step, setStep] = useState<Step>('service');
    const [selectedService, setSelectedService] = useState<number>(0);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
    const [details, setDetails] = useState({ name: '', phone: '', vehicle: '', notes: '' });
    const [bookingId, setBookingId] = useState<string>('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (step === 'date') {
            fetchDates();
        }
    }, [step]);

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
        setSelectedService(id);
        setStep('date');
    };

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setStep('details');
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await requestBookingOtp({
                serviceId: selectedService,
                date: selectedDate,
                customerName: details.name,
                customerPhone: details.phone,
                vehicleDetails: details.vehicle,
                notes: details.notes,
            });
            setBookingId(response.bookingId);
            setStep('otp');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to request booking');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await confirmBooking(bookingId, otp);
            setStep('success');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

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
                                value={details.phone}
                                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                            />
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
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Processing...' : 'Next'}
                            </button>
                        </div>
                    </form>
                );
            case 'otp':
                return (
                    <form onSubmit={handleOtpSubmit}>
                        <h2>Verify Phone Number</h2>
                        <p>We sent an OTP to {details.phone}</p>
                        <div className="form-group">
                            <label>OTP</label>
                            <input
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <div className="actions">
                            <button type="button" className="btn-secondary" onClick={() => setStep('details')}>Back</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Verifying...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </form>
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
