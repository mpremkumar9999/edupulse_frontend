import { useState, useRef, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function SubmitAssignment() {
  const { id } = useParams() // assignmentId from URL
  const { user } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assignment, setAssignment] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchAssignmentDetails()
  }, [id])

  const fetchAssignmentDetails = async () => {
    try {
      const response = await api.get(`/assignments/${id}`)
      setAssignment(response.data.assignment)
    } catch (err) {
      console.error('Error fetching assignment details:', err)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (validateFile(droppedFile)) {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
      }
    }
  }

  const validateFile = (file) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'application/zip',
      'application/x-zip-compressed'
    ]
    
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      setMessage('❌ Please select a valid file type (PDF, DOC, DOCX, TXT, Images, ZIP)')
      return false
    }

    if (file.size > maxSize) {
      setMessage('❌ File size too large. Maximum size is 10MB.')
      return false
    }

    setMessage('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      setMessage('❌ Please select a file to upload!')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    const formData = new FormData()
    formData.append('assignmentId', id)
    formData.append('file', file)
    formData.append('studentId', user.user?._id || user._id)
    formData.append('submittedAt', new Date().toISOString())

    try {
      await api.post('/submissions', formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      
      setMessage('success')
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Auto redirect after success
      setTimeout(() => {
        navigate('/assignments')
      }, 2000)
      
    } catch (err) {
      console.error(err)
      setMessage('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setMessage('')
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase()
    const iconMap = {
      pdf: 'bi-file-pdf',
      doc: 'bi-file-word',
      docx: 'bi-file-word',
      txt: 'bi-file-text',
      jpg: 'bi-file-image',
      jpeg: 'bi-file-image',
      png: 'bi-file-image',
      zip: 'bi-file-zip'
    }
    return iconMap[extension] || 'bi-file-earmark'
  }

  return (
    <>
      <Navbar />
      
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              
              {/* Header Card */}
              <div className="card border-0 shadow-lg mb-4 overflow-hidden">
                <div className="card-header bg-primary text-white py-4">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-cloud-upload display-5 me-3"></i>
                    <div>
                      <h2 className="mb-1 fw-bold">Submit Assignment</h2>
                      {assignment && (
                        <p className="mb-0 opacity-90">{assignment.title}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {assignment && (
                  <div className="card-body bg-light">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-journal-text text-primary me-3 fs-5"></i>
                          <div>
                            <small className="text-muted">Assignment</small>
                            <div className="fw-bold">{assignment.title}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-calendar text-primary me-3 fs-5"></i>
                          <div>
                            <small className="text-muted">Due Date</small>
                            <div className="fw-bold">
                              {new Date(assignment.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {assignment.description && (
                      <div className="alert alert-info mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Instructions:</strong> {assignment.description}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Upload Card */}
              <div className="card border-0 shadow-lg">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    
                    {/* Drag & Drop Area */}
                    <div 
                      className={`drop-zone border-2 border-dashed rounded-3 p-5 text-center mb-4 ${
                        dragActive ? 'border-primary bg-primary-soft' : 'border-gray-300'
                      } ${file ? 'bg-success-soft border-success' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: file ? 'rgba(40, 167, 69, 0.05)' : dragActive ? 'rgba(102, 126, 234, 0.05)' : 'transparent'
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="d-none"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                        required
                      />
                      
                      {!file ? (
                        <>
                          <i className={`bi bi-cloud-arrow-up display-4 mb-3 ${
                            dragActive ? 'text-primary' : 'text-muted'
                          }`}></i>
                          <h5 className="fw-bold mb-2">
                            {dragActive ? 'Drop your file here' : 'Choose a file or drag & drop'}
                          </h5>
                          <p className="text-muted mb-0">
                            Supported formats: PDF, DOC, DOCX, TXT, Images, ZIP
                          </p>
                          <small className="text-muted">Maximum file size: 10MB</small>
                        </>
                      ) : (
                        <>
                          <i className={`bi ${getFileIcon(file.name)} display-4 mb-3 text-success`}></i>
                          <h5 className="fw-bold text-success mb-2">File Selected</h5>
                          <p className="mb-1">{file.name}</p>
                          <small className="text-muted">{formatFileSize(file.size)}</small>
                        </>
                      )}
                    </div>

                    {/* Selected File Info */}
                    {file && (
                      <div className="alert alert-success d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <i className={`bi ${getFileIcon(file.name)} me-3 fs-4 text-success`}></i>
                          <div>
                            <div className="fw-bold">{file.name}</div>
                            <small className="text-muted">{formatFileSize(file.size)}</small>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger"
                          onClick={removeFile}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-flex gap-3 mt-4">
                      <button 
                        type="button"
                        className="btn btn-outline-secondary flex-fill"
                        onClick={() => navigate('/assignments')}
                        disabled={isSubmitting}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Assignments
                      </button>
                      
                      <button 
                        type="submit" 
                        className="btn btn-primary flex-fill"
                        disabled={!file || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cloud-check me-2"></i>
                            Submit Assignment
                          </>
                        )}
                      </button>
                    </div>

                    {/* Status Messages */}
                    {message === 'success' && (
                      <div className="alert alert-success mt-4 d-flex align-items-center">
                        <i className="bi bi-check-circle-fill me-3 fs-4"></i>
                        <div>
                          <h6 className="mb-1 fw-bold">Assignment Submitted Successfully!</h6>
                          <p className="mb-0">Your work has been uploaded. Redirecting to assignments...</p>
                        </div>
                      </div>
                    )}

                    {message === 'error' && (
                      <div className="alert alert-danger mt-4 d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
                        <div>
                          <h6 className="mb-1 fw-bold">Upload Failed</h6>
                          <p className="mb-0">There was an error submitting your assignment. Please try again.</p>
                        </div>
                      </div>
                    )}

                    {message && message !== 'success' && message !== 'error' && (
                      <div className="alert alert-warning mt-4">
                        <i className="bi bi-exclamation-circle me-2"></i>
                        {message}
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Help Information */}
              <div className="card border-0 shadow-sm mt-4">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-lightbulb text-warning me-2"></i>
                    Submission Tips
                  </h6>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Ensure your file is properly named (e.g., "YourName_Assignment1.pdf")
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Double-check the file before submission
                    </li>
                    <li className="mb-0">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      You can only submit once per assignment
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
        .border-dashed {
          border-style: dashed !important;
        }
        
        .bg-primary-soft {
          background-color: rgba(102, 126, 234, 0.05) !important;
        }
        
        .bg-success-soft {
          background-color: rgba(40, 167, 69, 0.05) !important;
        }
        
        .drop-zone:hover {
          border-color: #667eea !important;
          background-color: rgba(102, 126, 234, 0.02) !important;
        }
      `}</style>
    </>
  )
}