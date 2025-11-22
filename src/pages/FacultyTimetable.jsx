import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function FacultyTimetable() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [timetable, setTimetable] = useState({})
  const [loading, setLoading] = useState(true)
  const [editingEntry, setEditingEntry] = useState(null)
  const [formData, setFormData] = useState({
    subject: '',
    className: '',
    room: ''
  })

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

  const classNames = [
    'E1 CSE-A', 'E1 CSE-B', 'E1 CSE-C', 'E1 CSE-D',
    'E2 CSE-A', 'E2 CSE-B', 'E2 CSE-C', 'E2 CSE-D',
    'E3 CSE-A', 'E3 CSE-B', 'E3 CSE-C', 'E3 CSE-D',
    'E4 CSE-A', 'E4 CSE-B', 'E4 CSE-C', 'E4 CSE-D'
  ]

  // Get current user safely
  const currentUser = user?.user || user || {}
  const facultyName = currentUser?.name || 'Faculty'
  const facultyId = currentUser?._id

  useEffect(() => {
    if (!facultyId) {
      console.error('No faculty ID found')
      return
    }
    fetchTimetable()
  }, [facultyId])

  const fetchTimetable = async () => {
    try {
      setLoading(true)
      console.log('Fetching timetable for faculty ID:', facultyId)
      
      // FIX: Remove the extra /api from the URL since axios baseURL already includes it
      const res = await api.get(`/timetable/faculty/${facultyId}`)
      console.log('Timetable response:', res.data)
      
      setTimetable(res.data.timetable || {})
    } catch (err) {
      console.error('Error fetching timetable:', err)
      console.error('Error details:', err.response?.data)
      
      // Initialize empty timetable structure
      const emptyTimetable = {}
      days.forEach(day => {
        emptyTimetable[day] = timeSlots.map(slot => ({
          ...slot,
          day: day,
          isEmpty: !slot.isBreak,
          subject: slot.isBreak ? slot.breakType : 'Free',
          className: slot.isBreak ? 'BREAK' : ''
        }))
      })
      setTimetable(emptyTimetable)
      
      // Show user-friendly error message
      if (err.response?.status === 404) {
        console.log('Timetable not found - initializing empty timetable')
      } else {
        alert('Failed to load timetable. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (entry, day, timeSlot) => {
    if (entry.isBreak) return
    
    setEditingEntry({ ...entry, day, timeSlot })
    setFormData({
      subject: entry.subject || '',
      className: entry.className || '',
      room: entry.room || ''
    })
  }

  const handleSave = async () => {
    if (!facultyId) {
      alert('Faculty ID not found. Please log in again.')
      return
    }

    try {
      setLoading(true)
      
      // FIX: Use correct API endpoint
      const response = await api.post('/timetable/update', {
        _id: editingEntry._id?.startsWith('empty') ? null : editingEntry._id,
        facultyId: facultyId,
        day: editingEntry.day,
        timeSlot: editingEntry.timeSlot,
        ...formData
      })
      
      setEditingEntry(null)
      fetchTimetable()
      alert('Timetable updated successfully! Students will be notified via email.')
    } catch (err) {
      console.error('Error updating timetable:', err)
      console.error('Error details:', err.response?.data)
      alert('Error updating timetable: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (entryId) => {
    if (!entryId || entryId.startsWith('empty') || entryId.startsWith('break')) {
      return
    }
    
    if (!confirm('Are you sure you want to delete this entry? Students will be notified.')) return
    
    try {
      // FIX: Use correct API endpoint
      await api.delete(`/timetable/entry/${entryId}`)
      fetchTimetable()
      alert('Entry deleted successfully!')
    } catch (err) {
      console.error('Error deleting entry:', err)
      alert('Error deleting entry: ' + (err.response?.data?.message || err.message))
    }
  }

  const getCellContent = (day, timeSlot) => {
    const dayTimetable = timetable[day] || []
    const entry = Array.isArray(dayTimetable) 
      ? dayTimetable.find(e => e.timeSlot === timeSlot)
      : null
    
    if (!entry) {
      const slotInfo = timeSlots.find(s => s.slot === timeSlot)
      if (slotInfo?.isBreak) {
        return (
          <div className="text-center text-muted small p-1" style={{background: '#f8f9fa'}}>
            <div>{slotInfo.breakType}</div>
            <small>{slotInfo.start} - {slotInfo.end}</small>
          </div>
        )
      }
      return (
        <div 
          className="text-center text-muted small p-2 free-slot"
          onClick={() => handleEdit({isEmpty: true}, day, timeSlot)}
          style={{ cursor: 'pointer', height: '100%' }}
        >
          <div>Free</div>
          <small>Click to schedule</small>
        </div>
      )
    }
    
    if (entry.isBreak) {
      return (
        <div className="text-center text-muted small p-1" style={{background: '#f8f9fa'}}>
          <div>{entry.breakType}</div>
          <small>{entry.startTime} - {entry.endTime}</small>
        </div>
      )
    }
    
    if (entry.isEmpty || entry.subject === 'Free') {
      return (
        <div 
          className="text-center text-muted small p-2 free-slot"
          onClick={() => handleEdit(entry, day, timeSlot)}
          style={{ cursor: 'pointer', height: '100%' }}
        >
          <div>Free</div>
          <small>Click to schedule</small>
        </div>
      )
    }
    
    return (
      <div 
        className="p-2 class-slot"
        onClick={() => handleEdit(entry, day, timeSlot)}
        style={{ 
          cursor: 'pointer', 
          height: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '5px'
        }}
      >
        <div className="fw-bold">{entry.subject}</div>
        <small>{entry.className}</small>
        <br />
        <small>Room: {entry.room || 'N/A'}</small>
        {entry._id && !entry._id.startsWith('empty') && !entry._id.startsWith('break') && (
          <button 
            className="btn btn-sm btn-light mt-1"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(entry._id)
            }}
            style={{color: '#dc3545'}}
          >
            <i className="bi bi-trash"></i> Delete
          </button>
        )}
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="card shadow-lg">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading timetable...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error if no user data
  if (!facultyId) {
    return (
      <div className="container-fluid py-4">
        <div className="card shadow-lg">
          <div className="card-body text-center py-5">
            <i className="bi bi-exclamation-triangle display-4 text-warning mb-3"></i>
            <h4>Authentication Required</h4>
            <p className="text-muted mb-4">Please log in to access the timetable.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">
          <i className="bi bi-calendar-week me-2"></i>
          Faculty Timetable
        </h2>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/faculty')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </button>
      </div>

      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">
            <i className="bi bi-person me-2"></i>
            {facultyName}
          </h4>
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
                        style={{ minWidth: '150px', height: '120px', verticalAlign: 'middle' }}
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

      {/* Instructions */}
      <div className="alert alert-info mt-4">
        <h6><i className="bi bi-info-circle me-2"></i>How to use:</h6>
        <ul className="mb-0">
          <li>Click on "Free" slots to schedule a class</li>
          <li>Click on existing classes to edit them</li>
          <li>Students will receive email notifications for all changes</li>
          <li>Gray slots are break times and cannot be scheduled</li>
        </ul>
      </div>

      {/* Edit Modal */}
      {editingEntry && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingEntry._id?.startsWith('empty') || editingEntry.isEmpty ? 'Schedule Class' : 'Edit Class'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setEditingEntry(null)}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Day: {editingEntry.day}</label>
                  <br />
                  <label className="form-label">
                    Time: {editingEntry.startTime || timeSlots.find(s => s.slot === editingEntry.timeSlot)?.start} - {editingEntry.endTime || timeSlots.find(s => s.slot === editingEntry.timeSlot)?.end}
                  </label>
                </div>
                <div className="mb-3">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Enter subject name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Class *</label>
                  <select
                    className="form-select"
                    value={formData.className}
                    onChange={(e) => setFormData({...formData, className: e.target.value})}
                    required
                  >
                    <option value="">Select Class</option>
                    {classNames.map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Room</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    placeholder="Enter room number"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setEditingEntry(null)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={loading || !formData.subject || !formData.className}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}