import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to role-specific dashboard
    if (user?.role === 'Student') navigate('/student')
    else if (user?.role === 'Faculty') navigate('/faculty')
    else if (user?.role === 'Admin') navigate('/admin')
    else navigate('/login') // Fallback to login if no role
  }, [user, navigate])

  return (
    <div>
      <Navbar />
      <div className="container-fluid py-4">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Redirecting to your dashboard...</p>
        </div>
      </div>
    </div>
  )
}