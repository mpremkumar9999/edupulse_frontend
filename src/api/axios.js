// api/axios.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

// ✅ FIXED: Get token from the correct location
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (where AuthContext stores it)
    const token = localStorage.getItem('token')
    
    console.log('🔑 Axios Interceptor - Token check:', {
      hasToken: !!token,
      url: config.url,
      tokenLength: token ? token.length : 0
    })
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Authorization header set for:', config.url)
    } else {
      console.warn('❌ No token found for request:', config.url)
    }
    
    return config
  },
  (error) => {
    console.error('❌ Axios request interceptor error:', error)
    return Promise.reject(error)
  }
)

// ✅ Handle 401 responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response success:', {
      url: response.config.url,
      status: response.status
    })
    return response
  },
  (error) => {
    console.error('❌ API Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message
    })
    
    if (error.response?.status === 401) {
      console.log('🔄 Token expired - redirecting to login')
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api