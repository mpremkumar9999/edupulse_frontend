// components/AttendanceReports.jsx
import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function AttendanceReports() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  const currentUser = user?.user || user || {}
  
  // Get unique classes from timetable
  const facultyClasses = [
    'E4 CSE-C' // Add more classes as needed
  ]

  const subjects = [
    'Mathematics', // Add more subjects as needed
    'Physics',
    'Chemistry'
  ]

  const fetchAttendanceReport = async () => {
    if (!selectedClass) return
    
    try {
      setLoading(true)
      const url = `/attendance/report/${selectedClass}${selectedSubject ? `?subject=${selectedSubject}` : ''}`
      const res = await api.get(url)
      setReports(res.data.report || [])
    } catch (err) {
      console.error('Error fetching attendance report:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedClass) {
      fetchAttendanceReport()
    }
  }, [selectedClass, selectedSubject])

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return 'success'
    if (percentage >= 60) return 'warning'
    return 'danger'
  }

  return (
    <>
      <Navbar />
      
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="text-primary mb-1">
                <i className="bi bi-graph-up me-2"></i>
                Attendance Reports
              </h2>
              <p className="text-muted mb-0">View class attendance analytics</p>
            </div>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate('/faculty')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
          </div>

          {/* Filters */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Select Class:</label>
                  <select 
                    className="form-select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="">Choose Class</option>
                    {facultyClasses.map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Filter by Subject:</label>
                  <select 
                    className="form-select"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          {selectedClass && (
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  Attendance Report - {selectedClass}
                  {selectedSubject && ` - ${selectedSubject}`}
                </h5>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-clipboard-x display-4 mb-3 d-block"></i>
                    <p>No attendance records found</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Student Name</th>
                          <th>Username</th>
                          <th className="text-center">Present</th>
                          <th className="text-center">Absent</th>
                          <th className="text-center">Total</th>
                          <th className="text-center">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((student, index) => (
                          <tr key={student.studentId}>
                            <td className="align-middle">
                              <div className="d-flex align-items-center">
                                <div className="student-avatar bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                                  style={{ width: '40px', height: '40px' }}>
                                  <i className="bi bi-person text-primary"></i>
                                </div>
                                <div>
                                  <div className="fw-bold">{student.studentName}</div>
                                  <small className="text-muted">{selectedClass}</small>
                                </div>
                              </div>
                            </td>
                            <td className="align-middle">{student.username}</td>
                            <td className="text-center align-middle">
                              <span className="badge bg-success">{student.presentClasses}</span>
                            </td>
                            <td className="text-center align-middle">
                              <span className="badge bg-danger">{student.absentClasses}</span>
                            </td>
                            <td className="text-center align-middle">
                              <span className="badge bg-primary">{student.totalClasses}</span>
                            </td>
                            <td className="text-center align-middle">
                              <span className={`badge bg-${getPercentageColor(student.attendancePercentage)}`}>
                                {student.attendancePercentage}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}