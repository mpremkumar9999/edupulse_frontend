import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function StudentAttendance() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [attendance, setAttendance] = useState([])
  const [statistics, setStatistics] = useState({})
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  const currentUser = user?.user || user || {}
  const studentId = currentUser?._id

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = [2023, 2024, 2025]

  useEffect(() => {
    if (studentId) {
      fetchAttendance()
    }
  }, [studentId, selectedSubject, selectedMonth, selectedYear])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedSubject) params.append('subject', selectedSubject)
      if (selectedMonth) params.append('month', selectedMonth)
      if (selectedYear) params.append('year', selectedYear)

      const res = await api.get(`/attendance/student/${studentId}?${params}`)
      setAttendance(res.data.attendance || [])
      setStatistics(res.data.statistics || {})
      setSubjects(res.data.subjects || [])
    } catch (err) {
      console.error('Error fetching attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      Present: { class: 'success', icon: 'bi-check-circle' },
      Absent: { class: 'danger', icon: 'bi-x-circle' },
      Late: { class: 'warning', icon: 'bi-clock' }
    }
    
    const config = statusConfig[status] || { class: 'secondary', icon: 'bi-question-circle' }
    
    return (
      <span className={`badge bg-${config.class}`}>
        <i className={`bi ${config.icon} me-1`}></i>
        {status}
      </span>
    )
  }

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
                <i className="bi bi-clipboard-data me-2"></i>
                My Attendance
              </h2>
              <p className="text-muted mb-0">Track your attendance records</p>
            </div>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate('/student')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
          </div>

          {/* Statistics Card */}
          <div className="card shadow-lg mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Attendance Overview</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3 mb-3">
                  <div className={`display-6 fw-bold text-${getPercentageColor(statistics.attendancePercentage || 0)}`}>
                    {statistics.attendancePercentage || 0}%
                  </div>
                  <small className="text-muted">Overall Attendance</small>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="display-6 fw-bold text-success">{statistics.presentClasses || 0}</div>
                  <small className="text-muted">Present</small>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="display-6 fw-bold text-danger">{statistics.absentClasses || 0}</div>
                  <small className="text-muted">Absent</small>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="display-6 fw-bold text-warning">{statistics.lateClasses || 0}</div>
                  <small className="text-muted">Late</small>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
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
                <div className="col-md-4">
                  <label className="form-label fw-bold">Month:</label>
                  <select 
                    className="form-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Year:</label>
                  <select 
                    className="form-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Records */}
          <div className="card shadow-lg">
            <div className="card-header bg-white">
              <h5 className="mb-0">Attendance Records</h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : attendance.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-clipboard-x display-4 mb-3 d-block"></i>
                  <p>No attendance records found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Faculty</th>
                        <th>Session</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map(record => (
                        <tr key={record._id}>
                          <td className="align-middle">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="align-middle fw-bold">{record.subject}</td>
                          <td className="align-middle">{record.facultyName}</td>
                          <td className="align-middle">
                            <span className="badge bg-info">{record.session}</span>
                          </td>
                          <td className="text-center align-middle">
                            {getStatusBadge(record.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}