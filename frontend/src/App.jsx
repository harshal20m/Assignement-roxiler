import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminStores from './components/AdminStores';
import UserStores from './components/UserStores';
import OwnerDashboard from './components/OwnerDashboard';
import ChangePassword from './components/ChangePassword';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stores"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/password"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/user/stores"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserStores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/password"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['store_owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/password"
            element={
              <ProtectedRoute allowedRoles={['store_owner']}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;