import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const ShareContent = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [className, setClassName] = useState('')
  const [file, setFile] = useState(null)
  const [isImportant, setIsImportant] = useState(false)
  const [tags, setTags] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const motivationalQuotes = [
    "Sharing knowledge is the most fundamental act of teaching.",
    "Great content can inspire students to explore beyond the curriculum.",
    "The best learning resources are those that make complex topics simple.",
    "Your shared materials could be the key to a student's understanding.",
    "Content that engages multiple senses creates deeper learning experiences.",
    "Well-organized study materials help students build strong foundations."
  ]

  const [currentQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])

  // All valid class options
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
      formData.append('isImportant', isImportant)
      formData.append('tags', tags)
      if (file) formData.append('file', file)

      const res = await api.post('/content', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}` 
        },
      })

      console.log('✅ Content shared:', res.data)
      setMessage('success')
      setTitle('')
      setDescription('')
      setClassName('')
      setFile(null)
      setIsImportant(false)
      setTags('')
      e.target.reset()
    } catch (error) {
      console.error('❌ Content sharing failed:', error.response?.data || error.message)
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
              <p>Please log in again to share content.</p>
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
                <i className="bi bi-share me-3"></i>
                Share Study Material
              </h1>
              <p className="text-muted fs-5 mb-0">
                Share learning resources, notes, and study materials with your students
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

              {/* Share Content Card */}
              <div className="card border-0 shadow-lg">
                <div className="card-body p-4 p-md-5">
                  
                  <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="mb-4">
                      <label htmlFor="titleInput" className="form-label fw-semibold text-dark">
                        <i className="bi bi-pencil me-2 text-primary"></i>
                        Content Title
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg border-0 shadow-sm"
                        id="titleInput"
                        placeholder="e.g., Lecture Notes Chapter 3, Reference Material, Important Formulas..."
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
                        Content Description
                      </label>
                      <textarea
                        className="form-control border-0 shadow-sm"
                        id="descriptionTextarea"
                        placeholder="Describe the content, its importance, and how students should use it..."
                        rows="4"
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

                    {/* Tags */}
                    <div className="mb-4">
                      <label htmlFor="tagsInput" className="form-label fw-semibold text-dark">
                        <i className="bi bi-tags me-2 text-primary"></i>
                        Tags (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-control border-0 shadow-sm"
                        id="tagsInput"
                        placeholder="e.g., notes, formulas, reference, important (separate with commas)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        style={{ backgroundColor: '#f8f9fa' }}
                      />
                      <div className="form-text text-muted">
                        Add tags to help students categorize the content
                      </div>
                    </div>

                    {/* Important Flag */}
                    <div className="mb-4">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="importantSwitch"
                          checked={isImportant}
                          onChange={(e) => setIsImportant(e.target.checked)}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        <label className="form-check-label fw-semibold text-dark" htmlFor="importantSwitch">
                          <i className="bi bi-star-fill me-2 text-warning"></i>
                          Mark as Important Content
                        </label>
                      </div>
                      <div className="form-text text-muted">
                        Important content will be highlighted for students
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="mb-4">
                      <label htmlFor="fileInput" className="form-label fw-semibold text-dark">
                        <i className="bi bi-paperclip me-2 text-primary"></i>
                        Study Material File (Optional)
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
                                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                          )}
                          <div className="form-text text-muted mt-2">
                            Supported: PDF, DOCX, PPT, Images, Videos (Max: 25MB)
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
                            Sharing Content...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-share me-2"></i>
                            Share with Students
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
                          <h5 className="alert-heading mb-1">Content Shared Successfully!</h5>
                          <p className="mb-0">Your study material has been shared with students and email notifications have been sent.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {message === 'error' && (
                    <div className="alert alert-danger border-0 shadow-sm mt-4" role="alert">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill text-danger fs-4 me-3"></i>
                        <div>
                          <h5 className="alert-heading mb-1">Sharing Failed</h5>
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
                    Content Sharing Tips
                  </h6>
                  <ul className="list-unstyled text-muted small mb-0">
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Use clear, descriptive titles for easy identification
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Mark important content that students must review
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Use tags to help students organize their study materials
                    </li>
                    <li className="mb-0">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Provide context about how the content relates to current topics
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

export default ShareContent