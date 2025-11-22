import { useEffect, useState, useContext } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalUsers: 0,
    recentActivity: []
  })
  const [users, setUsers] = useState([])
  const [students, setStudents] = useState([])
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedUser, setSelectedUser] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [createMode, setCreateMode] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'Student',
    className: ''
  })
  const [profilePic, setProfilePic] = useState(null)
  const [uploading, setUploading] = useState(false)

  const currentUser = user?.user || user || {}

  useEffect(() => {
    if (currentUser.role !== 'Admin') {
      navigate('/dashboard')
      return
    }
    loadDashboardData()
    loadUsers()
    loadStudentsWithAttendance()
    loadFacultyWithFeedback()
  }, [currentUser.role, navigate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/admin/dashboard-stats')
      if (res.data.success) {
        setStats(res.data.stats)
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.')
        logout()
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.')
        navigate('/dashboard')
      } else {
        setError('Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setError('')
      const res = await api.get('/admin/users')
      if (res.data.success) {
        setUsers(res.data.users)
      }
    } catch (err) {
      console.error('Failed to load users:', err)
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.')
      } else {
        setError('Failed to load users')
      }
    }
  }

  const loadStudentsWithAttendance = async () => {
    try {
      const res = await api.get('/admin/students-attendance')
      if (res.data.success) {
        setStudents(res.data.students)
      }
    } catch (err) {
      console.error('Failed to load students with attendance:', err)
    }
  }

  const loadFacultyWithFeedback = async () => {
    try {
      const res = await api.get('/admin/faculty-feedback')
      if (res.data.success) {
        setFaculty(res.data.faculty)
      }
    } catch (err) {
      console.error('Failed to load faculty with feedback:', err)
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      username: user.username,
      className: user.className || '',
      role: user.role,
      profilePic: user.profilePic || ''
    })
    setEditMode(true)
    setCreateMode(false)
    setProfilePic(null)
  }

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePic(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setEditForm(prev => ({ ...prev, profilePic: previewUrl }))
    }
  }

  const uploadProfilePicture = async (userId) => {
    if (!profilePic) return null

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('profilePic', profilePic)

      const response = await api.post(`/admin/users/${userId}/profile-pic`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data.profilePic
    } catch (error) {
      console.error('Profile picture upload failed:', error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateUser = async () => {
    try {
      setError('')
      setUploading(true)

      let updatedProfilePic = selectedUser.profilePic

      // Upload new profile picture if selected
      if (profilePic) {
        const newProfilePic = await uploadProfilePicture(selectedUser._id)
        if (newProfilePic) {
          updatedProfilePic = newProfilePic
        }
      }

      const updateData = {
        ...editForm,
        profilePic: updatedProfilePic
      }

      const res = await api.put(`/admin/users/${selectedUser._id}`, updateData)
      if (res.data.success) {
        setSuccess('User updated successfully!')
        await loadUsers()
        await loadStudentsWithAttendance()
        await loadFacultyWithFeedback()
        setEditMode(false)
        setSelectedUser(null)
        setProfilePic(null)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      console.error('Update error:', err)
      setError(err.response?.data?.message || 'Failed to update user')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setError('')
        const res = await api.delete(`/admin/users/${userId}`)
        if (res.data.success) {
          setSuccess('User deleted successfully!')
          await loadUsers()
          await loadStudentsWithAttendance()
          await loadFacultyWithFeedback()
          setTimeout(() => setSuccess(''), 3000)
        }
      } catch (err) {
        console.error('Delete error:', err)
        setError(err.response?.data?.message || 'Failed to delete user')
      }
    }
  }

  const handleCreateUser = async () => {
    try {
      setError('')
      const res = await api.post('/admin/users', newUser)
      if (res.data.success) {
        setSuccess('User created successfully!')
        setNewUser({
          name: '',
          email: '',
          username: '',
          password: '',
          role: 'Student',
          className: ''
        })
        setCreateMode(false)
        await loadUsers()
        await loadStudentsWithAttendance()
        await loadFacultyWithFeedback()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      console.error('Create error:', err)
      setError(err.response?.data?.message || 'Failed to create user')
    }
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      Admin: { class: 'danger', icon: 'bi-shield-check' },
      Faculty: { class: 'warning', icon: 'bi-person-badge' },
      Student: { class: 'success', icon: 'bi-person' }
    }
    const config = roleConfig[role] || { class: 'secondary', icon: 'bi-person' }
    
    return (
      <span className={`badge bg-${config.class} bg-opacity-10 text-${config.class} px-3 py-2`}>
        <i className={`bi ${config.icon} me-1`}></i>
        {role}
      </span>
    )
  }

  const getStatusBadge = (isOnline) => {
    return isOnline ? (
      <span className="badge bg-success bg-opacity-10 text-success px-2 py-1">
        <i className="bi bi-circle-fill me-1" style={{ fontSize: '6px' }}></i>
        Online
      </span>
    ) : (
      <span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1">
        <i className="bi bi-circle me-1" style={{ fontSize: '6px' }}></i>
        Offline
      </span>
    )
  }

  const getAttendanceBadge = (percentage) => {
    if (percentage >= 90) return 'success'
    if (percentage >= 75) return 'warning'
    return 'danger'
  }

  const getRatingBadge = (rating) => {
    if (rating >= 4) return 'success'
    if (rating >= 3) return 'warning'
    return 'danger'
  }

  const refreshData = () => {
    loadDashboardData()
    loadUsers()
    loadStudentsWithAttendance()
    loadFacultyWithFeedback()
  }

  const renderProfilePicture = (user, size = 40) => {
    if (user.profilePic) {
      return (
        <img
          src={`http://localhost:5000/${user.profilePic}`}
          alt="Profile"
          className="rounded-circle border border-2 border-white shadow"
          style={{ 
            width: `${size}px`, 
            height: `${size}px`, 
            objectFit: 'cover' 
          }}
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling?.classList.remove('d-none')
          }}
        />
      )
    }
    
    return (
      <div
        className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white border border-2 border-white shadow"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          fontSize: `${size * 0.4}px` 
        }}
      >
        {user.name?.charAt(0).toUpperCase() || 'U'}
      </div>
    )
  }

  if (currentUser.role !== 'Admin') {
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <div className="alert alert-danger">
            <h4>Access Denied</h4>
            <p>You don't have permission to access the admin dashboard.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      {/* Main Content */}
      <div className="container-fluid py-4" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}>
        <div className="container">
          
          {/* Header Section */}
          <div className="card border-0 shadow-lg mb-4 overflow-hidden">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="position-relative">
                    {renderProfilePicture(currentUser, 100)}
                    {/* Online Indicator */}
                    <span className="position-absolute bottom-0 end-0 bg-success border border-3 border-white rounded-circle"
                      style={{ width: '20px', height: '20px' }}></span>
                  </div>
                </div>
                <div className="col">
                  <h2 className="fw-bold text-gradient mb-2">Admin Dashboard</h2>
                  <p className="text-muted mb-3">
                    <i className="bi bi-person-gear me-2"></i>
                    Welcome back, {currentUser.name}! Manage your institution efficiently.
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    {getRoleBadge('Admin')}
                    <span className="badge bg-info bg-opacity-10 text-info px-3 py-2">
                      <i className="bi bi-clock me-1"></i>
                      Last login: {new Date().toLocaleDateString()}
                    </span>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={refreshData}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle me-2"></i>
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="icon-wrapper bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '70px', height: '70px' }}>
                    <i className="bi bi-people display-6 text-primary"></i>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{stats.totalUsers}</h3>
                  <p className="text-muted mb-0">Total Users</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="icon-wrapper bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '70px', height: '70px' }}>
                    <i className="bi bi-person display-6 text-success"></i>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{stats.totalStudents}</h3>
                  <p className="text-muted mb-0">Students</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="icon-wrapper bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '70px', height: '70px' }}>
                    <i className="bi bi-person-badge display-6 text-warning"></i>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{stats.totalFaculty}</h3>
                  <p className="text-muted mb-0">Faculty</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="icon-wrapper bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '70px', height: '70px' }}>
                    <i className="bi bi-activity display-6 text-info"></i>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">{stats.recentActivity.length}</h3>
                  <p className="text-muted mb-0">Recent Activities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="card border-0 shadow-lg mb-4">
            <div className="card-header bg-white border-0">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                  >
                    <i className="bi bi-people me-2"></i>
                    Manage Users
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                  >
                    <i className="bi bi-person me-2"></i>
                    Students
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'faculty' ? 'active' : ''}`}
                    onClick={() => setActiveTab('faculty')}
                  >
                    <i className="bi bi-person-badge me-2"></i>
                    Faculty
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="row">
                  <div className="col-md-8">
                    <h5 className="fw-bold mb-3">Recent Activity</h5>
                    {stats.recentActivity.length > 0 ? (
                      <div className="list-group">
                        {stats.recentActivity.map((activity, index) => (
                          <div key={index} className="list-group-item border-0">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-circle-fill text-success me-2" style={{ fontSize: '6px' }}></i>
                              <span>{activity.message}</span>
                              <small className="text-muted ms-auto">{activity.time}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">No recent activity</p>
                    )}
                  </div>
                  <div className="col-md-4">
                    <h5 className="fw-bold mb-3">Quick Actions</h5>
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-primary" 
                        onClick={() => {
                          setActiveTab('users')
                          setCreateMode(true)
                        }}
                      >
                        <i className="bi bi-person-plus me-2"></i>
                        Add New User
                      </button>
                      <button className="btn btn-outline-primary">
                        <i className="bi bi-download me-2"></i>
                        Export Reports
                      </button>
                      <button className="btn btn-outline-secondary">
                        <i className="bi bi-gear me-2"></i>
                        System Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Management Tab */}
              {activeTab === 'users' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">User Management</h5>
                    <div>
                      <button 
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => {
                          setCreateMode(true)
                          setEditMode(false)
                        }}
                      >
                        <i className="bi bi-person-plus me-1"></i>
                        Add User
                      </button>
                      <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={loadUsers}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Refresh
                      </button>
                    </div>
                  </div>
                  
                  {createMode ? (
                    <div className="card border-primary mb-4">
                      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Create New User</h6>
                        <button 
                          className="btn btn-sm btn-light"
                          onClick={() => setCreateMode(false)}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Name *</label>
                            <input 
                              type="text" 
                              className="form-control"
                              value={newUser.name}
                              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Email *</label>
                            <input 
                              type="email" 
                              className="form-control"
                              value={newUser.email}
                              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Username *</label>
                            <input 
                              type="text" 
                              className="form-control"
                              value={newUser.username}
                              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Password *</label>
                            <input 
                              type="password" 
                              className="form-control"
                              value={newUser.password}
                              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Role *</label>
                            <select 
                              className="form-control"
                              value={newUser.role}
                              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                            >
                              <option value="Student">Student</option>
                              <option value="Faculty">Faculty</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </div>
                          {newUser.role === 'Student' && (
                            <div className="col-md-6">
                              <label className="form-label">Class *</label>
                              <select 
                                className="form-control"
                                value={newUser.className}
                                onChange={(e) => setNewUser({...newUser, className: e.target.value})}
                              >
                                <option value="">Select Class</option>
                                {[
                                  'E1 CSE-A', 'E1 CSE-B', 'E1 CSE-C', 'E1 CSE-D',
                                  'E2 CSE-A', 'E2 CSE-B', 'E2 CSE-C', 'E2 CSE-D',
                                  'E3 CSE-A', 'E3 CSE-B', 'E3 CSE-C', 'E3 CSE-D',
                                  'E4 CSE-A', 'E4 CSE-B', 'E4 CSE-C', 'E4 CSE-D'
                                ].map(cls => (
                                  <option key={cls} value={cls}>{cls}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                        <div className="mt-3">
                          <button 
                            className="btn btn-success me-2" 
                            onClick={handleCreateUser}
                            disabled={!newUser.name || !newUser.email || !newUser.username || !newUser.password}
                          >
                            <i className="bi bi-check me-1"></i>
                            Create User
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => setCreateMode(false)}
                          >
                            <i className="bi bi-x me-1"></i>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : editMode ? (
                    <div className="card border-primary mb-4">
                      <div className="card-header bg-primary text-white">
                        <h6 className="mb-0">Edit User: {selectedUser?.name}</h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          {/* Profile Picture Upload */}
                          <div className="col-12">
                            <label className="form-label">Profile Picture</label>
                            <div className="d-flex align-items-center gap-3">
                              {renderProfilePicture(editForm, 80)}
                              <div>
                                <input 
                                  type="file" 
                                  className="form-control"
                                  accept="image/*"
                                  onChange={handleProfilePicChange}
                                />
                                <small className="text-muted">Select a new profile picture (optional)</small>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-md-6">
                            <label className="form-label">Name</label>
                            <input 
                              type="text" 
                              className="form-control"
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Email</label>
                            <input 
                              type="email" 
                              className="form-control"
                              value={editForm.email}
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Username</label>
                            <input 
                              type="text" 
                              className="form-control"
                              value={editForm.username}
                              onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Role</label>
                            <select 
                              className="form-control"
                              value={editForm.role}
                              onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                            >
                              <option value="Student">Student</option>
                              <option value="Faculty">Faculty</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </div>
                          {editForm.role === 'Student' && (
                            <div className="col-12">
                              <label className="form-label">Class</label>
                              <select 
                                className="form-control"
                                value={editForm.className}
                                onChange={(e) => setEditForm({...editForm, className: e.target.value})}
                              >
                                <option value="">Select Class</option>
                                {[
                                  'E1 CSE-A', 'E1 CSE-B', 'E1 CSE-C', 'E1 CSE-D',
                                  'E2 CSE-A', 'E2 CSE-B', 'E2 CSE-C', 'E2 CSE-D',
                                  'E3 CSE-A', 'E3 CSE-B', 'E3 CSE-C', 'E3 CSE-D',
                                  'E4 CSE-A', 'E4 CSE-B', 'E4 CSE-C', 'E4 CSE-D'
                                ].map(cls => (
                                  <option key={cls} value={cls}>{cls}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                        <div className="mt-3">
                          <button 
                            className="btn btn-success me-2" 
                            onClick={handleUpdateUser}
                            disabled={uploading}
                          >
                            {uploading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                Updating...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check me-1"></i>
                                Save Changes
                              </>
                            )}
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => setEditMode(false)}
                            disabled={uploading}
                          >
                            <i className="bi bi-x me-1"></i>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Profile</th>
                          <th>User</th>
                          <th>Role</th>
                          <th>Class</th>
                          <th>Status</th>
                          <th>Last Active</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user._id}>
                            <td>
                              {renderProfilePicture(user, 40)}
                            </td>
                            <td>
                              <div>
                                <div className="fw-bold">{user.name}</div>
                                <small className="text-muted">{user.email}</small>
                              </div>
                            </td>
                            <td>{getRoleBadge(user.role)}</td>
                            <td>
                              {user.className ? (
                                <span className="badge bg-info bg-opacity-10 text-info">
                                  {user.className}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>{getStatusBadge(user.isOnline)}</td>
                            <td>
                              <small className="text-muted">
                                {new Date(user.lastSeen).toLocaleDateString()}
                              </small>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDeleteUser(user._id)}
                                  disabled={user._id === currentUser._id}
                                  title={user._id === currentUser._id ? "Cannot delete your own account" : "Delete user"}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Students Tab with Attendance */}
              {activeTab === 'students' && (
                <div>
                  <h5 className="fw-bold mb-3">Students with Attendance</h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Profile</th>
                          <th>Student</th>
                          <th>Class</th>
                          <th>Attendance %</th>
                          <th>Status</th>
                          <th>Last Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(student => (
                          <tr key={student._id}>
                            <td>
                              {renderProfilePicture(student, 40)}
                            </td>
                            <td>
                              <div>
                                <div className="fw-bold">{student.name}</div>
                                <small className="text-muted">{student.email}</small>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info bg-opacity-10 text-info">
                                {student.className}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress" style={{ width: '80px', height: '8px' }}>
                                  <div 
                                    className={`progress-bar bg-${getAttendanceBadge(student.attendancePercentage || 0)}`}
                                    style={{ width: `${student.attendancePercentage || 0}%` }}
                                  ></div>
                                </div>
                                <span className={`badge bg-${getAttendanceBadge(student.attendancePercentage || 0)}`}>
                                  {student.attendancePercentage || 0}%
                                </span>
                              </div>
                            </td>
                            <td>{getStatusBadge(student.isOnline)}</td>
                            <td>
                              <small className="text-muted">
                                {new Date(student.lastSeen).toLocaleDateString()}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Faculty Tab with Feedback */}
              {activeTab === 'faculty' && (
                <div>
                  <h5 className="fw-bold mb-3">Faculty with Feedback Ratings</h5>
                  {faculty.length === 0 ? (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      No faculty data available.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Profile</th>
                            <th>Faculty</th>
                            <th>Average Rating</th>
                            <th>Total Reviews</th>
                            <th>Status</th>
                            <th>Last Active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {faculty.map(facultyMember => {
                            // Ensure averageRating is a number
                            const avgRating = typeof facultyMember.averageRating === 'number' 
                              ? facultyMember.averageRating 
                              : parseFloat(facultyMember.averageRating) || 0
                            
                            return (
                              <tr key={facultyMember._id}>
                                <td>
                                  {renderProfilePicture(facultyMember, 40)}
                                </td>
                                <td>
                                  <div>
                                    <div className="fw-bold">{facultyMember.name}</div>
                                    <small className="text-muted">{facultyMember.email}</small>
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <div className="star-rating">
                                      {[...Array(5)].map((_, i) => (
                                        <i
                                          key={i}
                                          className={`bi ${
                                            i < avgRating ? 'bi-star-fill text-warning' : 'bi-star text-muted'
                                          }`}
                                        ></i>
                                      ))}
                                    </div>
                                    <span className={`badge bg-${getRatingBadge(avgRating)}`}>
                                      {avgRating.toFixed(1)}/5
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-primary">
                                    {facultyMember.totalReviews || 0} reviews
                                  </span>
                                </td>
                                <td>{getStatusBadge(facultyMember.isOnline)}</td>
                                <td>
                                  <small className="text-muted">
                                    {new Date(facultyMember.lastSeen).toLocaleDateString()}
                                  </small>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

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
        
        .bg-gradient-admin {
          background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%) !important;
        }
        
        .icon-wrapper {
          transition: all 0.3s ease;
        }
        
        .card:hover .icon-wrapper {
          transform: scale(1.1);
        }
        
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          font-weight: 500;
        }
        
        .nav-tabs .nav-link.active {
          border-bottom: 3px solid #667eea;
          color: #667eea;
          background: transparent;
        }
        
        .star-rating {
          font-size: 0.9rem;
        }
        
        .progress {
          background-color: #e9ecef;
        }
      `}</style>
    </>
  )
}