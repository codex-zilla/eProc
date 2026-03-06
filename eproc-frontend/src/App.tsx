import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Shared pages
import Profile from './pages/shared/Profile';
import NotFound from './pages/shared/NotFound';
import NotAuthorized from './pages/shared/NotAuthorized';
import ProjectDetails from './pages/shared/ProjectDetails';

// Engineer pages
import EngineerDashboard from './pages/engineer/EngineerDashboard';
import AssignedProject from './pages/engineer/AssignedProject';
import RequestDetails from './pages/engineer/RequestDetails'; // Renamed from BatchDetails
import CreateRequest from './pages/engineer/CreateRequest';
import Requests from './pages/engineer/Requests';
import Deliveries from './pages/engineer/Deliveries';

// Manager pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import Projects from './pages/manager/Projects'; // Renamed from MyProjects
import ProjectWizard from './components/ProjectWizard';
import ManagerRequests from './pages/manager/Requests';
import RequestDetailsManager from './pages/manager/RequestDetailsManager';
import ManageProjectUsers from './pages/manager/ManageProjectUsers';
import ChangePasswordModal from './components/ChangePasswordModal';
import EditProject from './pages/manager/EditProject';
import ManageSites from './pages/manager/ManageSites';
import ProcurementDashboard from './pages/manager/ProcurementDashboard';
import PurchaseOrderForm from './pages/accountant/PurchaseOrderForm';
import DeliveryRegistration from './pages/engineer/DeliveryRegistration';
import ManagerDeliveries from './pages/manager/Deliveries'; // Renamed from ManagerDeliveries

// Accountant pages
import AccountantDashboard from './pages/accountant/AccountantDashboard';
import ApprovedRequests from './pages/accountant/ApprovedRequests';
import PurchaseOrders from './pages/accountant/PurchaseOrders';
import PurchaseOrderDetails from './pages/accountant/PurchaseOrderDetails';
import AccountantReports from './pages/accountant/AccountantReports';

function App() {
  return (
    <AuthProvider>
      <ChangePasswordModal />
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          {/* Public Routes (Login) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
                <Route path="/engineer/projects/:id" element={<ProjectDetails />} />
                <Route path="/engineer/requests" element={<Requests />} />
                <Route path="/engineer/requests/:id" element={<RequestDetails />} />
                <Route path="/engineer/create-batch" element={<CreateRequest />} />
                <Route path="/engineer/deliveries" element={<Deliveries />} />
                <Route path="/engineer/deliveries/:poId" element={<DeliveryRegistration />} />
              </Route>

              {/* Manager Routes (Project Owner) */}
              <Route element={<ProtectedRoute allowedRoles={['OWNER', 'MANAGER']} />}>
                <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                <Route path="/manager/projects" element={<Projects />} />
                <Route path="/manager/projects/new" element={<ProjectWizard />} />
                <Route path="/manager/projects/:id" element={<ProjectDetails />} />
                <Route path="/manager/projects/:id/edit" element={<EditProject />} />
                <Route path="/manager/projects/:id/sites" element={<ManageSites />} />
                <Route path="/manager/users" element={<ManageProjectUsers />} />
                <Route path="/manager/requests" element={<ManagerRequests />} />
                <Route path="/manager/requests/:id" element={<RequestDetailsManager />} />
                <Route path="/manager/procurement" element={<ProcurementDashboard />} />
                <Route path="/manager/procurement/create" element={<PurchaseOrderForm />} />
                <Route path="/manager/procurement/purchase-orders/:id" element={<PurchaseOrderDetails />} />
                <Route path="/manager/procurement/purchase-orders/:id/edit" element={<PurchaseOrderForm />} />
                <Route path="/manager/deliveries" element={<ManagerDeliveries />} />
                <Route path="/manager/deliveries/:poId" element={<DeliveryRegistration />} />
              </Route>

              {/* Accountant Routes (ACCOUNTANT) */}
              <Route element={<ProtectedRoute allowedRoles={['ACCOUNTANT']} />}>
                <Route path="/accountant/dashboard" element={<AccountantDashboard />} />
                <Route path="/accountant/projects/:id" element={<ProjectDetails />} />

                {/* Procurement Section */}
                <Route path="/accountant/procurement" element={<Navigate to="/accountant/procurement/approved-requests" replace />} />
                <Route path="/accountant/procurement/approved-requests" element={<ApprovedRequests />} />
                <Route path="/accountant/procurement/create" element={<PurchaseOrderForm />} />
                <Route path="/accountant/procurement/purchase-orders" element={<PurchaseOrders />} />
                <Route path="/accountant/procurement/purchase-orders/:id" element={<PurchaseOrderDetails />} />
                <Route path="/accountant/procurement/purchase-orders/:id/edit" element={<PurchaseOrderForm />} />

                {/* Legacy Redirects */}
                <Route path="/accountant/purchase-orders" element={<Navigate to="/accountant/procurement/purchase-orders" replace />} />
                <Route path="/accountant/purchase-orders/:id" element={<Navigate to="/accountant/procurement/purchase-orders/:id" replace />} />

                <Route path="/accountant/deliveries" element={<ManagerDeliveries />} />
                <Route path="/accountant/deliveries/:poId" element={<DeliveryRegistration />} />
                <Route path="/accountant/reports" element={<AccountantReports />} />
              </Route>

              {/* Legacy routes redirect */}
              <Route path="/site-dashboard" element={<Navigate to="/engineer/dashboard" replace />} />
              <Route path="/approvals" element={<Navigate to="/manager/requests" replace />} />
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
