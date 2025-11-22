import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import '../css/Login.css' // We'll create a separate CSS file

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      const { token, user } = res.data

      login({ user, token })
      setMessage('✅ Login successful! Redirecting...')

      setTimeout(() => {
        if (user.role === 'Student') navigate('/student')
        else if (user.role === 'Faculty') navigate('/faculty')
        else if (user.role === 'Admin') navigate('/admin')
      }, 1000)
    } catch (err) {
      setMessage('❌ Invalid username or password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-grid">
          {/* Left Side - Hero Section */}
          <div className="login-hero">
            <div className="hero-background">
              <div className="hero-overlay"></div>
              <div className="floating-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
              </div>
            </div>
            <div className="hero-content">
              <div className="university-hero">
                <div className="hero-logo">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h1>RKVALLEY University</h1>
                <p className="hero-tagline">Shaping Future Leaders Since 2009</p>
              </div>
              
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">15,000+</div>
                  <div className="stat-label">Students</div>
                </div>
                <div className="stat">
                  <div className="stat-number">200+</div>
                  <div className="stat-label">Programs</div>
                </div>
                <div className="stat">
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Placement</div>
                </div>
              </div>

              <div className="hero-features">
                <div className="feature">
                  <i className="fas fa-award"></i>
                  <span>Accredited Programs</span>
                </div>
                <div className="feature">
                  <i className="fas fa-globe"></i>
                  <span>Global Recognition</span>
                </div>
                <div className="feature">
                  <i className="fas fa-rocket"></i>
                  <span>Innovation Focus</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="login-form-section">
            <div className="form-wrapper">
              {/* Header */}
              <div className="form-header">
                <div className="form-logo">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h2>Welcome Back</h2>
                <p>Sign in to your account</p>
              </div>

              {/* Alert Message */}
              {message && (
                <div className={`alert-message ${message.includes('✅') ? 'success' : 'error'}`}>
                  <i className={`fas ${message.includes('✅') ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                  <span>{message}</span>
                  <button onClick={() => setMessage('')} className="alert-close">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}

              {/* Login Form */}
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username">
                    <i className="fas fa-user"></i>
                    Username
                  </label>
                  <div className="input-container">
                    <input
                      type="text"
                      id="username"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="Enter your username"
                      required
                    />
                    <i className="input-icon fas fa-user-circle"></i>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    <i className="fas fa-lock"></i>
                    Password
                  </label>
                  <div className="input-container">
                    <input
                      type="password"
                      id="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                    />
                    <i className="input-icon fas fa-key"></i>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    Remember me
                  </label>
                  <a href="/forgot-password" className="forgot-link">
                    Forgot Password?
                  </a>
                </div>

                <button 
                  type="submit" 
                  className={`login-button ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="button-spinner"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt"></i>
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="register-link">
                <p>Don't have an account? <a href="/register">Create Account</a></p>
              </div>

              {/* Security Badge */}
              <div className="security-badge">
                <i className="fas fa-shield-alt"></i>
                <span>Secured Login</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="quick-links">
              <div className="links-grid">
                <a href="/about" className="quick-link">
                  <i className="fas fa-info-circle"></i>
                  About
                </a>
                <a href="/admissions" className="quick-link">
                  <i className="fas fa-file-alt"></i>
                  Admissions
                </a>
                <a href="/contact" className="quick-link">
                  <i className="fas fa-phone"></i>
                  Contact
                </a>
                <a href="/campus" className="quick-link">
                  <i className="fas fa-map-marker-alt"></i>
                  Campus
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>RK Valley Vempalli</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>+91 987654321</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>info@rguktrkv.ac.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
