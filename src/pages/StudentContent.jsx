import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const StudentContent = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, important, withFiles

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const res = await api.get('/content/student')
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

  const filteredContent = content.filter(item => {
    if (filter === 'important') return item.isImportant
    if (filter === 'withFiles') return item.fileUrl
    return true
  })

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
                Study Materials
              </h1>
              <p className="text-muted fs-5 mb-0">
                Learning resources shared by your faculty
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body py-3">
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <span className="fw-semibold text-muted me-2">Filter:</span>
                    <button 
                      className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('all')}
                    >
                      All Materials
                    </button>
                    <button 
                      className={`btn btn-sm ${filter === 'important' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => setFilter('important')}
                    >
                      <i className="bi bi-star-fill me-1"></i>
                      Important
                    </button>
                    <button 
                      className={`btn btn-sm ${filter === 'withFiles' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setFilter('withFiles')}
                    >
                      <i className="bi bi-paperclip me-1"></i>
                      With Files
                    </button>
                    <span className="ms-auto text-muted small">
                      {filteredContent.length} items
                    </span>
                  </div>
                </div>
              </div>
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
              <p className="mt-3 text-muted">Loading study materials...</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-5">
              <div className="card border-0 shadow-sm">
                <div className="card-body py-5">
                  <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                  <h4 className="text-muted mb-3">No Study Materials Available</h4>
                  <p className="text-muted mb-4">
                    {filter === 'all' 
                      ? "Your faculty hasn't shared any study materials yet." 
                      : `No ${filter} study materials found.`}
                  </p>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setFilter('all')}
                  >
                    View All Materials
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {filteredContent.map((item) => (
                <div key={item._id} className="col-12 col-md-6 col-lg-4 mb-4">
                  <div className={`card h-100 border-0 shadow-sm ${item.isImportant ? 'border-warning border-2' : ''}`}>
                    <div className="card-body">
                      <div className="d-flex align-items-start mb-3">
                        <div className="flex-grow-1">
                          {item.isImportant && (
                            <span className="badge bg-warning text-dark mb-2">
                              <i className="bi bi-star-fill me-1"></i>
                              Important
                            </span>
                          )}
                          <h5 className="card-title fw-bold text-dark mb-2">{item.title}</h5>
                        </div>
                      </div>
                      
                      <p className="card-text text-muted small mb-3">{item.description}</p>
                      
                      <div className="mb-3">
                        {item.tags && item.tags.map((tag, index) => (
                          <span key={index} className="badge bg-secondary bg-opacity-10 text-secondary me-1 mb-1">
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
                            download
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

export default StudentContent