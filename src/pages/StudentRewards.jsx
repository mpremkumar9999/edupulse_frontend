import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { AuthContext } from '../context/AuthContext'

export default function StudentRewards() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, graded, pending

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'))
        const token = localStorage.getItem('token')

        if (!token) {
          console.error('⚠️ No token found in localStorage')
          setError('Authentication token not found. Please log in again.')
          setLoading(false)
          return
        }

        const { data } = await axios.get(
          'http://localhost:5000/api/submissions/student',
          { headers: { Authorization: `Bearer ${token}` } }
        )

        setSubmissions(data)
      } catch (err) {
        console.error('❌ Error fetching submissions:', err)
        setError('Failed to load submissions.')
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [])

  // Handle back button click
  const handleBack = () => {
    navigate(-1)
  }

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'graded') return submission.status === 'Graded'
    if (filter === 'pending') return submission.status !== 'Graded'
    return true
  })

  // Calculate statistics
  const stats = {
    total: submissions.length,
    graded: submissions.filter(s => s.status === 'Graded').length,
    pending: submissions.filter(s => s.status !== 'Graded').length,
    averageMarks: submissions.filter(s => s.marks && s.marks !== '-')
      .reduce((acc, curr) => acc + parseInt(curr.marks), 0) / 
      (submissions.filter(s => s.marks && s.marks !== '-').length || 1)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-fluid py-4 bg-light min-vh-100">
          <div className="container">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                <p className="text-muted fs-5">Loading your rewards and feedback...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container-fluid py-4 bg-light min-vh-100">
          <div className="container">
            <div className="alert alert-danger text-center">
              <i className="bi bi-exclamation-triangle fs-1 mb-3 d-block"></i>
              <h4 className="alert-heading">Oops! Something went wrong</h4>
              <p>{error}</p>
              <button onClick={handleBack} className="btn btn-primary me-2">
                <i className="bi bi-arrow-left me-2"></i>
                Go Back
              </button>
              <button onClick={() => window.location.reload()} className="btn btn-outline-primary">
                <i className="bi bi-arrow-clockwise me-2"></i>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      
      {/* Main Content */}
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="container">
          
          {/* Header Section with Back Button */}
          <div className="row align-items-center mb-4">
            <div className="col-auto">
              <button 
                onClick={handleBack}
                className="btn btn-outline-secondary btn-sm d-flex align-items-center"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back
              </button>
            </div>
            <div className="col">
              <h1 className="display-6 fw-bold text-gradient-primary mb-2">
                <i className="bi bi-award me-3"></i>
                Your Rewards & Feedback
              </h1>
              <p className="text-muted fs-5 mb-0">
                Track your progress and see faculty feedback
              </p>
            </div>
            <div className="col-auto">
              <span className="badge bg-primary fs-6 px-3 py-2">
                {stats.total} Total Submissions
              </span>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="icon-lg bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <i className="bi bi-journal-check text-primary fs-2"></i>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{stats.total}</h3>
                  <p className="text-muted mb-0">Total Submissions</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="icon-lg bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <i className="bi bi-check-circle text-success fs-2"></i>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{stats.graded}</h3>
                  <p className="text-muted mb-0">Graded</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="icon-lg bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <i className="bi bi-clock text-warning fs-2"></i>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{stats.pending}</h3>
                  <p className="text-muted mb-0">Pending Review</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="icon-lg bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <i className="bi bi-graph-up text-info fs-2"></i>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{stats.averageMarks.toFixed(1)}</h3>
                  <p className="text-muted mb-0">Average Marks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h5 className="mb-0 text-dark">Filter Submissions:</h5>
                </div>
                <div className="col-md-6">
                  <div className="d-flex gap-2 justify-content-md-end">
                    <button
                      className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                      onClick={() => setFilter('all')}
                    >
                      All ({stats.total})
                    </button>
                    <button
                      className={`btn ${filter === 'graded' ? 'btn-success' : 'btn-outline-success'} btn-sm`}
                      onClick={() => setFilter('graded')}
                    >
                      Graded ({stats.graded})
                    </button>
                    <button
                      className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'} btn-sm`}
                      onClick={() => setFilter('pending')}
                    >
                      Pending ({stats.pending})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div className="icon-xl bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                  <i className="bi bi-inbox text-muted fs-1"></i>
                </div>
                <h4 className="text-muted mb-3">
                  {filter === 'all' ? 'No submissions yet' : 
                   filter === 'graded' ? 'No graded submissions' : 
                   'No pending submissions'}
                </h4>
                <p className="text-muted mb-3">
                  {filter === 'all' ? 'Submit assignments to see them here.' :
                   filter === 'graded' ? 'Your graded submissions will appear here.' :
                   'All submissions have been graded!'}
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button onClick={handleBack} className="btn btn-primary">
                    <i className="bi bi-arrow-left me-2"></i>
                    Go Back
                  </button>
                  <button onClick={() => navigate('/assignments')} className="btn btn-outline-primary">
                    <i className="bi bi-journal-text me-2"></i>
                    View Assignments
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-primary">
                      <tr>
                        <th className="ps-4">#</th>
                        <th>Assignment</th>
                        <th>Submitted On</th>
                        <th>Status</th>
                        <th>Marks</th>
                        <th className="pe-4">Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((s, index) => (
                        <tr key={s._id || index} className="submission-row">
                          <td className="ps-4 fw-semibold text-muted">{index + 1}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="icon-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                                <i className="bi bi-journal-text text-primary"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold text-dark">{s.assignmentTitle}</h6>
                                <small className="text-muted">Assignment</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-muted">
                              <i className="bi bi-calendar me-2"></i>
                              {s.submittedAt
                                ? new Date(s.submittedAt).toLocaleDateString()
                                : '-'}
                            </div>
                            <small className="text-muted">
                              {s.submittedAt
                                ? new Date(s.submittedAt).toLocaleTimeString()
                                : ''}
                            </small>
                          </td>
                          <td>
                            {s.status === 'Graded' ? (
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-1 px-3 py-2">
                                <i className="bi bi-check-circle me-1"></i>
                                Graded
                              </span>
                            ) : (
                              <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-1 px-3 py-2">
                                <i className="bi bi-clock me-1"></i>
                                Pending
                              </span>
                            )}
                          </td>
                          <td>
                            {s.marks && s.marks !== '-' ? (
                              <div className="d-flex align-items-center">
                                <div className={`icon-xs rounded-circle d-flex align-items-center justify-content-center me-2 ${
                                  s.marks >= 80 ? 'bg-success bg-opacity-10' :
                                  s.marks >= 60 ? 'bg-warning bg-opacity-10' :
                                  'bg-danger bg-opacity-10'
                                }`}>
                                  <i className={`bi ${
                                    s.marks >= 80 ? 'bi-star-fill text-success' :
                                    s.marks >= 60 ? 'bi-star-half text-warning' :
                                    'bi-exclamation-triangle text-danger'
                                  }`}></i>
                                </div>
                                <span className={`fw-bold ${
                                  s.marks >= 80 ? 'text-success' :
                                  s.marks >= 60 ? 'text-warning' :
                                  'text-danger'
                                }`}>
                                  {s.marks} / 100
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="pe-4">
                            {s.feedback ? (
                              <div className="d-flex align-items-center">
                                <div className="icon-xs bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2">
                                  <i className="bi bi-chat-left-text text-info"></i>
                                </div>
                                <span className="text-muted">{s.feedback}</span>
                              </div>
                            ) : (
                              <span className="text-muted">No feedback yet</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .text-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .icon-lg {
          width: 80px;
          height: 80px;
        }
        
        .icon-xl {
          width: 100px;
          height: 100px;
        }
        
        .icon-sm {
          width: 40px;
          height: 40px;
        }
        
        .icon-xs {
          width: 24px;
          height: 24px;
          font-size: 0.8rem;
        }
        
        .submission-row {
          transition: all 0.3s ease;
        }
        
        .submission-row:hover {
          background-color: rgba(0, 123, 255, 0.05) !important;
          transform: translateX(2px);
        }
        
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        }
        
        .table > :not(caption) > * > * {
          padding: 1rem 0.5rem;
        }
      `}</style>
    </>
  )
}