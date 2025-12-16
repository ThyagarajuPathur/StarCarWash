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

    const handleStatusChange = async (id: string, newStatus: string) => {
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
                                            <td style={{ padding: '1rem' }}>{booking.id.substring(0, 8)}...</td>
                                            <td style={{ padding: '1rem' }}>
                                                {/* Assuming booking object has customer details if provided by API, 
                            but the Booking interface in user.ts didn't have name/phone. 
                            The brief says "List of user bookings with date, status, service, vehicle and notes." for user.
                            For Admin, "View Bookings by Date". It doesn't explicitly say it returns customer info, 
                            but usually it does. I'll assume it might not be in the type yet.
                            Let's check the brief again. 
                            "Response: List of user bookings..." for user.
                            For Admin: "GET /admin/bookings/{date}". 
                            I'll assume the Booking type is shared or similar. 
                            If customer info is missing, I can't display it. 
                            I'll check the Booking interface I defined.
                         */}
                                                Customer Info
                                            </td>
                                            <td style={{ padding: '1rem' }}>{booking.serviceId}</td>
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
