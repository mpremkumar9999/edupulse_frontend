import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Enhanced DashboardCard component with better styling
const DashboardCard = ({ icon, title, description, path, colorClass, navigate }) => {
  const handleClick = () => {
    navigate(path);
  };

  return (
    <div className="col-12 col-sm-6 col-xl-4 mb-4">
      <div 
        className="card h-100 shadow-hover border-0 overflow-hidden position-relative dashboard-card"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
      >
        {/* Gradient background overlay based on color */}
        <div className={`card-gradient-overlay bg-gradient-${colorClass}`}></div>
        
        <div className="card-body d-flex flex-column justify-content-center align-items-center position-relative z-2 p-4">
          {/* Icon with background */}
          <div className={`icon-container bg-${colorClass} bg-opacity-10 rounded-circle p-3 mb-3`}>
            <i className={`bi ${icon} display-5 text-${colorClass}`}></i>
          </div>
          
          <h5 className="card-title fw-bold text-dark mb-2 text-center">{title}</h5>
          {description && (
            <p className="card-text text-muted text-center small mb-0">{description}</p>
          )}
          
          {/* Hover arrow indicator */}
          <div className="hover-arrow mt-3">
            <i className={`bi bi-arrow-right-short text-${colorClass} fs-4`}></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const currentUser = user || {};

  const quickActions = [
    { 
      icon: 'bi-chat-left-text', 
      title: 'Give Feedback', 
      description: 'Share your thoughts with faculty',
      path: '/feedback', 
      colorClass: 'primary' 
    },
    { 
      icon: 'bi-calendar-event', 
      title: 'View Timetable', 
      description: 'Check your class schedule',
      path: '/student-timetable', 
      colorClass: 'success' 
    },
    { 
      icon: 'bi-clipboard-data', 
      title: 'View Attendance', 
      description: 'Check your attendance records',
      path: '/student-attendance', 
      colorClass: 'info' 
    },
    { 
      icon: 'bi-journal-check', 
      title: 'View Assignments', 
      description: 'See all your assignments',
      path: '/assignments', 
      colorClass: 'warning' 
    },
    // Add this to the quick actions in StudentDashboard.jsx
  { 
  icon: 'bi-collection', 
  title: 'Study Materials', 
  description: 'Access shared learning resources',
  path: '/student-content', 
  colorClass: 'info' 
  },
   
    { 
      icon: 'bi-award', 
      title: 'Rewards', 
      description: 'View your achievements',
      path: '/rewards', 
      colorClass: 'secondary' 
    }
  ];

  return (
    <>
      <Navbar />
      
      {/* Main Content */}
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="container">
          
          {/* ======================= Enhanced Profile Card ======================= */}
          <div className="card border-0 shadow-lg mb-5 profile-card-glow overflow-hidden">
            <div className="card-body p-4 p-md-5">
              <div className="row align-items-center">
                {/* Profile Picture Section */}
                <div className="col-md-auto text-center mb-3 mb-md-0">
                  <div className="position-relative d-inline-block">
                    {currentUser.profilePic ? (
                      <>
                        <img
                          src={`http://localhost:5000/${currentUser.profilePic}`}
                          alt="Profile"
                          className="rounded-circle border border-4 border-white shadow"
                          style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                          onError={(e) => {
                            // Hide broken image and show fallback
                            e.target.style.display = 'none';
                            document.getElementById('fallbackAvatar')?.classList.remove('d-none');
                          }}
                        />
                        {/* Hidden fallback that shows on image error */}
                        <div
                          id="fallbackAvatar"
                          className="rounded-circle bg-gradient-primary d-flex align-items-center justify-content-center text-white border border-4 border-white shadow d-none"
                          style={{ 
                            width: '120px', 
                            height: '120px', 
                            fontSize: '3rem',
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        >
                          {currentUser.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                      </>
                    ) : (
                      /* No profile pic in database */
                      <div
                        className="rounded-circle bg-gradient-primary d-flex align-items-center justify-content-center text-white border border-4 border-white shadow"
                        style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                      >
                        {currentUser.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                    )}
                    {/* Online Status Indicator */}
                    <span className="position-absolute bottom-0 end-0 p-2 bg-success border border-3 border-white rounded-circle shadow-sm"></span>
                  </div>
                </div>

                {/* Profile Info Section */}
                <div className="col-md">
                  <div className="d-flex flex-column">
                    <h1 className="display-6 fw-bold text-gradient-primary mb-2">
                      Welcome back, {currentUser.name || 'Student'}!
                    </h1>
                    <p className="text-muted fs-5 mb-3">
                      <i className="bi bi-book me-2"></i>
                      Class: <span className="fw-semibold text-dark">{currentUser.className || 'Not assigned'}</span>
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-2">
                        <i className="bi bi-person me-1"></i>
                        Student
                      </span>
                      <span className="badge bg-success bg-opacity-10 text-success fs-6 px-3 py-2">
                        <i className="bi bi-clock me-1"></i>
                        Last login: Today
                      </span>
                      <span className="badge bg-info bg-opacity-10 text-info fs-6 px-3 py-2">
                        <i className="bi bi-mortarboard me-1"></i>
                        {currentUser.className || 'No Class'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ======================= Quick Actions Grid ======================= */}
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-gradient-primary mb-0">Quick Actions</h3>
                <span className="badge bg-primary fs-6 px-3 py-2">
                  {quickActions.length} Options
                </span>
              </div>
              
              <div className="row g-4">
                {quickActions.map((action, index) => (
                  <DashboardCard 
                    key={index}
                    icon={action.icon}
                    title={action.title}
                    description={action.description}
                    path={action.path}
                    colorClass={action.colorClass}
                    navigate={navigate}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="card border-0 shadow-lg">
                <div className="card-header bg-white border-0 py-4">
                  <h4 className="fw-bold text-gradient-primary mb-0">
                    <i className="bi bi-activity me-2"></i>
                    Quick Access
                  </h4>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-3 mb-3">
                      <div className="p-3 rounded-3 bg-primary bg-opacity-10">
                        <i className="bi bi-chat-left-text display-6 text-primary mb-2 d-block"></i>
                        <h5 className="fw-bold">Feedback</h5>
                        <p className="text-muted small mb-2">Share your experience</p>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate('/feedback')}
                        >
                          Give Feedback
                        </button>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="p-3 rounded-3 bg-success bg-opacity-10">
                        <i className="bi bi-calendar-week display-6 text-success mb-2 d-block"></i>
                        <h5 className="fw-bold">Timetable</h5>
                        <p className="text-muted small mb-2">View your schedule</p>
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => navigate('/student-timetable')}
                        >
                          View Schedule
                        </button>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="p-3 rounded-3 bg-info bg-opacity-10">
                        <i className="bi bi-clipboard-data display-6 text-info mb-2 d-block"></i>
                        <h5 className="fw-bold">Attendance</h5>
                        <p className="text-muted small mb-2">Check your records</p>
                        <button 
                          className="btn btn-info btn-sm"
                          onClick={() => navigate('/student-attendance')}
                        >
                          View Attendance
                        </button>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="p-3 rounded-3 bg-warning bg-opacity-10">
                        <i className="bi bi-journal-check display-6 text-warning mb-2 d-block"></i>
                        <h5 className="fw-bold">Assignments</h5>
                        <p className="text-muted small mb-2">Manage your work</p>
                        <button 
                          className="btn btn-warning btn-sm"
                          onClick={() => navigate('/assignments')}
                        >
                          View Assignments
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Add custom CSS for enhanced styling */}
      <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        }
        
        .text-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .dashboard-card {
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
        }
        
        .card-gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .dashboard-card:hover .card-gradient-overlay {
          opacity: 1;
        }
        
        .icon-container {
          transition: all 0.3s ease;
        }
        
        .dashboard-card:hover .icon-container {
          transform: scale(1.1);
        }
        
        .hover-arrow {
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }
        
        .dashboard-card:hover .hover-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        
        .profile-card-glow {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-left: 4px solid #667eea;
        }
      `}</style>
    </>
  );
}