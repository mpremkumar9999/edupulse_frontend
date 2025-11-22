import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const CreateAssignment = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [className, setClassName] = useState('')
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const motivationalQuotes = [
    "Education is not the filling of a pail, but the lighting of a fire. - William Butler Yeats",
    "The art of teaching is the art of assisting discovery. - Mark Van Doren",
    "A well-designed assignment can inspire creativity and critical thinking in students.",
    "Great assignments challenge students to grow beyond their current capabilities.",
    "The best learning happens when students are engaged and motivated by meaningful tasks.",
    "Your assignment could be the spark that ignites a student's passion for learning."
  ]

  const [currentQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])

  // ✅ All valid class options (matches backend)
  const classOptions = [
    'E1 CSE-A', 'E1 CSE-B', 'E1 CSE-C', 'E1 CSE-D',
    'E2 CSE-A', 'E2 CSE-B', 'E2 CSE-C', 'E2 CSE-D',
    'E3 CSE-A', 'E3 CSE-B', 'E3 CSE-C', 'E3 CSE-D',
    'E4 CSE-A', 'E4 CSE-B', 'E4 CSE-C', 'E4 CSE-D'
  ]

  const handleBack = () => {
    navigate(-1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('className', className)
      if (file) formData.append('file', file)

      const res = await api.post('/assignments', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      })

      console.log('✅ Assignment created:', res.data)
      setMessage('success')
      setTitle('')
      setDescription('')
      setClassName('')
      setFile(null)
      e.target.reset()
    } catch (error) {
      console.error('❌ Assignment creation failed:', error.response?.data || error.message)
      setMessage('error')
    } finally {
      setIsSubmitting(false)
    }
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
                <p className="text-muted fs-5">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="container-fluid py-4 bg-light min-vh-100">
          <div className="container">
            <div className="alert alert-danger text-center">
              <i className="bi bi-exclamation-triangle fs-1 mb-3 d-block"></i>
              <h4>User not found</h4>
              <p>Please log in again to create assignments.</p>
              <button onClick={handleBack} className="btn btn-primary">
                <i className="bi bi-arrow-left me-2"></i>
                Go Back
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
                <i className="bi bi-plus-circle me-3"></i>
                Create New Assignment
              </h1>
              <p className="text-muted fs-5 mb-0">
                Design engaging assignments for your students
              </p>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              
              {/* Motivational Quote Card */}
              <div className="card border-0 shadow-sm mb-4" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}>
                <div className="card-body text-center py-3">
                  <i className="bi bi-lightbulb display-5 text-white opacity-75 mb-2 d-block"></i>
                  <p className="fs-6 fst-italic text-white mb-0 px-3">
                    "{currentQuote}"
                  </p>
                </div>
              </div>

              {/* Create Assignment Card */}
              <div className="card border-0 shadow-lg">
                <div className="card-body p-4 p-md-5">
                  
                  <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="mb-4">
                      <label htmlFor="titleInput" className="form-label fw-semibold text-dark">
                        <i className="bi bi-pencil me-2 text-primary"></i>
                        Assignment Title
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg border-0 shadow-sm"
                        id="titleInput"
                        placeholder="e.g., Final Project Proposal, Weekly Quiz, Research Paper..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ backgroundColor: '#f8f9fa' }}
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label htmlFor="descriptionTextarea" className="form-label fw-semibold text-dark">
                        <i className="bi bi-text-paragraph me-2 text-primary"></i>
                        Detailed Instructions
                      </label>
                      <textarea
                        className="form-control border-0 shadow-sm"
                        id="descriptionTextarea"
                        placeholder="Provide clear and detailed instructions for your students. Include objectives, requirements, submission guidelines, and evaluation criteria..."
                        rows="5"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={{ backgroundColor: '#f8f9fa' }}
                      />
                    </div>

                    {/* Class dropdown */}
                    <div className="mb-4">
                      <label htmlFor="classSelect" className="form-label fw-semibold text-dark">
                        <i className="bi bi-people me-2 text-primary"></i>
                        Target Class
                      </label>
                      <select
                        className="form-select border-0 shadow-sm"
                        id="classSelect"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        required
                        style={{ backgroundColor: '#f8f9fa' }}
                      >
                        <option value="">-- Choose Class --</option>
                        {classOptions.map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    {/* File Upload */}
                    <div className="mb-4">
                      <label htmlFor="fileInput" className="form-label fw-semibold text-dark">
                        <i className="bi bi-paperclip me-2 text-primary"></i>
                        Reference Materials (Optional)
                      </label>
                      <div className="card border-dashed border-2 border-light shadow-sm">
                        <div className="card-body text-center p-4">
                          <i className="bi bi-cloud-arrow-up display-4 text-muted mb-3 d-block"></i>
                          <input
                            type="file"
                            className="form-control d-none"
                            id="fileInput"
                            onChange={(e) => setFile(e.target.files[0])}
                          />
                          <label htmlFor="fileInput" className="btn btn-outline-primary mb-2" style={{ cursor: 'pointer' }}>
                            <i className="bi bi-upload me-2"></i>
                            Choose File
                          </label>
                          {file && (
                            <div className="mt-2">
                              <span className="badge bg-success bg-opacity-10 text-success">
                                <i className="bi bi-check-circle me-1"></i>
                                {file.name}
                              </span>
                            </div>
                          )}
                          <div className="form-text text-muted mt-2">
                            Supported: PDF, DOCX, PPT, Images (Max: 10MB)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg py-3 fw-semibold"
                        disabled={!title || !description || !className || isSubmitting}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                            Creating Assignment...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-plus-circle me-2"></i>
                            Create Assignment
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Feedback Messages */}
                  {message === 'success' && (
                    <div className="alert alert-success border-0 shadow-sm mt-4" role="alert">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success fs-4 me-3"></i>
                        <div>
                          <h5 className="alert-heading mb-1">Assignment Created Successfully!</h5>
                          <p className="mb-0">Your assignment has been published to the selected class.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {message === 'error' && (
                    <div className="alert alert-danger border-0 shadow-sm mt-4" role="alert">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill text-danger fs-4 me-3"></i>
                        <div>
                          <h5 className="alert-heading mb-1">Creation Failed</h5>
                          <p className="mb-0">Please check your inputs and try again.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips Card */}
              <div className="card border-0 shadow-sm mt-4">
                <div className="card-body">
                  <h6 className="fw-bold text-primary mb-3">
                    <i className="bi bi-lightbulb me-2"></i>
                    Assignment Creation Tips
                  </h6>
                  <ul className="list-unstyled text-muted small mb-0">
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Be clear and specific in your instructions
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Include realistic deadlines and expectations
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Provide examples or templates when possible
                    </li>
                    <li className="mb-0">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Consider different learning styles in your design
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
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
        
        .border-dashed {
          border-style: dashed !important;
        }
        
        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
          border-color: #667eea !important;
        }
        
        .btn-primary:disabled {
          background: #6c757d !important;
          border-color: #6c757d !important;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}

export default CreateAssignment