import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Chart from 'chart.js/auto'

export default function MyAssignments() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [selected, setSelected] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [grading, setGrading] = useState({})
  const [showChart, setShowChart] = useState(false)
  const [error, setError] = useState('')

  const chartRef = useRef(null)
  const [chartInstance, setChartInstance] = useState(null)

  const motivationalQuotes = [
    "Every student can learn, just not on the same day or in the same way. - George Evans",
    "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
    "Education is not preparation for life; education is life itself. - John Dewey",
    "Students don't care how much you know until they know how much you care. - Anonymous",
    "The art of teaching is the art of assisting discovery. - Mark Van Doren",
    "Great teachers empathize with kids, respect them, and believe that each one has something special that can be built upon. - Ann Lieberman"
  ]

  const [currentQuote, setCurrentQuote] = useState('')

  // Calculate marks distribution for Chart.js
  const getMarksDistribution = () => {
    const gradedSubmissions = submissions.filter(s => s.submitted && s.marks !== undefined && s.marks !== null)
    
    const ranges = [
      { range: '90-100', min: 90, max: 100, color: '#28a745' },
      { range: '80-89', min: 80, max: 89, color: '#17a2b8' },
      { range: '70-79', min: 70, max: 79, color: '#007bff' },
      { range: '60-69', min: 60, max: 69, color: '#ffc107' },
      { range: '50-59', min: 50, max: 59, color: '#fd7e14' },
      { range: '40-49', min: 40, max: 49, color: '#dc3545' },
      { range: '0-39', min: 0, max: 39, color: '#343a40' },
      { range: 'Not Graded', min: null, max: null, color: '#6c757d' }
    ]

    const counts = ranges.map(range => {
      if (range.range === 'Not Graded') {
        return submissions.filter(s => s.submitted && (s.marks === undefined || s.marks === null)).length
      }
      return gradedSubmissions.filter(s => s.marks >= range.min && s.marks <= range.max).length
    })

    return {
      labels: ranges.map(r => r.range),
      datasets: [{
        label: 'Number of Students',
        data: counts,
        backgroundColor: ranges.map(r => r.color),
        borderColor: ranges.map(r => r.color),
        borderWidth: 1
      }]
    }
  }

  // Calculate statistics
  const getStatistics = () => {
    const gradedSubmissions = submissions.filter(s => s.submitted && s.marks !== undefined && s.marks !== null)
    const totalGraded = gradedSubmissions.length
    const totalSubmitted = submissions.filter(s => s.submitted).length
    
    if (totalGraded === 0) return null

    const marks = gradedSubmissions.map(s => s.marks)
    const average = marks.reduce((a, b) => a + b, 0) / totalGraded
    const highest = Math.max(...marks)
    const lowest = Math.min(...marks)

    return {
      average: average.toFixed(1),
      highest,
      lowest,
      totalGraded,
      totalSubmitted,
      gradingProgress: ((totalGraded / totalSubmitted) * 100).toFixed(1)
    }
  }

  // Initialize or update chart
  useEffect(() => {
    if (showChart && chartRef.current && submissions.length > 0) {
      const chartData = getMarksDistribution()
      
      // Destroy existing chart
      if (chartInstance) {
        chartInstance.destroy()
      }

      // Create new chart
      const newChartInstance = new Chart(chartRef.current, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Marks Distribution',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.parsed.y} students in ${context.label} range`
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Students',
                font: {
                  weight: 'bold'
                }
              },
              ticks: {
                stepSize: 1
              }
            },
            x: {
              title: {
                display: true,
                text: 'Marks Range',
                font: {
                  weight: 'bold'
                }
              }
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
          }
        }
      })

      setChartInstance(newChartInstance)
    }

    // Cleanup function
    return () => {
      if (chartInstance) {
        chartInstance.destroy()
      }
    }
  }, [showChart, submissions])

  // Fetch assignments created by faculty
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setError('')
        const res = await api.get('/assignments/teacher', {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        
        // Handle both response formats
        if (res.data.success && res.data.assignments) {
          setAssignments(res.data.assignments)
        } else if (Array.isArray(res.data)) {
          setAssignments(res.data)
        } else {
          setAssignments([])
        }
      } catch (err) {
        console.error('Error fetching assignments:', err)
        setError('Failed to load assignments. Please try again.')
        setAssignments([])
      }
    }
    fetchAssignments()

    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    setCurrentQuote(randomQuote)
  }, [user])

  // View submissions for selected assignment
  const viewSubmissions = async (assignmentId) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/submissions/${assignmentId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      
      // Handle both response formats
      let submissionData = res.data
      if (res.data.success && res.data.data) {
        submissionData = res.data.data
      }
      
      setSelected(submissionData)
      
      // Handle submissions array - check for different possible property names
      const submissionsArray = submissionData.submissionDetails || 
                              submissionData.submissions || 
                              submissionData.students || 
                              []
      
      setSubmissions(submissionsArray)
      
      const initialGrading = {}
      submissionsArray.forEach(submission => {
        if (submission.submitted) {
          initialGrading[submission._id] = {
            marks: submission.marks || '',
            feedback: submission.feedback || ''
          }
        }
      })
      setGrading(initialGrading)
    } catch (err) {
      console.error('Error fetching submissions:', err)
      setError('Failed to load submissions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle grading input change
  const handleGradeChange = (id, field, value) => {
    setGrading((prev) => ({
      ...prev,
      [id]: { 
        ...prev[id], 
        [field]: value
      },
    }))
  }

  // Submit grade
  const submitGrade = async (submissionId) => {
    const { marks, feedback } = grading[submissionId] || {}
    if (!marks && marks !== 0) {
      alert('Please enter marks before submitting.')
      return
    }

    try {
      await api.patch(
        `/submissions/${submissionId}/grade`,
        { marks: parseInt(marks), feedback: feedback || '' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      alert('✅ Grade submitted successfully!')
      if (selected) {
        viewSubmissions(selected._id)
      }
    } catch (err) {
      console.error('Error grading submission:', err)
      alert('❌ Failed to grade submission.')
    }
  }

  // Handle back button click
  const handleBack = () => {
    if (selected) {
      setSelected(null)
      setSubmissions([])
      setGrading({})
      setShowChart(false)
      setError('')
    } else {
      navigate(-1)
    }
  }

  const statistics = getStatistics()

  // Helper function to get assignment display data
  const getAssignmentDisplayData = (assignment) => {
    return {
      _id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      className: assignment.className,
      fileUrl: assignment.fileUrl,
      faculty: assignment.faculty,
      createdAt: assignment.createdAt
    }
  }

  // Helper function to get submission display data
  const getSubmissionDisplayData = (submission) => {
    return {
      _id: submission._id,
      studentName: submission.studentName || submission.student?.name || 'Unknown Student',
      submitted: submission.submitted || false,
      fileUrl: submission.fileUrl,
      submittedAt: submission.submittedAt,
      marks: submission.marks,
      feedback: submission.feedback
    }
  }

  return (
    <>
      <Navbar />
      
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
                {selected ? 'Back to Assignments' : 'Back'}
              </button>
            </div>
            <div className="col">
              <h1 className="display-6 fw-bold text-gradient-primary mb-2">
                <i className="bi bi-journal-text me-3"></i>
                {selected ? 'Grade Submissions' : 'My Assignments'}
              </h1>
              <p className="text-muted fs-5 mb-0">
                {selected ? 'Review and grade student work' : 'Manage your created assignments'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger border-0 shadow-sm mb-4" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill text-danger fs-4 me-3"></i>
                <div>
                  <h5 className="alert-heading mb-1">Error</h5>
                  <p className="mb-0">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Motivational Quote Card */}
          {!selected && !error && (
            <div className="card border-0 shadow-sm mb-5" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <div className="card-body text-center py-3">
                <i className="bi bi-quote display-4 text-white opacity-50 mb-2 d-block"></i>
                <p className="fs-6 fst-italic text-white mb-0 px-4">
                  "{currentQuote}"
                </p>
              </div>
            </div>
          )}

          {/* Faculty's Assignments List */}
          {!selected && (
            <div className="row">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="fw-bold text-dark mb-0">
                    <i className="bi bi-list-task me-2"></i>
                    Your Created Assignments
                  </h3>
                  <span className="badge bg-primary fs-6 px-3 py-2">
                    {assignments.length} {assignments.length === 1 ? 'Assignment' : 'Assignments'}
                  </span>
                </div>

                {assignments.length === 0 ? (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <div className="icon-xl bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                        <i className="bi bi-journal-plus text-muted fs-1"></i>
                      </div>
                      <h4 className="text-muted mb-3">No assignments created yet</h4>
                      <p className="text-muted mb-3">Create your first assignment to get started with student submissions.</p>
                      <button 
                        onClick={() => navigate('/create-assignment')}
                        className="btn btn-primary"
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Assignment
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="row g-4">
                    {assignments.map((assignment) => {
                      const assignmentData = getAssignmentDisplayData(assignment)
                      return (
                        <div key={assignmentData._id} className="col-12 col-md-6 col-lg-4">
                          <div className="card border-0 shadow-sm h-100 assignment-card">
                            <div className="card-body p-4">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <h5 className="card-title fw-bold text-dark mb-2">
                                    {assignmentData.title}
                                  </h5>
                                  <span className="badge bg-primary bg-opacity-10 text-primary">
                                    <i className="bi bi-book me-1"></i>
                                    {assignmentData.className}
                                  </span>
                                </div>
                                <div className="icon-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center">
                                  <i className="bi bi-journal-text text-primary"></i>
                                </div>
                              </div>

                              <p className="card-text text-muted mb-4">
                                {assignmentData.description}
                              </p>

                              {assignmentData.fileUrl && (
                                <div className="mb-3">
                                  <a
                                    href={`http://localhost:5000${assignmentData.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-outline-primary btn-sm d-inline-flex align-items-center"
                                  >
                                    <i className="bi bi-download me-2"></i>
                                    Assignment File
                                  </a>
                                </div>
                              )}

                              <div className="mt-auto">
                                <button
                                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                                  onClick={() => viewSubmissions(assignmentData._id)}
                                >
                                  <i className="bi bi-eye me-2"></i>
                                  View Submissions
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submissions Section */}
          {selected && (
            <>
              {/* Statistics and Chart Toggle */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col">
                          <h5 className="fw-bold mb-3">
                            <i className="bi bi-graph-up me-2"></i>
                            Performance Overview
                          </h5>
                          
                          {statistics ? (
                            <div className="row text-center">
                              <div className="col">
                                <div className="border-end">
                                  <h4 className="fw-bold text-primary">{statistics.average}%</h4>
                                  <small className="text-muted">Average Marks</small>
                                </div>
                              </div>
                              <div className="col">
                                <div className="border-end">
                                  <h4 className="fw-bold text-success">{statistics.highest}%</h4>
                                  <small className="text-muted">Highest Marks</small>
                                </div>
                              </div>
                              <div className="col">
                                <div className="border-end">
                                  <h4 className="fw-bold text-warning">{statistics.lowest}%</h4>
                                  <small className="text-muted">Lowest Marks</small>
                                </div>
                              </div>
                              <div className="col">
                                <div className="border-end">
                                  <h4 className="fw-bold text-info">{statistics.gradingProgress}%</h4>
                                  <small className="text-muted">Grading Progress</small>
                                </div>
                              </div>
                              <div className="col">
                                <h4 className="fw-bold text-secondary">{statistics.totalGraded}/{statistics.totalSubmitted}</h4>
                                <small className="text-muted">Graded/Submitted</small>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted mb-0">No grades submitted yet. Start grading to see statistics.</p>
                          )}
                        </div>
                        <div className="col-auto">
                          <button
                            className={`btn ${showChart ? 'btn-outline-primary' : 'btn-primary'}`}
                            onClick={() => setShowChart(!showChart)}
                          >
                            <i className={`bi ${showChart ? 'bi-table' : 'bi-bar-chart'} me-2`}></i>
                            {showChart ? 'Show Table' : 'Show Chart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart.js Marks Distribution Chart */}
              {showChart && (
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-white border-0">
                        <h5 className="fw-bold mb-0">
                          <i className="bi bi-bar-chart me-2"></i>
                          Marks Distribution
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="chart-container" style={{ height: '400px', position: 'relative' }}>
                          <canvas ref={chartRef}></canvas>
                        </div>
                        {submissions.filter(s => s.submitted).length === 0 && (
                          <div className="text-center py-4">
                            <i className="bi bi-bar-chart display-4 text-muted mb-3"></i>
                            <p className="text-muted">No submissions available to display chart</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submissions Table */}
              {!showChart && (
                <div className="card border-0 shadow-lg">
                  <div className="card-header bg-white border-0 py-4">
                    <div className="row align-items-center">
                      <div className="col">
                        <h4 className="fw-bold text-gradient-primary mb-2">
                          Submissions for: {selected.assignmentTitle || selected.title}
                        </h4>
                        <p className="text-muted mb-0">
                          Class: <span className="fw-semibold">{selected.className}</span>
                        </p>
                      </div>
                      <div className="col-auto">
                        <span className="badge bg-primary fs-6 px-3 py-2">
                          {selected.totalSubmitted || submissions.filter(s => s.submitted).length}/
                          {selected.totalStudents || submissions.length} Submitted
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Submission Progress</small>
                        <small className="text-muted">
                          {Math.round(((selected.totalSubmitted || submissions.filter(s => s.submitted).length) / 
                          (selected.totalStudents || submissions.length)) * 100)}%
                        </small>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{
                            width: `${((selected.totalSubmitted || submissions.filter(s => s.submitted).length) / 
                            (selected.totalStudents || submissions.length)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="card-body p-0">
                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary mb-3"></div>
                        <p className="text-muted">Loading submissions...</p>
                      </div>
                    ) : submissions.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="bi bi-people display-4 text-muted mb-3"></i>
                        <h5 className="text-muted">No students found in this class</h5>
                        <p className="text-muted">There are no students enrolled in {selected.className} yet.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-primary">
                            <tr>
                              <th className="ps-4">Student</th>
                              <th>Status</th>
                              <th>File</th>
                              <th>Submitted At</th>
                              <th>Marks</th>
                              <th>Feedback</th>
                              <th className="pe-4">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {submissions.map((s, idx) => {
                              const submissionData = getSubmissionDisplayData(s)
                              return (
                                <tr key={submissionData._id || idx} className="submission-row">
                                  <td className="ps-4">
                                    <div className="d-flex align-items-center">
                                      <div className="icon-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                                        <i className="bi bi-person text-primary"></i>
                                      </div>
                                      <div>
                                        <h6 className="mb-0 fw-bold text-dark">{submissionData.studentName}</h6>
                                        <small className="text-muted">Student</small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    {submissionData.submitted ? (
                                      <span className={`badge ${submissionData.marks ? 'bg-success' : 'bg-warning'} bg-opacity-10 text-${submissionData.marks ? 'success' : 'warning'} border border-${submissionData.marks ? 'success' : 'warning'} border-1`}>
                                        <i className={`bi ${submissionData.marks ? 'bi-check-circle' : 'bi-clock'} me-1`}></i>
                                        {submissionData.marks ? 'Graded' : 'Pending Grade'}
                                      </span>
                                    ) : (
                                      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-1">
                                        <i className="bi bi-x-circle me-1"></i>
                                        Not Submitted
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {submissionData.fileUrl ? (
                                      <a
                                        href={`http://localhost:5000${submissionData.fileUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-outline-primary btn-sm d-inline-flex align-items-center"
                                      >
                                        <i className="bi bi-download me-1"></i>
                                        Download
                                      </a>
                                    ) : (
                                      <span className="text-muted">—</span>
                                    )}
                                  </td>
                                  <td>
                                    {submissionData.submittedAt ? (
                                      <div className="text-muted">
                                        <small>{new Date(submissionData.submittedAt).toLocaleDateString()}</small>
                                        <br />
                                        <small>{new Date(submissionData.submittedAt).toLocaleTimeString()}</small>
                                      </div>
                                    ) : (
                                      <span className="text-muted">—</span>
                                    )}
                                  </td>
                                  <td style={{ width: '120px' }}>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      placeholder="Marks"
                                      value={grading[submissionData._id]?.marks || ''}
                                      onChange={(e) =>
                                        handleGradeChange(submissionData._id, 'marks', e.target.value)
                                      }
                                      disabled={!submissionData.submitted}
                                      min="0"
                                      max="100"
                                    />
                                  </td>
                                  <td style={{ width: '200px' }}>
                                    <input
                                      type="text"
                                      className="form-control form-control-sm"
                                      placeholder="Feedback"
                                      value={grading[submissionData._id]?.feedback || ''}
                                      onChange={(e) =>
                                        handleGradeChange(submissionData._id, 'feedback', e.target.value)
                                      }
                                      disabled={!submissionData.submitted}
                                    />
                                  </td>
                                  <td className="pe-4">
                                    <button
                                      className="btn btn-success btn-sm d-inline-flex align-items-center"
                                      onClick={() => submitGrade(submissionData._id)}
                                      disabled={!submissionData.submitted || (!grading[submissionData._id]?.marks && grading[submissionData._id]?.marks !== 0)}
                                    >
                                      <i className="bi bi-check-lg me-1"></i>
                                      {submissionData.marks ? 'Update' : 'Grade'}
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
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
        
        .icon-xl {
          width: 100px;
          height: 100px;
        }
        
        .icon-sm {
          width: 40px;
          height: 40px;
        }
        
        .assignment-card {
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .assignment-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        
        .submission-row {
          transition: all 0.3s ease;
        }
        
        .submission-row:hover {
          background-color: rgba(0, 123, 255, 0.05) !important;
        }
        
        .chart-container {
          background: linear-gradient(to top, #f8f9fa, transparent);
          border-radius: 8px;
        }
      `}</style>
    </>
  )
}