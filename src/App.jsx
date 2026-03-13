import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";

import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MyBookings from "./pages/MyBookings";
import AdminUsers from "./pages/AdminUsers";

// Super Admin Pages
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import UserBookingHistory from "./pages/UserBookingHistory";
import CompanyAnalytics from "./pages/CompanyAnalytics";
import LoginActivity from "./pages/LoginActivity";
import ManageSlots from "./pages/ManageSlots";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />

        {/* User Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRole="user">
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* Super Admin Routes */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowedRole="super_admin">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin/user-bookings"
          element={
            <ProtectedRoute allowedRole="super_admin">
              <UserBookingHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin/company-analytics"
          element={
            <ProtectedRoute allowedRole="super_admin">
              <CompanyAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin/login-activity"
          element={
            <ProtectedRoute allowedRole="super_admin">
              <LoginActivity />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin/manage-slots"
          element={
            <ProtectedRoute allowedRole="super_admin">
              <ManageSlots />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;