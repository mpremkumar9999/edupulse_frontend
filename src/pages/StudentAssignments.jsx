import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function StudentAssignments() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, submitted
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setError('')
        const res = await api.get('/assignments/student', {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        
        // Handle different response formats
        let assignmentsData = []
        
        if (res.data && res.data.success && Array.isArray(res.data.assignments)) {
          // Format: { success: true, assignments: [...] }
          assignmentsData = res.data.assignments
        } else if (Array.isArray(res.data)) {
          // Format: direct array response
          assignmentsData = res.data
        } else if (res.data && Array.isArray(res.data.data)) {
          // Format: { data: [...] }
          assignmentsData = res.data.data
        } else {
          console.warn('Unexpected API response format:', res.data)
          assignmentsData = []
        }
        
        setAssignments(assignmentsData)
      } catch (err) {
        console.error('Error fetching assignments:', err)
        setError('Failed to load assignments. Please try again.')
        setAssignments([])
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [user])

  // Ensure assignments is always an array before filtering
  const assignmentsArray = Array.isArray(assignments) ? assignments : []

  // Filter assignments based on status
  const filteredAssignments = assignmentsArray.filter(assignment => {
    if (filter === 'submitted') return assignment.submitted
    if (filter === 'pending') return !assignment.submitted
    return true
  })

  // Count assignments by status
  const stats = {
    total: assignmentsArray.length,
    pending: assignmentsArray.filter(a => !a.submitted).length,
    submitted: assignmentsArray.filter(a => a.submitted).length
  }

  // Handle back button click
  const handleBack = () => {
    navigate(-1) // Go back to previous page
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
                <p className="text-muted fs-5">Loading your assignments...</p>
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
                <i className="bi bi-journal-text me-3"></i>
                My Class Assignments
              </h1>
              <p className="text-muted fs-5 mb-0">
                Manage and submit your course assignments
              </p>
            </div>
            <div className="col-auto">
              <span className="badge bg-primary fs-6 px-3 py-2">
                {stats.total} Total Assignments
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger border-0 shadow-sm mb-4" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill text-danger fs-4 me-3"></i>
                <div>
                  <h5 className="alert-heading mb-1">Error Loading Assignments</h5>
                  <p className="mb-0">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="icon-lg bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <i className="bi bi-journal-text text-primary fs-2"></i>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{stats.total}</h3>
                  <p className="text-muted mb-0">Total Assignments</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="icon-lg bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <i className="bi bi-clock text-warning fs-2"></i>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{stats.pending}</h3>
                  <p className="text-muted mb-0">Pending Submission</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="icon-lg bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <i className="bi bi-check-circle text-success fs-2"></i>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{stats.submitted}</h3>
                  <p className="text-muted mb-0">Submitted</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h5 className="mb-0 text-dark">Filter Assignments:</h5>
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
                      className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'} btn-sm`}
                      onClick={() => setFilter('pending')}
                    >
                      Pending ({stats.pending})
                    </button>
                    <button
                      className={`btn ${filter === 'submitted' ? 'btn-success' : 'btn-outline-success'} btn-sm`}
                      onClick={() => setFilter('submitted')}
                    >
                      Submitted ({stats.submitted})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assignments List */}
          {filteredAssignments.length === 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div className="icon-xl bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                  <i className="bi bi-inbox text-muted fs-1"></i>
                </div>
                <h4 className="text-muted mb-3">
                  {filter === 'all' ? 'No assignments yet' : 
                   filter === 'pending' ? 'No pending assignments' : 
                   'No submitted assignments'}
                </h4>
                <p className="text-muted mb-0">
                  {filter === 'all' ? 'Check back later for new assignments from your faculty.' :
                   filter === 'pending' ? 'Great job! All assignments are submitted.' :
                   'Submit your pending assignments to see them here.'}
                </p>
                <button 
                  onClick={handleBack}
                  className="btn btn-primary mt-3"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {filteredAssignments.map((assignment) => (
                <div key={assignment._id} className="col-12 col-lg-6">
                  <div className="card border-0 shadow-sm h-100 assignment-card">
                    <div className="card-body p-4">
                      
                      {/* Assignment Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="card-title fw-bold text-dark mb-2">
                            {assignment.title}
                          </h5>
                          <span className="badge bg-primary bg-opacity-10 text-primary">
                            <i className="bi bi-book me-1"></i>
                            {assignment.className}
                          </span>
                        </div>
                        <div>
                          {assignment.submitted ? (
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-1">
                              <i className="bi bi-check-circle me-1"></i>
                              Submitted
                            </span>
                          ) : (
                            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-1">
                              <i className="bi bi-clock me-1"></i>
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Assignment Description */}
                      <p className="card-text text-muted mb-4">
                        {assignment.description}
                      </p>

                      {/* Assignment File */}
                      {assignment.fileUrl && (
                        <div className="mb-4">
                          <a
                            href={`http://localhost:5000${assignment.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center"
                          >
                            <i className="bi bi-download me-2"></i>
                            Download Assignment File
                          </a>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <i className="bi bi-calendar me-1"></i>
                          {assignment.dueDate ? `Due: ${new Date(assignment.dueDate).toLocaleDateString()}` : 'No due date'}
                        </small>
                        {assignment.submitted ? (
                          <span className="text-success fw-semibold">
                            <i className="bi bi-check-circle me-1"></i>
                            Completed
                          </span>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm d-inline-flex align-items-center"
                            onClick={() => navigate(`/submit-assignment/${assignment._id}`)}
                          >
                            <i className="bi bi-upload me-2"></i>
                            Submit Work
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Custom Styles - Converted to regular CSS */}
      <style>{`
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
        
        .assignment-card {
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .assignment-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </>
  )
}