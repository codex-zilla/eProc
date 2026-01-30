import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Shared pages
import Profile from './pages/shared/Profile';
import NotFound from './pages/shared/NotFound';
import NotAuthorized from './pages/shared/NotAuthorized';

// Engineer pages
import EngineerDashboard from './pages/engineer/EngineerDashboard';
import AssignedProject from './pages/engineer/AssignedProject';
import MyRequests from './pages/engineer/MyRequests';
import CreateRequest from './pages/engineer/CreateRequest';
import RequestDetails from './pages/engineer/RequestDetails';

// Manager pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import MyProjects from './pages/manager/MyProjects';
import ProjectWizard from './components/ProjectWizard';
import ProjectDetails from './pages/manager/ProjectDetails';
import PendingRequests from './pages/manager/PendingRequests';
import RequestDetailsManager from './pages/manager/RequestDetailsManager';

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
              {/* Shared */}
              <Route path="/profile" element={<Profile />} />

              {/* Engineer Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ENGINEER']} />}>
                <Route path="/engineer/dashboard" element={<EngineerDashboard />} />
                <Route path="/engineer/project" element={<AssignedProject />} />
                <Route path="/engineer/requests" element={<MyRequests />} />
                <Route path="/engineer/requests/new" element={<CreateRequest />} />
                <Route path="/engineer/requests/:id" element={<RequestDetails />} />
                <Route path="/engineer/requests/:id/edit" element={<CreateRequest />} />
              </Route>

              {/* Manager Routes (Project Owner) */}
              <Route element={<ProtectedRoute allowedRoles={['PROJECT_OWNER']} />}>
                <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                <Route path="/manager/projects" element={<MyProjects />} />
                <Route path="/manager/projects/new" element={<ProjectWizard />} />
                <Route path="/manager/projects/:id" element={<ProjectDetails />} />
                <Route path="/manager/pending" element={<PendingRequests />} />
                <Route path="/manager/requests/:id" element={<RequestDetailsManager />} />
              </Route>

              {/* Legacy routes redirect */}
              <Route path="/site-dashboard" element={<Navigate to="/engineer/dashboard" replace />} />
              <Route path="/approvals" element={<Navigate to="/manager/pending" replace />} />
              <Route path="/projects" element={<Navigate to="/manager/projects" replace />} />

              {/* Default redirect based on role (ProtectedRoute handles this) */}
              <Route path="/dashboard" element={<Navigate to="/engineer/dashboard" replace />} />
              <Route path="/" element={<Navigate to="/engineer/dashboard" replace />} />
            </Route>
          </Route>

          {/* Error pages */}
          <Route path="/403" element={<NotAuthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
