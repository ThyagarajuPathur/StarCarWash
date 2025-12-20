import React, { useState, useEffect } from 'react';
import { getBookingsByDate, updateBookingStatus } from '../api/admin';
import type { Booking } from '../api/user';
import '../styles/main.scss';

const AdminDashboard: React.FC = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBookings();
    }, [date]);

    const fetchBookings = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getBookingsByDate(date);
            setBookings(data);
        } catch (err) {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await updateBookingStatus(id, newStatus);
            // Optimistic update or refetch
            setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus as any } : b));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const statusOptions = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'NoShow'];

    return (
        <div className="admin-dashboard-page">
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>Admin Dashboard</h1>
                    <div>
                        <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Select Date:</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da' }}
                        />
                    </div>
                </div>

                {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
                    bookings.length === 0 ? <p>No bookings for this date.</p> : (
                        <div className="bookings-table-container" style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Time/ID</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Service</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Vehicle</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                            <td style={{ padding: '1rem' }}>#{booking.id}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <div>{booking.customerName || 'N/A'}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{booking.customerPhone}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{booking.service || `Service #${booking.serviceId}`}</td>
                                            <td style={{ padding: '1rem' }}>{booking.vehicleDetails}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontWeight: 'bold', color: booking.status === 'Confirmed' ? 'green' : 'gray' }}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <select
                                                    value={booking.status}
                                                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                                    style={{ padding: '0.25rem', borderRadius: '4px' }}
                                                >
                                                    {statusOptions.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
