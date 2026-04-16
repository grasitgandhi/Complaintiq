// frontend/src/components/shared/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_HOME = {
  customer: '/customer/track',
  agent:    '/agent/queue',
  manager:  '/manager/overview',
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  // Not logged in → /login
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role → redirect to correct home
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={ROLE_HOME[role] || '/login'} replace />;
  }

  return children;
}
