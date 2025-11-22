import { useEffect, useState, useContext } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function FacultyDashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [feedbacks, setFeedbacks] = useState([])
  const [currentQuote, setCurrentQuote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const currentUser = user?.user || user || {}

  const motivationalQuotes = [
    "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
    "The art of teaching is the art of assisting discovery. - Mark Van Doren",
    "A good teacher can inspire hope, ignite the imagination, and instill a love of learning. - Brad Henry",
    "Teaching is the greatest act of optimism. - Colleen Wilcox",
    "The influence of a great teacher can never be erased.",
    "Education is not the filling of a pail, but the lighting of a fire. - William Butler Yeats",
    "Teachers plant the seeds of knowledge that grow forever.",
    "The best teachers teach from the heart, not from the book."
  ]

  useEffect(() => {
    loadFeedback()
    
    // Set random motivational quote
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    setCurrentQuote(randomQuote)
  }, [currentUser._id])

  const loadFeedback = async () => {
    try {
      setLoading(true)
      setError('')
      
      const res = await api.get(`/feedback/faculty/${currentUser._id}`)
      
      if (res.data.success) {
        setFeedbacks(res.data.feedbacks || [])
      } else {
        setFeedbacks([])
        setError('No feedback data received')
      }
    } catch (err) {
      setError('Failed to load feedback. Please try again later.')
      setFeedbacks([])
    } finally {
      setLoading(false)
    }
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success'
    if (rating >= 3) return 'warning'
    return 'danger'
  }

  const getRatingText = (rating) => {
    if (rating === 5) return 'Excellent'
    if (rating === 4) return 'Good'
    if (rating === 3) return 'Average'
    if (rating === 2) return 'Poor'
    return 'Very Poor'
  }

  const calculateAverageRating = () => {
    if (feedbacks.length === 0) return 0
    const total = feedbacks.reduce((sum, fb) => sum + fb.rating, 0)
    return (total / feedbacks.length).toFixed(1)
  }

  // Navigation functions
  const navigateTo = (path) => {
    navigate(path)
  }

  return (
    <>
      <Navbar />

      {/* Main Content with Beautiful Background Pattern */}
      <div className="container-fluid py-4" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}>
        <div className="container">
          
          {/* Motivational Quote Card */}
          <div className="card border-0 shadow-lg mb-4 overflow-hidden" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="card-body text-center py-4">
              <i className="bi bi-quote display-4 text-primary opacity-25 mb-3 d-block"></i>
              <p className="fs-5 fst-italic text-dark mb-0 px-4">
                "{currentQuote}"
              </p>
            </div>
          </div>

          {/* Profile Section with Modern Design */}
          <div className="card border-0 shadow-lg mb-4 overflow-hidden">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="position-relative">
                    {currentUser.profilePic ? (
                      <>
                        <img
                          src={`http://localhost:5000/${currentUser.profilePic}`}
                          alt="Profile"
                          className="rounded-circle border border-4 border-white shadow"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          onError={(e) => {
                            // Hide broken image and show fallback
                            e.target.style.display = 'none';
                            document.getElementById('facultyFallbackAvatar')?.classList.remove('d-none');
                          }}
                        />
                        {/* Hidden fallback that shows on image error */}
                        <div
                          id="facultyFallbackAvatar"
                          className="rounded-circle bg-gradient-primary d-flex align-items-center justify-content-center text-white border border-4 border-white shadow d-none"
                          style={{ 
                            width: '100px', 
                            height: '100px', 
                            fontSize: '2.5rem',
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        >
                          {currentUser.name?.charAt(0).toUpperCase() || 'F'}
                        </div>
                      </>
                    ) : (
                      /* No profile pic in database */
                      <div
                        className="rounded-circle bg-gradient-primary d-flex align-items-center justify-content-center text-white border border-4 border-white shadow"
                        style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                      >
                        {currentUser.name?.charAt(0).toUpperCase() || 'F'}
                      </div>
                    )}
                    {/* Online Indicator */}
                    <span className="position-absolute bottom-0 end-0 bg-success border border-3 border-white rounded-circle"
                      style={{ width: '20px', height: '20px' }}></span>
                  </div>
                </div>
                <div className="col">
                  <h2 className="fw-bold text-gradient mb-2">Welcome, {currentUser.name}!</h2>
                  <p className="text-muted mb-3">
                    <i className="bi bi-book me-2"></i>
                    <strong>Subjects:</strong> {currentUser.subjects?.join(', ') || 'N/A'}
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                      <i className="bi bi-person-badge me-1"></i>
                      Faculty Member
                    </span>
                    <span className={`badge bg-${getRatingColor(calculateAverageRating())} bg-opacity-10 text-${getRatingColor(calculateAverageRating())} px-3 py-2`}>
                      <i className="bi bi-star me-1"></i>
                      {calculateAverageRating()} Avg Rating ({feedbacks.length} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Quick Actions with Enhanced Icons */}
<div className="row mb-4">
  <div className="col-12">
    <h4 className="text-white mb-3 fw-bold">
      <i className="bi bi-lightning me-2"></i>
      Quick Actions
    </h4>
    <div className="row g-3">
      {/* Create Assignment */}
      <div className="col-md-6 col-lg-3">
        <div 
          className="card border-0 shadow-sm h-100 action-card"
          onClick={() => navigateTo('/create-assignment')}
          style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
        >
          <div className="card-body text-center p-4">
            <div className="icon-wrapper bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '70px', height: '70px' }}>
              <i className="bi bi-file-earmark-plus display-6 text-primary"></i>
            </div>
            <h5 className="fw-bold text-dark mb-2">Create Assignment</h5>
            <p className="text-muted small mb-0">Create new learning materials</p>
            <div className="hover-indicator mt-2">
              <i className="bi bi-arrow-right-circle text-primary"></i>
            </div>
          </div>
        </div>
      </div>
      
      {/* Manage Timetable */}
      <div className="col-md-6 col-lg-3">
        <div 
          className="card border-0 shadow-sm h-100 action-card"
          onClick={() => navigateTo('/faculty-timetable')}
          style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
        >
          <div className="card-body text-center p-4">
            <div className="icon-wrapper bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '70px', height: '70px' }}>
              <i className="bi bi-calendar-range display-6 text-info"></i>
            </div>
            <h5 className="fw-bold text-dark mb-2">Manage Timetable</h5>
            <p className="text-muted small mb-0">Schedule your classes</p>
            <div className="hover-indicator mt-2">
              <i className="bi bi-arrow-right-circle text-info"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Share Content */}
      <div className="col-md-6 col-lg-3">
        <div 
          className="card border-0 shadow-sm h-100 action-card"
          onClick={() => navigateTo('/share-content')}
          style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
        >
          <div className="card-body text-center p-4">
            <div className="icon-wrapper bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '70px', height: '70px' }}>
              <i className="bi bi-share display-6 text-info"></i>
            </div>
            <h5 className="fw-bold text-dark mb-2">Share Content</h5>
            <p className="text-muted small mb-0">Share study materials</p>
            <div className="hover-indicator mt-2">
              <i className="bi bi-arrow-right-circle text-info"></i>
            </div>
          </div>
        </div>
      </div>

      {/* My Content - NEW QUICK ACTION */}
      <div className="col-md-6 col-lg-3">
        <div 
          className="card border-0 shadow-sm h-100 action-card"
          onClick={() => navigateTo('/faculty-content')}
          style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
        >
          <div className="card-body text-center p-4">
            <div className="icon-wrapper bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '70px', height: '70px' }}>
              <i className="bi bi-collection display-6 text-warning"></i>
            </div>
            <h5 className="fw-bold text-dark mb-2">My Content</h5>
            <p className="text-muted small mb-0">View shared materials</p>
            <div className="hover-indicator mt-2">
              <i className="bi bi-arrow-right-circle text-warning"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Take Attendance */}
      <div className="col-md-6 col-lg-3">
        <div 
          className="card border-0 shadow-sm h-100 action-card"
          onClick={() => navigateTo('/faculty-attendance')}
          style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
        >
          <div className="card-body text-center p-4">
            <div className="icon-wrapper bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '70px', height: '70px' }}>
              <i className="bi bi-clipboard2-check display-6 text-success"></i>
            </div>
            <h5 className="fw-bold text-dark mb-2">Take Attendance</h5>
            <p className="text-muted small mb-0">Mark student attendance</p>
            <div className="hover-indicator mt-2">
              <i className="bi bi-arrow-right-circle text-success"></i>
            </div>
          </div>
        </div>
      </div>
 
      {/* Attendance Reports */}
      <div className="col-md-6 col-lg-3">
        <div 
          className="card border-0 shadow-sm h-100 action-card"
          onClick={() => navigateTo('/attendance-reports')}
          style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
        >
          <div className="card-body text-center p-4">
            <div className="icon-wrapper bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '70px', height: '70px' }}>
              <i className="bi bi-bar-chart-line display-6 text-warning"></i>
            </div>
            <h5 className="fw-bold text-dark mb-2">Attendance Reports</h5>
            <p className="text-muted small mb-0">View class attendance analytics</p>
            <div className="hover-indicator mt-2">
              <i className="bi bi-arrow-right-circle text-warning"></i>
            </div>
          </div>
        </div>
      </div>

      {/* My Assignments */}
      <div className="col-md-6 col-lg-3">
        <div 
          className="card border-0 shadow-sm h-100 action-card"
          onClick={() => navigateTo('/my-assignments')}
          style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
        >
          <div className="card-body text-center p-4">
            <div className="icon-wrapper bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '70px', height: '70px' }}>
              {/* Changed icon color to text-secondary */}
              <i className="bi bi-journal-text display-6 text-secondary"></i>
            </div>
            <h5 className="fw-bold text-dark mb-2">My Assignments</h5>
            <p className="text-muted small mb-0">Manage your assignments</p>
            <div className="hover-indicator mt-2">
              <i className="bi bi-arrow-right-circle text-secondary"></i>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</div>
          {/* Feedback Section with Enhanced Design */}
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-white border-0 py-4">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="fw-bold text-gradient mb-0">
                  <i className="bi bi-chat-heart me-2"></i>
                  Student Feedback & Reviews
                </h4>
                <div className="d-flex align-items-center">
                  <button 
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={loadFeedback}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                  </button>
                  <span className="badge bg-primary me-3">
                    {feedbacks.length} Total Reviews
                  </span>
                  <span className={`badge bg-${getRatingColor(calculateAverageRating())}`}>
                    {calculateAverageRating()} Average Rating
                  </span>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              {error && (
                <div className="alert alert-danger m-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading feedback...</p>
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-5">
                  <div className="icon-placeholder bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 mx-auto"
                    style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-chat-text display-5 text-muted"></i>
                  </div>
                  <h5 className="text-muted mb-2">No feedback yet</h5>
                  <p className="text-muted mb-3">Student reviews will appear here once submitted</p>
                  <button 
                    className="btn btn-primary"
                    onClick={loadFeedback}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Check Again
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <tr>
                        <th className="text-white border-0 ps-4">Student</th>
                        <th className="text-white border-0">Subject</th>
                        <th className="text-white border-0">Rating</th>
                        <th className="text-white border-0">Date</th>
                        <th className="text-white border-0 pe-4">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbacks.map((fb) => (
                        <tr key={fb._id} className="feedback-row">
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <div className={`student-avatar bg-${fb.isAnonymous ? 'secondary' : 'primary'} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3`}
                                style={{ width: '40px', height: '40px' }}>
                                <i className={`bi bi-person text-${fb.isAnonymous ? 'secondary' : 'primary'}`}></i>
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">
                                  {fb.isAnonymous ? 'Anonymous Student' : (fb.studentName || fb.studentId?.name || 'Student')}
                                </h6>
                                <small className="text-muted">
                                  {fb.isAnonymous ? 'Anonymous' : 'Student'}
                                  {fb.studentId?.className && ` • ${fb.studentId.className}`}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2">
                              {fb.subject}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="star-rating me-2">
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`bi ${
                                      i < fb.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'
                                    }`}
                                  ></i>
                                ))}
                              </div>
                              <div>
                                <span className="fw-bold text-dark">({fb.rating}/5)</span>
                                <br />
                                <small className={`text-${getRatingColor(fb.rating)}`}>
                                  {getRatingText(fb.rating)}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(fb.createdAt).toLocaleDateString()}
                            </small>
                          </td>
                          <td className="pe-4">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-chat-left-text text-info me-2"></i>
                              <span className="text-muted">
                                {fb.comments || 'No comments provided'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Statistics */}
          {feedbacks.length > 0 && (
            <div className="row mt-4">
              <div className="col-12">
                <div className="card border-0 shadow-lg">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <i className="bi bi-graph-up me-2"></i>
                      Feedback Statistics
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-md-3 mb-3">
                        <div className="display-6 fw-bold text-primary">{feedbacks.length}</div>
                        <small className="text-muted">Total Reviews</small>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className={`display-6 fw-bold text-${getRatingColor(calculateAverageRating())}`}>
                          {calculateAverageRating()}
                        </div>
                        <small className="text-muted">Average Rating</small>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="display-6 fw-bold text-success">
                          {feedbacks.filter(fb => fb.rating >= 4).length}
                        </div>
                        <small className="text-muted">Positive Reviews (4+ stars)</small>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="display-6 fw-bold text-warning">
                          {feedbacks.filter(fb => fb.rating <= 2).length}
                        </div>
                        <small className="text-muted">Needs Improvement (2 stars or less)</small>
                      </div>
                    </div>
                    
                    {/* Rating Distribution */}
                    <div className="mt-4">
                      <h6 className="fw-bold mb-3">Rating Distribution</h6>
                      {[5, 4, 3, 2, 1].map(rating => {
                        const count = feedbacks.filter(fb => fb.rating === rating).length
                        const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0
                        
                        return (
                          <div key={rating} className="row align-items-center mb-2">
                            <div className="col-1">
                              <span className="fw-bold">{rating} ★</span>
                            </div>
                            <div className="col-8">
                              <div className="progress" style={{ height: '20px' }}>
                                <div 
                                  className={`progress-bar bg-${getRatingColor(rating)}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="col-3">
                              <small className="text-muted">
                                {count} ({percentage.toFixed(1)}%)
                              </small>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .action-card {
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .action-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.15) !important;
        }
        
        .action-card:hover .icon-wrapper {
          transform: scale(1.1);
        }
        
        .hover-indicator {
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }
        
        .action-card:hover .hover-indicator {
          opacity: 1;
          transform: translateX(0);
        }
        
        .icon-wrapper {
          transition: all 0.3s ease;
        }
        
        .feedback-row {
          transition: all 0.3s ease;
        }
        
        .feedback-row:hover {
          background-color: rgba(102, 126, 234, 0.05) !important;
          transform: translateX(2px);
        }
        
        .star-rating {
          font-size: 0.9rem;
        }
        
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        }
        
        /* Custom colors for Bootstrap icons */
        .text-purple {
          color: #6f42c1 !important;
        }
        
        .text-teal {
          color: #20c997 !important;
        }
        
        .text-indigo {
          color: #6610f2 !important;
        }
        
        .text-orange {
          color: #fd7e14 !important;
        }
        
        .bg-purple {
          background-color: #6f42c1 !important;
        }
        
        .bg-teal {
          background-color: #20c997 !important;
        }
        
        .bg-indigo {
          background-color: #6610f2 !important;
        }
        
        .bg-orange {
          background-color: #fd7e14 !important;
        }
      `}</style>
    </>
  )
}