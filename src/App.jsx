import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MyBookings from "./pages/MyBookings";
import AdminUsers from "./pages/AdminUsers";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import UserBookingHistory from "./pages/UserBookingHistory";
import CompanyAnalytics from "./pages/CompanyAnalytics";
import LoginActivity from "./pages/LoginActivity";
import ManageSlots from "./pages/ManageSlots";
import Organizations from "./pages/Organizations";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />

        <Route path="/user" element={<ProtectedRoute allowedRole="user"><UserDashboard /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute allowedRole="user"><MyBookings /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><AdminUsers /></ProtectedRoute>} />

        <Route path="/super" element={<Navigate to="/super-admin" replace />} />
        <Route path="/super-admin" element={<ProtectedRoute allowedRole="super_admin"><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/super-admin/organizations" element={<ProtectedRoute allowedRole="super_admin"><Organizations /></ProtectedRoute>} />
        <Route path="/super-admin/user-bookings" element={<ProtectedRoute allowedRole="super_admin"><UserBookingHistory /></ProtectedRoute>} />
        <Route path="/super-admin/company-analytics" element={<ProtectedRoute allowedRole="super_admin"><CompanyAnalytics /></ProtectedRoute>} />
        <Route path="/super-admin/login-activity" element={<ProtectedRoute allowedRole="super_admin"><LoginActivity /></ProtectedRoute>} />
        <Route path="/super-admin/manage-slots" element={<ProtectedRoute allowedRole="super_admin"><ManageSlots /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
