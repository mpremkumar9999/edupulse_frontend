import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'Student',
    className: ''
  })
  const [profileFile, setProfileFile] = useState(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [registeredUser, setRegisteredUser] = useState(null)
  const [otpTimer, setOtpTimer] = useState(0)
  const navigate = useNavigate()
  const { login } = useAuth() // Use auth context for auto-login

  // OTP Timer Effect
  useEffect(() => {
    let interval
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [otpTimer])

  const startOtpTimer = () => {
    setOtpTimer(300) // 5 minutes in seconds
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleRoleChange = (e) => {
    const newRole = e.target.value
    setForm({ 
      ...form, 
      role: newRole,
      className: newRole === 'Student' ? form.className : '' // Clear className for non-students
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('username', form.username)
      fd.append('email', form.email)
      fd.append('password', form.password)
      fd.append('role', form.role)
      
      // Only append className for Students
      if (form.role === 'Student') {
        fd.append('className', form.className)
      }
      
      if (profileFile) fd.append('profilePic', profileFile)

      const res = await api.post('/auth/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.data.success) {
        setMessage('success')
        setRegisteredUser({
          email: form.email,
          name: form.name,
          userId: res.data.userId,
          role: form.role // Include role for redirection
        })
        setShowOtpModal(true)
        startOtpTimer()
      }
      
    } catch (err) {
      console.error('Registration error:', err)
      const errorMsg = err?.response?.data?.message || 'Registration failed'
      setMessage(`error:${errorMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpVerification = async (e) => {
    e.preventDefault()
    setIsVerifying(true)
    setMessage('')
    
    try {
      const res = await api.post('/auth/verify-otp', {
        email: registeredUser.email,
        otp: otp
      })

      if (res.data.success) {
        setMessage('verified')
        
        // Auto-login user after successful verification
        if (res.data.token && res.data.user) {
          // Store user data in context/localStorage
          login({ 
            user: res.data.user, 
            token: res.data.token 
          })
          
          localStorage.setItem('user', JSON.stringify({
            ...res.data.user,
            token: res.data.token
          }))

          // Redirect to respective dashboard based on role
          setTimeout(() => {
            const userRole = res.data.user.role || registeredUser.role
            if (userRole === 'Student') navigate('/student')
            else if (userRole === 'Faculty') navigate('/faculty')
            else if (userRole === 'Admin') navigate('/admin')
            else navigate('/dashboard') // Fallback
          }, 2000)
        } else {
          // If no auto-login data, redirect to login page
          setTimeout(() => {
            navigate('/login')
          }, 2000)
        }
      }
      
    } catch (err) {
      console.error('OTP verification error:', err)
      const errorMsg = err?.response?.data?.message || 'OTP verification failed'
      setMessage(`otp-error:${errorMsg}`)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      const res = await api.post('/auth/resend-otp', {
        email: registeredUser.email
      })

      if (res.data.success) {
        setMessage('otp-resent')
        setOtpTimer(300) // Reset timer to 5 minutes
        setOtp('') // Clear previous OTP input
      }
    } catch (err) {
      console.error('Resend OTP error:', err)
      const errorMsg = err?.response?.data?.message || 'Failed to resend OTP'
      setMessage(`otp-resend-error:${errorMsg}`)
    }
  }

  const closeOtpModal = () => {
    setShowOtpModal(false)
    setOtp('')
    setMessage('')
    setOtpTimer(0)
  }

  return (
    <div className="container-fluid py-4 register-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            
            {/* Registration Card */}
            <div className="card border-0 shadow-lg register-card">
              <div className="card-body p-4 p-md-5">
                
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="icon-wrapper bg-primary-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                    <i className="bi bi-person-plus display-4 text-white"></i>
                  </div>
                  <h1 className="display-6 fw-bold text-primary mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-muted fs-6">
                    Join our educational platform and start your learning journey
                  </p>
                </div>

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  
                  {/* Name Field */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark fs-6">
                      <i className="bi bi-person me-2 text-primary"></i>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-1 shadow-sm input-field"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Username Field */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark fs-6">
                      <i className="bi bi-person-badge me-2 text-primary"></i>
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-1 shadow-sm input-field"
                      required
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="Choose a unique username"
                    />
                    <div className="form-text text-muted fs-7">
                      This will be your unique identifier on the platform
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark fs-6">
                      <i className="bi bi-envelope me-2 text-primary"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg border-1 shadow-sm input-field"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Enter your email address"
                    />
                    <div className="form-text text-muted fs-7">
                      We'll send a verification code to this email
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark fs-6">
                      <i className="bi bi-lock me-2 text-primary"></i>
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg border-1 shadow-sm input-field"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Create a strong password"
                    />
                  </div>

                  {/* Role Selection */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark fs-6">
                      <i className="bi bi-person-badge me-2 text-primary"></i>
                      I am a
                    </label>
                    <select
                      className="form-select border-1 shadow-sm input-field"
                      value={form.role}
                      onChange={handleRoleChange}
                    >
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>

                  {/* Class Selection (only for Students) */}
                  {form.role === 'Student' && (
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-dark fs-6">
                        <i className="bi bi-people me-2 text-primary"></i>
                        Class
                      </label>
                      <select
                        className="form-select border-1 shadow-sm input-field"
                        required
                        value={form.className}
                        onChange={(e) => setForm({ ...form, className: e.target.value })}
                      >
                        <option value="">Select Your Class</option>
                        <option value="E1 CSE-A">E1 CSE-A</option>
                        <option value="E1 CSE-B">E1 CSE-B</option>
                        <option value="E1 CSE-C">E1 CSE-C</option>
                        <option value="E1 CSE-D">E1 CSE-D</option>
                        <option value="E2 CSE-A">E2 CSE-A</option>
                        <option value="E2 CSE-B">E2 CSE-B</option>
                        <option value="E2 CSE-C">E2 CSE-C</option>
                        <option value="E2 CSE-D">E2 CSE-D</option>
                        <option value="E3 CSE-A">E3 CSE-A</option>
                        <option value="E3 CSE-B">E3 CSE-B</option>
                        <option value="E3 CSE-C">E3 CSE-C</option>
                        <option value="E3 CSE-D">E3 CSE-D</option>
                        <option value="E4 CSE-A">E4 CSE-A</option>
                        <option value="E4 CSE-B">E4 CSE-B</option>
                        <option value="E4 CSE-C">E4 CSE-C</option>
                        <option value="E4 CSE-D">E4 CSE-D</option>
                      </select>
                    </div>
                  )}

                  {/* Role Description for Faculty and Admin */}
                  {form.role === 'Faculty' && (
                    <div className="mb-4">
                      <div className="alert alert-info border-0 faculty-alert">
                        <i className="bi bi-person-check me-2"></i>
                        <strong>Faculty Account</strong>
                        <p className="mb-0 mt-1 small">
                          As faculty, you'll be able to create and manage course content, assignments, and interact with students across different classes.
                        </p>
                      </div>
                    </div>
                  )}

                  {form.role === 'Admin' && (
                    <div className="mb-4">
                      <div className="alert alert-warning border-0 admin-alert">
                        <i className="bi bi-shield-check me-2"></i>
                        <strong>Administrator Account</strong>
                        <p className="mb-0 mt-1 small">
                          As an administrator, you'll have full access to manage users, content, and system settings.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Profile Picture Upload */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark fs-6">
                      <i className="bi bi-camera me-2 text-primary"></i>
                      Profile Picture
                    </label>
                    <div className="card border-dashed border-2 border-light-subtle shadow-sm upload-card">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-cloud-arrow-up display-4 text-muted mb-3 d-block"></i>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control d-none"
                          id="profileFile"
                          onChange={(e) => setProfileFile(e.target.files[0])}
                        />
                        <label htmlFor="profileFile" className="btn btn-outline-primary mb-2 upload-btn" style={{ cursor: 'pointer' }}>
                          <i className="bi bi-upload me-2"></i>
                          Choose Profile Picture
                        </label>
                        {profileFile && (
                          <div className="mt-2">
                            <span className="badge bg-success bg-opacity-10 text-success file-badge">
                              <i className="bi bi-check-circle me-1"></i>
                              {profileFile.name}
                            </span>
                          </div>
                        )}
                        <div className="form-text text-muted mt-2 fs-7">
                          Optional: JPG, PNG, or GIF (Max: 5MB)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid mb-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg py-3 fw-semibold submit-btn"
                      disabled={
                        isSubmitting || 
                        !form.name || 
                        !form.username || 
                        !form.email || 
                        !form.password || 
                        (form.role === 'Student' && !form.className)
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          Create Account
                        </>
                      )}
                    </button>
                  </div>

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="text-muted mb-0 fs-6">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary fw-semibold text-decoration-none login-link">
                        <i className="bi bi-box-arrow-in-right me-1"></i>
                        Login here
                      </Link>
                    </p>
                  </div>
                </form>

                {/* Success Message */}
                {message === 'success' && (
                  <div className="alert alert-success border-0 shadow-sm mt-4 success-alert" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success fs-4 me-3"></i>
                      <div>
                        <h5 className="alert-heading mb-1">Registration Successful!</h5>
                        <p className="mb-0">Please check your email for verification code.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {message.startsWith('error') && (
                  <div className="alert alert-danger border-0 shadow-sm mt-4 error-alert" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle-fill text-danger fs-4 me-3"></i>
                      <div>
                        <h5 className="alert-heading mb-1">Registration Failed</h5>
                        <p className="mb-0">{message.split(':')[1] || 'Please check your information and try again.'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="modal show d-block modal-overlay">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg otp-modal">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">
                  <i className="bi bi-shield-check me-2"></i>
                  Verify Your Email
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeOtpModal}
                  disabled={isVerifying}
                ></button>
              </div>
              
              <div className="modal-body pt-0">
                <div className="text-center mb-4">
                  <i className="bi bi-envelope-check display-4 text-primary mb-3 d-block"></i>
                  <h6 className="fw-bold">Almost there, {registeredUser?.name}!</h6>
                  <p className="text-muted mb-3">
                    We've sent a 6-digit verification code to:<br />
                    <strong className="text-dark">{registeredUser?.email}</strong>
                  </p>
                  
                  {/* OTP Timer */}
                  {otpTimer > 0 && (
                    <div className="alert alert-warning py-2 d-inline-flex align-items-center timer-alert">
                      <i className="bi bi-clock me-2"></i>
                      <small>Code expires in: <strong>{formatTime(otpTimer)}</strong></small>
                    </div>
                  )}
                  
                  {otpTimer === 0 && (
                    <div className="alert alert-danger py-2 d-inline-flex align-items-center expired-alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      <small>Code has expired. Please request a new one.</small>
                    </div>
                  )}
                </div>

                <form onSubmit={handleOtpVerification}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Enter Verification Code</label>
                    <input
                      type="text"
                      className="form-control form-control-lg text-center fw-bold fs-4 otp-input"
                      placeholder="000000"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      required
                      disabled={otpTimer === 0}
                    />
                    <div className="form-text text-center">
                      Enter the 6-digit code from your email
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg py-3 verify-btn"
                      disabled={isVerifying || otp.length !== 6 || otpTimer === 0}
                    >
                      {isVerifying ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Verify & Continue to Dashboard
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-outline-secondary resend-btn"
                      onClick={handleResendOtp}
                      disabled={isVerifying || otpTimer > 240} // Can resend after 1 minute
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      {otpTimer > 240 ? `Resend in ${formatTime(otpTimer - 240)}` : 'Resend Code'}
                    </button>
                  </div>
                </form>

                {/* Status Messages */}
                {message.startsWith('verified') && (
                  <div className="alert alert-success border-0 mt-3 verified-alert" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>Email verified successfully! Redirecting to your dashboard...</span>
                    </div>
                  </div>
                )}

                {message.startsWith('otp-error') && (
                  <div className="alert alert-danger border-0 mt-3 otp-error-alert" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                      <span>{message.split(':')[1] || 'Invalid verification code'}</span>
                    </div>
                  </div>
                )}

                {message === 'otp-resent' && (
                  <div className="alert alert-info border-0 mt-3 otp-resent-alert" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-info-circle-fill text-info me-2"></i>
                      <span>New verification code sent to your email.</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer border-0 text-center pt-0">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Didn't receive the code? Check your spam folder or try resending.
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
  /* ---------- COLOR VARIABLES ---------- */
  :root {
    --primary-color: #2563eb;
    --primary-dark: #1d4ed8;
    --primary-light: #3b82f6;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --dark-color: #1e293b;
    --light-color: #f8fafc;
    --border-color: #e2e8f0;
    --shadow-color: rgba(30, 41, 59, 0.1);
  }

  /* ---------- CONTAINER ---------- */
  .register-container {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
  }

  /* ---------- CARD ---------- */
  .register-card {
    background: var(--light-color);
    border-radius: 16px;
    backdrop-filter: blur(10px);
  }

  /* ---------- GRADIENTS ---------- */
  .bg-primary-gradient {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%) !important;
  }

  /* ---------- INPUT FIELDS ---------- */
  .input-field {
    background-color: #ffffff !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px;
    color: var(--dark-color);
    transition: all 0.3s ease;
  }

  .input-field:focus {
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
    border-color: var(--primary-color) !important;
    background-color: #ffffff !important;
    transform: translateY(-1px);
  }

  /* ---------- BUTTONS ---------- */
  .submit-btn {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border: none;
    color: white;
    border-radius: 8px;
    transition: all 0.3s ease;
    font-weight: 600;
  }

  .submit-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
  }

  .submit-btn:disabled {
    background: #94a3b8 !important;
    border-color: #94a3b8 !important;
    cursor: not-allowed;
    transform: none;
  }

  .verify-btn {
    background: linear-gradient(135deg, var(--success-color) 0%, #059669 100%);
    border: none;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .verify-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);
  }

  /* ---------- UPLOAD SECTION ---------- */
  .upload-card {
    background: #f8fafc;
    border-color: #cbd5e1 !important;
    transition: all 0.3s ease;
  }

  .upload-card:hover {
    border-color: var(--primary-color) !important;
    background: #f1f5f9;
  }

  .upload-btn {
    border-radius: 6px;
    border-width: 1px;
    transition: all 0.3s ease;
  }

  .upload-btn:hover {
    background-color: var(--primary-color);
    color: white;
    transform: translateY(-1px);
  }

  .file-badge {
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 0.75rem;
  }

  /* ---------- ALERTS ---------- */
  .faculty-alert {
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
    color: #1e40af;
    border-left: 4px solid var(--primary-color);
  }

  .admin-alert {
    background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
    color: #92400e;
    border-left: 4px solid var(--warning-color);
  }

  .success-alert {
    background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%);
    border-left: 4px solid var(--success-color);
  }

  .error-alert {
    background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
    border-left: 4px solid var(--danger-color);
  }

  .timer-alert {
    background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
    border: 1px solid #fbbf24;
    border-radius: 8px;
  }

  .expired-alert {
    background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
    border: 1px solid var(--danger-color);
    border-radius: 8px;
  }

  /* ---------- MODAL ---------- */
  .modal-overlay {
    background-color: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(4px);
  }

  .otp-modal {
    border-radius: 16px;
    overflow: hidden;
  }

  /* ---------- OTP INPUT ---------- */
  .otp-input {
    letter-spacing: 0.5em;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .otp-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    background: white;
    transform: translateY(-1px);
  }

  .otp-input:disabled {
    background-color: #e2e8f0;
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* ---------- LINKS ---------- */
  .login-link {
    transition: all 0.3s ease;
    position: relative;
  }

  .login-link:hover {
    color: var(--primary-dark) !important;
    text-decoration: underline !important;
  }

  /* ---------- ICONS ---------- */
  .icon-wrapper {
    width: 80px;
    height: 80px;
    transition: all 0.3s ease;
  }

  .icon-wrapper:hover {
    transform: scale(1.05) rotate(5deg);
  }

  /* ---------- RESPONSIVE DESIGN ---------- */
  @media (max-width: 768px) {
    .register-container {
      padding: 20px 0;
    }
    
    .register-card {
      margin: 0 10px;
    }
    
    .card-body {
      padding: 2rem !important;
    }
    
    .display-6 {
      font-size: 1.8rem;
    }
  }

  @media (max-width: 576px) {
    .card-body {
      padding: 1.5rem !important;
    }
    
    .btn-lg {
      padding: 12px 20px;
      font-size: 1rem;
    }
  }

  /* ---------- ANIMATIONS ---------- */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .register-card {
    animation: fadeIn 0.6s ease-out;
  }

  .otp-modal {
    animation: fadeIn 0.4s ease-out;
  }
  /* Your existing CSS styles remain the same */
        .register-container {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
        }
        
        .register-card {
          background: var(--light-color);
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }
`}</style>
    </div>
  )
}