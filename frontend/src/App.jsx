import { Routes, Route } from 'react-router-dom';
import { Suspense, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import {  lazy } from 'react';


// Layouts
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const UserLayout = lazy(() => import('./layouts/UserLayout'));

// Admin Pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AddClient = lazy(() => import('./pages/admin/AddClient'));
const ManageClient = lazy(() => import('./pages/admin/ManageClient'));
const Login = lazy(() => import('./pages/admin/adminlogin'));
const UserForm = lazy(() => import('./pages/user/UserForm'));
import { ProtectedRoute } from './components/admin/protectedroute.jsx';
import LoadingSpinner from './components/loadingspinner.jsx';

function App() {
  const [role, setrole] = useState(null);

  return (
    <main className="">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Suspense wraps around the components that may be lazy-loaded */}
      <Suspense fallback={<LoadingSpinner/>}>
        <Routes>
          {/* Login route */}
          <Route
            path="/"
            element={
              <ProtectedRoute role={role} setrole={setrole}>
                <Login role={role} />
              </ProtectedRoute>
            }
          />

          {/* Admin layout and nested routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role={role} setrole={setrole}>
                <AdminLayout role={role} setrole={setrole} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="add-client" element={<AddClient />} />
            <Route path="manage-client" element={<ManageClient />} />
          </Route>

          {/* User layout and form */}
          <Route path="/user" element={<UserLayout />} />
          <Route path="/user/form/:token" element={<UserForm />} />
        </Routes>
      </Suspense>
    </main>
  );
}

export default App;
