import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import SocketProvider from './context/SocketProvider'
import ProtectedRoute from './components/ProtectedRoute'
import 'bootstrap-icons/font/bootstrap-icons.css';

// ✅ ADD LANDING PAGE IMPORT
import LandingPage from './pages/Landingpage'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import FacultyDashboard from './pages/FacultyDashboard'
import AdminDashboard from './pages/AdminDashboard'
import FeedbackForm from './pages/FeedbackForm'
import TimetableView from './pages/TimetableView'
import FacultyTimetable from './pages/FacultyTimetable'
import StudentTimetable from './pages/StudentTimetable'
import Reports from './pages/Reports'
import CreateAssignment from './pages/CreateAssignment'
import MyAssignments from './pages/MyAssignments'
import StudentAssignments from './pages/StudentAssignments'
import SubmitAssignment from './pages/SubmitAssignment'

import FacultyAttendance from './pages/FacultyAttendance'
import StudentAttendance from './pages/StudentAttendance'
import AttendanceReports from './pages/AttendanceReports'
import StudentRewards from './pages/StudentRewards';
import Chat from './pages/Chat'

// ✅ CONTENT SHARING IMPORTS
import ShareContent from './pages/ShareContent'
import FacultyContent from './pages/FacultyContent'
import StudentContent from './pages/StudentContent'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* ✅ LANDING PAGE AS DEFAULT ROUTE */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 🧑‍🎓 Student Routes - Individual ProtectedRoute */}
            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/feedback" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <FeedbackForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-timetable" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentTimetable />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/timetable" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <TimetableView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-attendance" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentAttendance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assignments" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentAssignments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/submit-assignment/:id" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <SubmitAssignment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rewards" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentRewards />
                </ProtectedRoute>
              } 
            />
            {/* ✅ STUDENT CONTENT ROUTE */}
            <Route 
              path="/student-content" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentContent />
                </ProtectedRoute>
              } 
            />

            {/* 👨‍🏫 Faculty Routes - Individual ProtectedRoute */}
            <Route 
              path="/faculty" 
              element={
                <ProtectedRoute allowedRoles={['Faculty']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/faculty-timetable" 
              element={
                <ProtectedRoute allowedRoles={['Faculty']}>
                  <FacultyTimetable />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-assignment" 
              element={
                <ProtectedRoute allowedRoles={['Faculty']}>
                  <CreateAssignment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/faculty-attendance" 
              element={
                <ProtectedRoute allowedRoles={['Faculty']}>
                  <FacultyAttendance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/attendance-reports" 
              element={
                <ProtectedRoute allowedRoles={['Faculty']}>
                  <AttendanceReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-assignments" 
              element={
                <ProtectedRoute allowedRoles={['Faculty']}>
                  <MyAssignments />
                </ProtectedRoute>
              } 
            />
            {/* ✅ FACULTY CONTENT ROUTES */}
            <Route 
              path="/share-content" 
              element={
                <ProtectedRoute allowedRoles={['Faculty']}>
                  <ShareContent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/faculty-content" 
              element={
                <ProtectedRoute allowedRoles={['Faculty']}>
                  <FacultyContent />
                </ProtectedRoute>
              } 
            />

            {/* 🧑‍💼 Admin Routes - Individual ProtectedRoute */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <Reports />
                </ProtectedRoute>
              } 
            />

            {/* 🌐 Common Chat Route - Accessible by all roles */}
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute allowedRoles={['Student', 'Faculty', 'Admin']}>
                  <Chat />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App