import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Debug log
  console.log('🛡️ ProtectedRoute Debug:', {
    loading,
    user: user ? { name: user.name, role: user.role } : null,
    allowedRoles,
    userInAllowedRoles: user ? allowedRoles.includes(user.role) : false,
    path: location.pathname
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ ProtectedRoute: No user - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is empty, allow all authenticated users
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('❌ ProtectedRoute: Role not allowed - redirecting to login', {
      userRole: user.role,
      allowedRoles
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ ProtectedRoute: Access granted!');
  return children;
};

export default ProtectedRoute;