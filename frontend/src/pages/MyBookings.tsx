import React, { useEffect, useState } from 'react';
import { getMyBookings, type Booking } from '../api/user';
import '../styles/main.scss';

const MyBookings: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await getMyBookings();
            setBookings(data);
        } catch (err) {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Confirmed': return 'green';
            case 'Pending': return 'orange';
            case 'Completed': return 'blue';
            case 'Cancelled': return 'red';
            default: return 'gray';
        }
    };

    const getServiceName = (id: number) => {
        const services: { [key: number]: string } = {
            1: 'Interior Wash',
            2: 'Exterior Wash',
            3: 'Full Wash'
        };
        return services[id] || `Service #${id}`;
    };

    return (
        <div className="my-bookings-page">
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '2rem' }}>My Bookings</h1>
                {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
                    bookings.length === 0 ? <p>No bookings found.</p> : (
                        <div className="bookings-list">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="booking-card" style={{
                                    border: '1px solid #dee2e6',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    marginBottom: '1rem',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ margin: 0 }}>{new Date(booking.date).toLocaleDateString()}</h3>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.875rem',
                                            fontWeight: 'bold',
                                            backgroundColor: `${getStatusColor(booking.status)}20`,
                                            color: getStatusColor(booking.status)
                                        }}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <p><strong>Service:</strong> {getServiceName(booking.serviceId)}</p>
                                    <p><strong>Vehicle:</strong> {booking.vehicleDetails}</p>
                                    {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default MyBookings;
