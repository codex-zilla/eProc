import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import SiteDashboard from './pages/SiteDashboard';
import Approvals from './pages/Approvals';
import Procurement from './pages/Procurement';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes (Login) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Role-specific dashboards */}
              <Route path="/site-dashboard" element={<SiteDashboard />} />
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/procurement" element={<Procurement />} />
              
              {/* Default redirect to site-dashboard (will be role-based in ProtectedRoute) */}
              <Route path="/dashboard" element={<Navigate to="/site-dashboard" replace />} />
              <Route path="/" element={<Navigate to="/site-dashboard" replace />} />
            </Route>
          </Route>

          {/* Catch-all redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
