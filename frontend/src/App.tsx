import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';

import Booking from './pages/Booking';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="booking" element={<Booking />} />
        <Route path="login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
