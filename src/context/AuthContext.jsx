import { createContext, useState, useEffect, useContext } from 'react'
import api from '../api/axios'  // Import your API instance

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')
      
      console.log('🔄 AuthContext Initializing:', {
        storedUser: storedUser ? 'Exists' : 'Null',
        storedToken: storedToken ? 'Exists' : 'Null'
      })

      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser)
          console.log('✅ AuthContext User Found:', { 
            name: userData.name, 
            role: userData.role,
            hasToken: !!storedToken 
          })
          
          // Set the user with token
          setUser({ ...userData, token: storedToken })
          
          // The axios interceptor will automatically add the token to requests
          console.log('🔐 AuthContext - Token should be available for API calls')
          
        } catch (error) {
          console.error('❌ AuthContext Parse Error:', error)
          // Clear invalid data
          localStorage.removeItem('user')
          localStorage.removeItem('token')
        }
      } else {
        console.log('❌ AuthContext: No stored user or token')
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = (data) => {
    console.log('🔑 AuthContext Login:', { 
      user: data.user?.name, 
      role: data.user?.role,
      hasToken: !!data.token 
    })
    
    // Store user and token separately in localStorage
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
    
    // Set user state with token
    setUser({ ...data.user, token: data.token })
    
    console.log('💾 AuthContext - User and token stored in localStorage')
  }

  const logout = () => {
    console.log('🚪 AuthContext Logout')
    
    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    
    // Clear user state
    setUser(null)
    
    console.log('🧹 AuthContext - Storage cleared')
  }

  // Debug function to check current auth state
  const debugAuth = () => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    console.log('🔍 AuthContext Debug:', {
      stateUser: user,
      localStorageUser: storedUser ? JSON.parse(storedUser) : null,
      localStorageToken: token ? `Exists (${token.length} chars)` : 'None',
      hasTokenInState: !!user?.token
    })
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      debugAuth // Optional: for debugging
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)