import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar';

export default function StudentTimetable() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState('Monday')

  const currentUser = user?.user || user || {}
  const studentClassName = currentUser?.className

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const timeSlots = [
    { slot: '1', start: '08:30', end: '09:30' },
    { slot: '2', start: '09:30', end: '10:30' },
    { slot: 'Break1', start: '10:30', end: '10:45', isBreak: true, breakType: 'Tea Break' },
    { slot: '3', start: '10:45', end: '11:45' },
    { slot: '4', start: '11:45', end: '12:45' },
    { slot: 'Lunch', start: '12:45', end: '13:30', isBreak: true, breakType: 'Lunch Break' },
    { slot: '5', start: '13:30', end: '14:30' },
    { slot: '6', start: '14:30', end: '15:30' },
    { slot: 'Break2', start: '15:30', end: '15:45', isBreak: true, breakType: 'Tea Break' },
    { slot: '7', start: '15:45', end: '16:45' },
    { slot: 'Break3', start: '16:45', end: '17:00', isBreak: true, breakType: 'Short Break' }
  ]

  useEffect(() => {
    if (studentClassName) {
      fetchTimetable()
    }
  }, [studentClassName])

  const fetchTimetable = async () => {
    try {
      setLoading(true)
      console.log('Fetching timetable for class:', studentClassName)
      
      const res = await api.get(`/timetable/class/${studentClassName}`)
      console.log('Timetable response:', res.data)
      
      setTimetable(res.data.timetable || [])
    } catch (err) {
      console.error('Error fetching timetable:', err)
      console.error('Error details:', err.response?.data)
      setTimetable([])
    } finally {
      setLoading(false)
    }
  }

  const getDayTimetable = (day) => {
    return timetable.filter(entry => entry.day === day)
  }

  const getClassForTimeSlot = (day, timeSlot) => {
    const dayTimetable = getDayTimetable(day)
    return dayTimetable.find(entry => entry.timeSlot === timeSlot)
  }

  const getCellContent = (day, timeSlot) => {
    const slotInfo = timeSlots.find(s => s.slot === timeSlot)
    const classEntry = getClassForTimeSlot(day, timeSlot)

    if (slotInfo.isBreak) {
      return (
        <div className="text-center text-muted small p-2" style={{background: '#f8f9fa', height: '100%'}}>
          <div className="fw-bold">{slotInfo.breakType}</div>
          <small>{slotInfo.start} - {slotInfo.end}</small>
        </div>
      )
    }

    if (classEntry) {
      return (
        <div 
          className="p-2 text-white rounded"
          style={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}
        >
          <div className="fw-bold">{classEntry.subject}</div>
          <small>By: {classEntry.facultyName}</small>
          <br />
          <small>Room: {classEntry.room || 'TBA'}</small>
        </div>
      )
    }

    return (
      <div className="text-center text-muted small p-2" style={{height: '100%'}}>
        <div>No Class</div>
        <small>Free Period</small>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-fluid py-4">
          <div className="card shadow-lg">
            <div className="card-body text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading your timetable...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Show error if no class assigned
  if (!studentClassName) {
    return (
      <>
        <Navbar />
        <div className="container-fluid py-4">
          <div className="card shadow-lg">
            <div className="card-body text-center py-5">
              <i className="bi bi-calendar-x display-4 text-warning mb-3"></i>
              <h4>No Class Assigned</h4>
              <p className="text-muted mb-4">You are not assigned to any class yet.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/student')}
              >
                Back to Dashboard
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
      
      <div className="container-fluid py-4">
        <div className="container">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="text-primary mb-1">
                <i className="bi bi-calendar-week me-2"></i>
                My Timetable
              </h2>
              <p className="text-muted mb-0">
                Class: <span className="fw-bold text-dark">{studentClassName}</span>
              </p>
            </div>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => navigate('/student')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
          </div>

          {/* Day Selector for Mobile */}
          <div className="d-lg-none mb-4">
            <div className="card">
              <div className="card-body">
                <label className="form-label fw-bold">Select Day:</label>
                <select 
                  className="form-select"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Timetable - Mobile View (Single Day) */}
          <div className="d-lg-none">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0 text-center">{selectedDay}</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {timeSlots.map(timeSlot => (
                    <div key={timeSlot.slot} className="list-group-item">
                      <div className="row align-items-center">
                        <div className="col-4">
                          <div className="text-center">
                            <div className="fw-bold">{timeSlot.start}</div>
                            <div className="fw-bold">{timeSlot.end}</div>
                            <small className="text-muted">Slot {timeSlot.slot}</small>
                          </div>
                        </div>
                        <div className="col-8">
                          {getCellContent(selectedDay, timeSlot.slot)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timetable - Desktop View (All Days) */}
          <div className="d-none d-lg-block">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0 text-center">Weekly Timetable - {studentClassName}</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-bordered mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th style={{width: '120px'}}>Time Slot</th>
                        {days.map(day => (
                          <th key={day} className="text-center">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map(timeSlot => (
                        <tr key={timeSlot.slot}>
                          <td className="text-center fw-bold">
                            {timeSlot.start} - {timeSlot.end}
                            <br />
                            <small className="text-muted">Slot {timeSlot.slot}</small>
                          </td>
                          {days.map(day => (
                            <td 
                              key={`${day}-${timeSlot.slot}`} 
                              style={{ minWidth: '160px', height: '100px', verticalAlign: 'middle' }}
                            >
                              {getCellContent(day, timeSlot.slot)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Timetable Legend
                  </h6>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="d-flex align-items-center mb-2">
                        <div 
                          className="rounded me-2"
                          style={{
                            width: '20px',
                            height: '20px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        ></div>
                        <span>Scheduled Class</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center mb-2">
                        <div 
                          className="rounded me-2"
                          style={{
                            width: '20px',
                            height: '20px',
                            background: '#f8f9fa'
                          }}
                        ></div>
                        <span>Break Time</span>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center mb-2">
                        <div 
                          className="rounded me-2 border"
                          style={{
                            width: '20px',
                            height: '20px',
                            background: 'white'
                          }}
                        ></div>
                        <span>Free Period</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated Info */}
          {timetable.length > 0 && (
            <div className="alert alert-info mt-3">
              <i className="bi bi-clock-history me-2"></i>
              Timetable last updated: {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}

          {/* Debug Info - Remove in production */}
          {timetable.length === 0 && (
            <div className="alert alert-warning mt-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              No timetable data found for your class. Please ask your faculty to schedule classes.
            </div>
          )}
        </div>
      </div>
    </>
  )
}