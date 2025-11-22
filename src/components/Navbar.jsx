import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const isFaculty = user && user.role === 'Faculty';
  const isStudent = user && user.role === 'Student';
  const isAdmin = user && user.role === 'Admin';

  // Determine the dashboard route based on user role
  const getDashboardRoute = () => {
    if (isStudent) return "/student";
    if (isFaculty) return "/faculty";
    if (isAdmin) return "/admin";
    return "/"; // Default route for non-authenticated users
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-gradient-primary shadow">
      <div className="container">
        {/* Brand - FIXED: Single brand link that goes to appropriate dashboard */}
        <Link 
          className="navbar-brand d-flex align-items-center fw-bold fs-3" 
          to={getDashboardRoute()}
        >
          <div className="bg-white rounded-circle p-2 me-3">
            <i className="bi bi-mortarboard-fill text-primary fs-4"></i>
          </div>
          <span className="text-white">RK Valley</span>
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Navigation Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Student-only links */}
            {isStudent && (
              <>
                <li className="nav-item mx-1">
                  <Link className="nav-link d-flex align-items-center py-3 px-3 rounded" to="/student">
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item mx-1">
                  <Link className="nav-link d-flex align-items-center py-3 px-3 rounded" to="/assignments">
                    <i className="bi bi-journal-text me-2"></i>
                    Assignments
                  </Link>
                </li>
                <li className="nav-item mx-1">
                  <Link className="nav-link d-flex align-items-center py-3 px-3 rounded" to="/student-attendance">
                    <i className="bi bi-clipboard-check me-2"></i>
                    Attendance
                  </Link>
                </li>
              </>
            )}

            {/* Faculty-only links */}
            {isFaculty && (
              <>
                <li className="nav-item mx-1">
                  <Link className="nav-link d-flex align-items-center py-3 px-3 rounded" to="/faculty">
                    <i className="bi bi-person-badge me-2"></i>
                    Faculty Portal
                  </Link>
                </li>
                <li className="nav-item mx-1">
                  <Link className="nav-link d-flex align-items-center py-3 px-3 rounded" to="/create-assignment">
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Assignment
                  </Link>
                </li>
                <li className="nav-item mx-1">
                  <Link className="nav-link d-flex align-items-center py-3 px-3 rounded" to="/faculty-attendance">
                    <i className="bi bi-clipboard-data me-2"></i>
                    Attendance
                  </Link>
                </li>
              </>
            )}

            {/* Admin-only links */}
            {isAdmin && (
              <>
                <li className="nav-item mx-1">
                  <Link className="nav-link d-flex align-items-center py-3 px-3 rounded" to="/admin">
                    <i className="bi bi-shield-check me-2"></i>
                    Admin Panel
                  </Link>
                </li>
                <li className="nav-item mx-1">
                  <Link className="nav-link d-flex align-items-center py-3 px-3 rounded" to="/reports">
                    <i className="bi bi-graph-up me-2"></i>
                    Reports
                  </Link>
                </li>
              </>
            )}

            {/* Common links for all authenticated users */}
            {(isStudent || isFaculty || isAdmin) && (
              <li className="nav-item mx-1">
                <Link className="nav-link d-flex align-items-center py-3 px-3 rounded" to="/chat">
                  <i className="bi bi-chat-dots me-2"></i>
                  Chat
                </Link>
              </li>
            )}
          </ul>

          {/* User Info Section */}
          {user ? (
            <div className="d-flex align-items-center">
              <div className="d-flex align-items-center bg-white bg-opacity-10 rounded-pill px-3 py-2 me-3">
                <div className="bg-white bg-opacity-20 rounded-circle p-1 me-2">
                  <i className="bi bi-person-fill text-white"></i>
                </div>
                <span className="text-white fw-medium">
                  {user.name || user.username || 'User'}
                </span>
                <span className="badge bg-light text-primary ms-2 text-uppercase">
                  {user.role}
                </span>
              </div>
              
              <button 
                onClick={logout} 
                className="btn btn-light btn-sm rounded-pill px-3 d-flex align-items-center"
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <span className="navbar-text text-white-50 me-3 d-none d-md-block">
                <i className="bi bi-info-circle me-1"></i>
                Welcome to RK Valley
              </span>
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm rounded-pill px-3">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </Link>
                <Link to="/register" className="btn btn-light btn-sm rounded-pill px-3">
                  <i className="bi bi-person-plus me-2"></i>
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        }
        .nav-link {
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }
        .navbar-brand {
          transition: transform 0.3s ease;
        }
        .navbar-brand:hover {
          transform: scale(1.05);
        }
        .btn {
          transition: all 0.3s ease;
        }
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;