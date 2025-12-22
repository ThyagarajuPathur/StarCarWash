import React, { useState, useEffect } from 'react';
import {
    getAllBookings,
    updateBookingStatus,
    getDashboardStats,
    getAdminServices,
    createService,
    updateService,
    deleteService,
    type DashboardStats,
    type Service
} from '../api/admin';
import type { Booking } from '../api/user';
import '../styles/main.scss';

type AdminTab = 'bookings' | 'services';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
    const [filterDate, setFilterDate] = useState(''); // Empty means show all
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [displayBookings, setDisplayBookings] = useState<Booking[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Service Form State
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [serviceForm, setServiceForm] = useState<Omit<Service, 'id'>>({ name: '', type: 'Full', price: 0 });

    useEffect(() => {
        fetchStats();
        if (activeTab === 'bookings') {
            fetchAllBookings();
        } else {
            fetchServices();
        }
    }, [activeTab]);

    useEffect(() => {
        if (filterDate) {
            setDisplayBookings(allBookings.filter(b => b.date === filterDate));
        } else {
            setDisplayBookings(allBookings);
        }
    }, [filterDate, allBookings]);

    const fetchStats = async () => {
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats', err);
        }
    };

    const fetchAllBookings = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getAllBookings();
            setAllBookings(data);
        } catch (err) {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getAdminServices();
            setServices(data);
        } catch (err) {
            setError('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await updateBookingStatus(id, newStatus);
            setAllBookings(allBookings.map(b => b.id === id ? { ...b, status: newStatus as any } : b));
            fetchStats();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleServiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing !== null) {
                await updateService(isEditing, { id: isEditing, ...serviceForm });
            } else {
                await createService(serviceForm);
            }
            fetchServices();
            setServiceForm({ name: '', type: 'Full', price: 0 });
            setIsEditing(null);
        } catch (err) {
            alert('Failed to save service');
        }
    };

    const handleEditService = (service: Service) => {
        setIsEditing(service.id);
        setServiceForm({ name: service.name, type: service.type, price: service.price });
    };

    const handleDeleteService = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await deleteService(id);
            fetchServices();
        } catch (err) {
            alert('Failed to delete service');
        }
    };

    const statusOptions = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'NoShow'];

    return (
        <div className="admin-dashboard-page">
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>Admin Dashboard</h1>
                    {activeTab === 'bookings' && (
                        <div>
                            <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Filter Date:</label>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da', marginRight: '0.5rem' }}
                            />
                            {filterDate && (
                                <button
                                    onClick={() => setFilterDate('')}
                                    style={{ padding: '0.5rem 1rem', borderRadius: '4px', background: '#f0f0f0', border: '1px solid #ddd', cursor: 'pointer' }}
                                >
                                    Show All
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {stats && (
                    <div className="stats-overview">
                        <div className="stat-card">
                            <h3>Total Bookings</h3>
                            <p className="stat-value">{stats.totalBookings}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Today's Bookings</h3>
                            <p className="stat-value">{stats.todayBookings}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Revenue</h3>
                            <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="stat-card warning">
                            <h3>Pending Actions</h3>
                            <p className="stat-value">{stats.pendingApprovals}</p>
                        </div>
                    </div>
                )}

                <div className="admin-tabs">
                    <button
                        className={activeTab === 'bookings' ? 'active' : ''}
                        onClick={() => setActiveTab('bookings')}
                    >
                        Bookings
                    </button>
                    <button
                        className={activeTab === 'services' ? 'active' : ''}
                        onClick={() => setActiveTab('services')}
                    >
                        Services
                    </button>
                </div>

                {activeTab === 'bookings' ? (
                    loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
                        displayBookings.length === 0 ? <p>No bookings found.</p> : (
                            <div className="bookings-table-container" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Service</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Vehicle</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayBookings.map((booking) => (
                                            <tr key={booking.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{booking.date}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#999' }}>ID: #{booking.id}</div>
                                                </td>
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
                    )
                ) : (
                    <div className="services-management">
                        <form onSubmit={handleServiceSubmit} className="service-form">
                            <div className="form-group">
                                <label>Service Name</label>
                                <input
                                    type="text"
                                    required
                                    value={serviceForm.name}
                                    onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    value={serviceForm.type}
                                    onChange={e => setServiceForm({ ...serviceForm, type: e.target.value })}
                                >
                                    <option value="Interior">Interior</option>
                                    <option value="Exterior">Exterior</option>
                                    <option value="Full">Full</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Price ($)</label>
                                <input
                                    type="number"
                                    required
                                    value={serviceForm.price}
                                    onChange={e => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="actions">
                                <button type="submit" className="btn-primary">
                                    {isEditing ? 'Update Service' : 'Add Service'}
                                </button>
                                {isEditing && (
                                    <button type="button" className="btn-secondary" onClick={() => {
                                        setIsEditing(null);
                                        setServiceForm({ name: '', type: 'Full', price: 0 });
                                    }}>Cancel</button>
                                )}
                            </div>
                        </form>

                        <div className="bookings-table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Price</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map(s => (
                                        <tr key={s.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                            <td style={{ padding: '1rem' }}>{s.name}</td>
                                            <td style={{ padding: '1rem' }}>{s.type}</td>
                                            <td style={{ padding: '1rem' }}>${s.price.toFixed(2)}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <button
                                                    onClick={() => handleEditService(s)}
                                                    style={{ marginRight: '0.5rem', padding: '0.3rem 0.6rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteService(s.id)}
                                                    style={{ padding: '0.3rem 0.6rem', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: '4px' }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
