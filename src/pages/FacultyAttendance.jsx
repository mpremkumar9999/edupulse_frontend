import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function FacultyAttendance() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [attendanceData, setAttendanceData] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [session, setSession] = useState('Morning')

  const currentUser = user?.user || user || {}
  const facultyId = currentUser?._id

  const sessions = ['Morning', 'Afternoon', 'Evening']

  useEffect(() => {
    if (facultyId) {
      fetchTodayClasses()
    }
  }, [facultyId])

  const fetchTodayClasses = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/attendance/faculty-classes/${facultyId}`)
      setClasses(res.data.classes || [])
    } catch (err) {
      console.error('Error fetching classes:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchClassStudents = async (className, subject) => {
    try {
      setLoading(true)
      const res = await api.get(`/attendance/class-students/${className}`)
      setStudents(res.data.students || [])
      
      // Initialize attendance data
      const initialData = {}
      res.data.students.forEach(student => {
        initialData[student._id] = 'Present' // Default to Present
      })
      setAttendanceData(initialData)
      
      setSelectedClass({ className, subject })
    } catch (err) {
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const markAll = (status) => {
    const newData = {}
    students.forEach(student => {
      newData[student._id] = status
    })
    setAttendanceData(newData)
  }

  const submitAttendance = async () => {
    if (!selectedClass || !facultyId) return

    try {
      setLoading(true)
      setMessage('')

      const attendanceRecords = students.map(student => ({
        studentId: student._id,
        studentName: student.name,
        status: attendanceData[student._id] || 'Absent'
      }))

      const res = await api.post('/attendance/mark-attendance', {
        facultyId,
        className: selectedClass.className,
        subject: selectedClass.subject,
        session,
        attendanceData: attendanceRecords
      })

      setMessage(`✅ Attendance marked successfully for ${res.data.results.length} students`)
      
      // Clear after success
      setTimeout(() => {
        setSelectedClass(null)
        setStudents([])
        setAttendanceData({})
        setMessage('')
      }, 3000)

    } catch (err) {
      console.error('Error marking attendance:', err)
      setMessage('❌ Error marking attendance')
    } finally {
      setLoading(false)
    }
  }

  const getAttendanceStats = () => {
    const present = Object.values(attendanceData).filter(status => status === 'Present').length
    const absent = Object.values(attendanceData).filter(status => status === 'Absent').length
    const late = Object.values(attendanceData).filter(status => status === 'Late').length
    
    return { present, absent, late, total: students.length }
  }

  return (
    <>
      <Navbar />
      
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="text-primary mb-1">
                <i className="bi bi-clipboard-check me-2"></i>
                Take Attendance
              </h2>
              <p className="text-muted mb-0">Mark attendance for your classes</p>
            </div>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate('/faculty')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
          </div>

          {/* Today's Classes */}
          <div className="card shadow-lg mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-calendar-day me-2"></i>
                Today's Classes
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : classes.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-calendar-x display-4 mb-3 d-block"></i>
                  <p>No classes scheduled for today</p>
                </div>
              ) : (
                <div className="row g-3">
                  {classes.map(cls => (
                    <div key={cls._id} className="col-md-6 col-lg-4">
                      <div 
                        className="card border-0 shadow-sm h-100 class-card"
                        onClick={() => fetchClassStudents(cls.className, cls.subject)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body text-center p-4">
                          <i className="bi bi-book display-6 text-primary mb-3"></i>
                          <h6 className="fw-bold">{cls.subject}</h6>
                          <p className="text-muted mb-2">{cls.className}</p>
                          <small className="text-muted">
                            {cls.startTime} - {cls.endTime}
                          </small>
                          <br />
                          <small className="text-muted">Room: {cls.room || 'N/A'}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attendance Form */}
          {selectedClass && (
            <div className="card shadow-lg">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-people me-2"></i>
                  Attendance for {selectedClass.subject} - {selectedClass.className}
                </h5>
              </div>
              <div className="card-body">
                {/* Session Selection */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Select Session:</label>
                    <select 
                      className="form-select"
                      value={session}
                      onChange={(e) => setSession(e.target.value)}
                    >
                      {sessions.map(sess => (
                        <option key={sess} value={sess}>{sess}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Quick Actions:</label>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-outline-success"
                        onClick={() => markAll('Present')}
                      >
                        Mark All Present
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => markAll('Absent')}
                      >
                        Mark All Absent
                      </button>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="alert alert-info">
                      <div className="row text-center">
                        <div className="col">
                          <div className="fw-bold text-success">{getAttendanceStats().present}</div>
                          <small>Present</small>
                        </div>
                        <div className="col">
                          <div className="fw-bold text-warning">{getAttendanceStats().late}</div>
                          <small>Late</small>
                        </div>
                        <div className="col">
                          <div className="fw-bold text-danger">{getAttendanceStats().absent}</div>
                          <small>Absent</small>
                        </div>
                        <div className="col">
                          <div className="fw-bold text-primary">{getAttendanceStats().total}</div>
                          <small>Total</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Student Name</th>
                        <th>Username</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="student-avatar bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{ width: '40px', height: '40px' }}>
                                <i className="bi bi-person text-primary"></i>
                              </div>
                              <div>
                                <div className="fw-bold">{student.name}</div>
                                <small className="text-muted">{student.className}</small>
                              </div>
                            </div>
                          </td>
                          <td className="align-middle">{student.username}</td>
                          <td className="text-center align-middle">
                            <div className="btn-group btn-group-sm" role="group">
                              <input
                                type="radio"
                                className="btn-check"
                                name={`attendance-${student._id}`}
                                id={`present-${student._id}`}
                                checked={attendanceData[student._id] === 'Present'}
                                onChange={() => handleAttendanceChange(student._id, 'Present')}
                              />
                              <label className="btn btn-outline-success" htmlFor={`present-${student._id}`}>
                                Present
                              </label>

                              <input
                                type="radio"
                                className="btn-check"
                                name={`attendance-${student._id}`}
                                id={`late-${student._id}`}
                                checked={attendanceData[student._id] === 'Late'}
                                onChange={() => handleAttendanceChange(student._id, 'Late')}
                              />
                              <label className="btn btn-outline-warning" htmlFor={`late-${student._id}`}>
                                Late
                              </label>

                              <input
                                type="radio"
                                className="btn-check"
                                name={`attendance-${student._id}`}
                                id={`absent-${student._id}`}
                                checked={attendanceData[student._id] === 'Absent'}
                                onChange={() => handleAttendanceChange(student._id, 'Absent')}
                              />
                              <label className="btn btn-outline-danger" htmlFor={`absent-${student._id}`}>
                                Absent
                              </label>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Submit Button */}
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedClass(null)
                      setStudents([])
                      setAttendanceData({})
                    }}
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={submitAttendance}
                    disabled={loading || students.length === 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Marking Attendance...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Submit Attendance
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
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .class-card:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease;
        }
      `}</style>
    </>
  )
}