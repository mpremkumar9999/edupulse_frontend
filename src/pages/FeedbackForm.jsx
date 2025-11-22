import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function FeedbackForm() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [faculties, setFaculties] = useState([])
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [subject, setSubject] = useState('')
  const [rating, setRating] = useState(5)
  const [comments, setComments] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [apiError, setApiError] = useState(false)

  const currentUser = user?.user || user || {}

  useEffect(() => {
    if (!user?.token) {
      const localToken = localStorage.getItem('token')
      if (!localToken) {
        navigate('/login')
        return
      }
    }

    setAuthChecked(true)
    fetchFaculties()
  }, [user, navigate, currentUser._id])

  const fetchFaculties = async () => {
    try {
      setLoading(true)
      const token = user?.token || localStorage.getItem('token')
      
      const res = await api.get('/users/faculties/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setFaculties(res.data.faculties || [])
      setApiError(false)
      
    } catch (err) {
      console.error('❌ Error fetching faculties:', err)
      setApiError(true)
      
      // Fallback data for development
      const fallbackFaculties = [
        {
          _id: '1',
          name: 'Dr. Smith',
          subjects: ['Mathematics', 'Physics'],
          profilePic: null
        },
        {
          _id: '2', 
          name: 'Prof. Johnson',
          subjects: ['Computer Science', 'Programming'],
          profilePic: null
        }
      ]
      
      setFaculties(fallbackFaculties)
      
      if (err.response?.status === 401) {
        setMessage('❌ Your session has expired. Please login again.')
        setTimeout(() => {
          logout()
          navigate('/login')
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedFaculty || !subject.trim() || !comments.trim()) {
      setMessage('❌ Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const token = user?.token || localStorage.getItem('token')
      
      await api.post('/feedback/submit', {
        facultyId: selectedFaculty,
        subject: subject.trim(),
        rating,
        comments: comments.trim(),
        isAnonymous
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setMessage('✅ Feedback submitted successfully!')
      
      // Reset form
      setSelectedFaculty('')
      setSubject('')
      setRating(5)
      setComments('')
      setIsAnonymous(false)

      setTimeout(() => {
        navigate('/student')
      }, 2000)

    } catch (err) {
      console.error('❌ Error submitting feedback:', err)
      if (err.response?.status === 401) {
        setMessage('❌ Your session has expired. Please login again.')
        setTimeout(() => {
          logout()
          navigate('/login')
        }, 2000)
      } else if (err.response?.data?.message) {
        setMessage(`❌ ${err.response.data.message}`)
      } else {
        setMessage('❌ Error submitting feedback. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getFacultySubjects = () => {
    const faculty = faculties.find(f => f._id === selectedFaculty)
    return faculty?.subjects || []
  }

  if (!authChecked) {
    return (
      <>
        <Navbar />
        <div className="container-fluid py-4 bg-light min-vh-100">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-lg-8">
                <div className="card border-0 shadow-lg">
                  <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Checking authentication...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              
              {apiError && (
                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Note:</strong> Using demo data. Faculty list may not be complete.
                  <button type="button" className="btn-close" onClick={() => setApiError(false)}></button>
                </div>
              )}

              {/* Header Card */}
              <div className="card border-0 shadow-lg mb-4">
                <div className="card-header bg-primary text-white py-4">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-chat-heart display-5 me-3"></i>
                    <div>
                      <h2 className="mb-1 fw-bold">Submit Feedback</h2>
                      <p className="mb-0 opacity-90">Share your thoughts with faculty</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Form */}
              <div className="card border-0 shadow-lg">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    
                    {/* Faculty Selection */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">Select Faculty *</label>
                      <select 
                        className="form-select"
                        value={selectedFaculty}
                        onChange={(e) => setSelectedFaculty(e.target.value)}
                        required
                        disabled={loading}
                      >
                        <option value="">Choose a faculty member</option>
                        {faculties.map(faculty => (
                          <option key={faculty._id} value={faculty._id}>
                            {faculty.name} - {faculty.subjects?.join(', ')}
                          </option>
                        ))}
                      </select>
                      {apiError && (
                        <small className="text-warning">
                          <i className="bi bi-info-circle me-1"></i>
                          Demo data - real faculty list unavailable
                        </small>
                      )}
                    </div>

                    {/* Subject Input */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">Subject Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter the subject name (e.g., Mathematics, Computer Science, etc.)"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        maxLength="100"
                        disabled={loading}
                      />
                      <small className="text-muted">
                        Enter the specific subject you're providing feedback for
                      </small>
                    </div>

                    {/* Rating Selection */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">Rate your experience *</label>
                      <div className="rating-radio-container">
                        <div className="rating-options">
                          {[
                            { value: 1, label: 'Poor', icon: 'bi-emoji-angry', color: 'danger', desc: 'Not satisfied' },
                            { value: 2, label: 'Fair', icon: 'bi-emoji-frown', color: 'warning', desc: 'Needs improvement' },
                            { value: 3, label: 'Good', icon: 'bi-emoji-neutral', color: 'info', desc: 'It was okay' },
                            { value: 4, label: 'Very Good', icon: 'bi-emoji-smile', color: 'primary', desc: 'Liked it' },
                            { value: 5, label: 'Excellent', icon: 'bi-emoji-laughing', color: 'success', desc: 'Loved it!' }
                          ].map((option) => (
                            <div key={option.value} className="rating-option">
                              <input
                                type="radio"
                                id={`rating-${option.value}`}
                                name="rating"
                                value={option.value}
                                checked={rating === option.value}
                                onChange={() => setRating(option.value)}
                                className="rating-radio"
                                disabled={loading}
                              />
                              <label 
                                htmlFor={`rating-${option.value}`}
                                className={`rating-label ${rating === option.value ? 'active' : ''}`}
                              >
                                <div className="rating-icon">
                                  <i className={`bi ${option.icon} text-${option.color}`}></i>
                                </div>
                                <div className="rating-text">
                                  <div className="rating-value">{option.value}/5</div>
                                  <div className="rating-desc">{option.label}</div>
                                  <small className="rating-subdesc">{option.desc}</small>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>

                        {/* Selection Summary */}
                        <div className="selection-summary mt-3 text-center">
                          <div className={`badge fs-6 px-3 py-2 bg-light text-dark border`}>
                            <strong>Selected: </strong>
                            {rating === 5 ? 'Excellent (5/5) - Outstanding!' : 
                             rating === 4 ? 'Very Good (4/5) - Great job!' : 
                             rating === 3 ? 'Good (3/5) - Satisfactory' : 
                             rating === 2 ? 'Fair (2/5) - Needs work' : 
                             'Poor (1/5) - Not good enough'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">Comments *</label>
                      <textarea
                        className="form-control"
                        rows="5"
                        placeholder="Share your feedback, suggestions, or concerns..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        required
                        maxLength="1000"
                        disabled={loading}
                      ></textarea>
                      <small className="text-muted">
                        {comments.length}/1000 characters
                      </small>
                    </div>

                    {/* Anonymous Option */}
                    <div className="mb-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          id="anonymousCheck"
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="anonymousCheck">
                          Submit anonymously
                        </label>
                      </div>
                      <small className="text-muted">
                        Your name will not be shown to the faculty
                      </small>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-3">
                      <button 
                        type="button"
                        className="btn btn-outline-secondary flex-fill"
                        onClick={() => navigate('/student')}
                        disabled={loading}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Dashboard
                      </button>
                      
                      <button 
                        type="submit" 
                        className="btn btn-primary flex-fill"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Submit Feedback
                          </>
                        )}
                      </button>
                    </div>

                    {/* Message */}
                    {message && (
                      <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} mt-3`}>
                        {message}
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Guidelines */}
              <div className="card border-0 shadow-sm mt-4">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-lightbulb text-warning me-2"></i>
                    Feedback Guidelines
                  </h6>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Be constructive and specific in your feedback
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Focus on teaching methods and course content
                    </li>
                    <li className="mb-0">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Your feedback helps improve the learning experience
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        .rating-radio-container {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
        }
        
        .rating-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
        }
        
        .rating-option {
          position: relative;
        }
        
        .rating-radio {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .rating-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px 10px;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }
        
        .rating-label:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .rating-label.active {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
        }
        
        .rating-label.active .rating-icon,
        .rating-label.active .rating-text {
          color: white !important;
        }
        
        .rating-icon {
          font-size: 2rem;
          margin-bottom: 8px;
        }
        
        .rating-value {
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .rating-desc {
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .rating-subdesc {
          opacity: 0.8;
        }
        
        .selection-summary {
          padding-top: 15px;
          border-top: 1px solid #dee2e6;
        }
        
        @media (max-width: 768px) {
          .rating-options {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (max-width: 576px) {
          .rating-options {
            grid-template-columns: 1fr;
          }
          
          .rating-label {
            flex-direction: row;
            text-align: left;
            padding: 12px 15px;
          }
          
          .rating-icon {
            margin-right: 15px;
            margin-bottom: 0;
            font-size: 1.8rem;
          }
        }
      `}</style>
    </>
  )
}