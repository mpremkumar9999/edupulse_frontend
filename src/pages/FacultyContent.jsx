import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const FacultyContent = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const res = await api.get('/content/faculty')
      if (res.data.success) {
        setContent(res.data.content)
      }
    } catch (err) {
      setError('Failed to load content')
      console.error('Error loading content:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (contentId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await api.delete(`/content/${contentId}`)
        setContent(content.filter(item => item._id !== contentId))
      } catch (err) {
        setError('Failed to delete content')
      }
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'bi-file-earmark-pdf text-danger'
    if (fileType.includes('word') || fileType.includes('document')) return 'bi-file-earmark-word text-primary'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'bi-file-earmark-ppt text-warning'
    if (fileType.includes('image')) return 'bi-file-earmark-image text-success'
    if (fileType.includes('video')) return 'bi-file-earmark-play text-info'
    return 'bi-file-earmark-text text-secondary'
  }

  return (
    <>
      <Navbar />
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="container">
          
          {/* Header */}
          <div className="row align-items-center mb-4">
            <div className="col">
              <h1 className="display-6 fw-bold text-gradient-primary mb-2">
                <i className="bi bi-collection me-3"></i>
                My Shared Content
              </h1>
              <p className="text-muted fs-5 mb-0">
                Manage all the study materials you've shared with students
              </p>
            </div>
            <div className="col-auto">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/share-content')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Share New Content
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
              <p className="mt-3 text-muted">Loading your shared content...</p>
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-5">
              <div className="card border-0 shadow-sm">
                <div className="card-body py-5">
                  <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                  <h4 className="text-muted mb-3">No Content Shared Yet</h4>
                  <p className="text-muted mb-4">Start sharing study materials with your students</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/share-content')}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Share Your First Content
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {content.map((item) => (
                <div key={item._id} className="col-12 col-md-6 col-lg-4 mb-4">
                  <div className={`card h-100 border-0 shadow-sm ${item.isImportant ? 'border-warning border-2' : ''}`}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          {item.isImportant && (
                            <span className="badge bg-warning text-dark mb-2">
                              <i className="bi bi-star-fill me-1"></i>
                              Important
                            </span>
                          )}
                          <h5 className="card-title fw-bold text-dark mb-2">{item.title}</h5>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(item._id)}
                          title="Delete Content"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                      
                      <p className="card-text text-muted small mb-3">{item.description}</p>
                      
                      <div className="mb-3">
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {item.className}
                        </span>
                        {item.tags && item.tags.map((tag, index) => (
                          <span key={index} className="badge bg-secondary bg-opacity-10 text-secondary ms-1">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {item.fileUrl && (
                        <div className="d-flex align-items-center mb-3 p-2 bg-light rounded">
                          <i className={`bi ${getFileIcon(item.fileType)} fs-4 me-3`}></i>
                          <div className="flex-grow-1">
                            <div className="fw-semibold small">{item.fileName}</div>
                            <div className="text-muted smaller">{formatFileSize(item.fileSize)}</div>
                          </div>
                          <a 
                            href={`http://localhost:5000${item.fileUrl}`} 
                            className="btn btn-sm btn-outline-primary"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="bi bi-download"></i>
                          </a>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </small>
                        <small className="text-muted">
                          by {item.faculty?.name}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .text-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .smaller {
          font-size: 0.75rem;
        }
      `}</style>
    </>
  )
}

export default FacultyContent