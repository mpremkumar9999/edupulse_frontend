import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../css/LandingPage.css'

export default function LandingPage() {
  const [activeRole, setActiveRole] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const roles = [
    {
      icon: 'fas fa-user-cog',
      title: 'Administrator',
      description: 'Complete institutional management and analytics platform for academic administration',
      features: [
        'User account management',
        'Institutional analytics & reports',
        'System-wide monitoring',
        'Platform configuration',
        'Adding new members & editing the user profiles'
      ],
      color: '#2c5aa0'
    },
    {
      icon: 'fas fa-chalkboard-teacher',
      title: 'Faculty Member',
      description: 'Comprehensive course delivery and student evaluation system',
      features: [
        'Create & manage assignments',
        'Upload course materials',
        'Grade student submissions',
        'Analyze student feedback',
        'Manage class schedules',
        'Take attendance & generate reports'
      ],
      color: '#d35400'
    },
    {
      icon: 'fas fa-user-graduate',
      title: 'Student',
      description: 'Integrated learning and academic engagement platform',
      features: [
        'Access course materials',
        'Submit assignments digitally',
        'Provide course feedback',
        'View grades & progress',
        'Check attendance records',
        'Real-time communication'
      ],
      color: '#27ae60'
    }
  ]

  const platformFeatures = [
    {
      icon: 'fas fa-tasks',
      title: 'Assignment Management',
      description: 'Complete workflow from creation to grading with automated tracking'
    },
    {
      icon: 'fas fa-comments',
      title: 'Academic Communication',
      description: 'Structured messaging system between students and faculty'
    },
    {
      icon: 'fas fa-chart-bar',
      title: 'Analytics & Reports',
      description: 'Comprehensive institutional insights and performance tracking'
    },
    {
      icon: 'fas fa-file-upload',
      title: 'Digital Resource Hub',
      description: 'Centralized learning materials distribution system'
    },
    {
      icon: 'fas fa-clipboard-check',
      title: 'Attendance Management',
      description: 'Digital attendance system with comprehensive reporting'
    },
    {
      icon: 'fas fa-star',
      title: 'Evaluation System',
      description: 'Structured feedback with analytical insights and reporting'
    }
  ]

  const projectOverview = [
    {
      title: "Comprehensive Digital Transformation",
      description: "EduPulse LMS represents a complete digital transformation of academic operations at RKVALLEY University. This enterprise platform integrates all aspects of academic management into a unified, scalable system that serves administrators, faculty, and students through specialized interfaces tailored to their unique needs."
    },
    {
      title: "Modern Technology Infrastructure",
      description: "Built on cutting-edge web technologies including React.js, Node.js, and MongoDB, the platform ensures high performance, security, and scalability. The system incorporates real-time communication capabilities, robust data analytics, and mobile-responsive design to support modern educational requirements."
    },
    {
      title: "Institutional Excellence Platform",
      description: "Designed specifically for higher education institutions, EduPulse provides tools for curriculum management, student assessment, faculty coordination, and administrative oversight. The platform supports the entire academic lifecycle from course creation to graduation analytics."
    }
  ]

  const accessSteps = [
    {
      step: 1,
      title: "Administrator Access",
      description: "Institutional administrators can manage user accounts, configure system settings, generate comprehensive reports, and monitor platform performance across all departments and programs.",
      icon: "fas fa-user-cog",
      action: "System Configuration & Analytics"
    },
    {
      step: 2,
      title: "Faculty Portal",
      description: "Faculty members access specialized tools for course management, assignment creation, grade submission, attendance tracking, and student performance analysis through an intuitive interface.",
      icon: "fas fa-chalkboard-teacher",
      action: "Course Management & Evaluation"
    },
    {
      step: 3,
      title: "Student Dashboard",
      description: "Students engage with learning materials, submit assignments, track academic progress, receive feedback, and communicate with instructors through a personalized learning environment.",
      icon: "fas fa-user-graduate",
      action: "Learning & Academic Engagement"
    }
  ]

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <i className="fas fa-graduation-cap"></i>
            <span>EduPulse</span>
          </div>
          <div className="nav-links">
            <a href="#overview">Platform Overview</a>
            <a href="#features">Capabilities</a>
            <a href="#access">User Access</a>
            <a href="#technology">Technology</a>
            <Link to="/login" className="login-btn">
              Access Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              Digital Academic Platform
            </div>
            <h1 className="hero-title">
              Academic Excellence Through
              <span className="gradient-text"> Digital Innovation</span>
            </h1>
           
            <p className="hero-description">
              A comprehensive digital platform designed to enhance academic operations, 
              facilitate student-faculty collaboration, and provide robust institutional 
              management capabilities through modern technology solutions.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">
                <i className="fas fa-sign-in-alt"></i>
                Access Platform
              </Link>
              <Link to="/register" className="btn btn-secondary">
                <i className="fas fa-book"></i>
                Signup
              </Link>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="platform-overview">
              <div className="overview-card">
                <div className="card-header">
                  <i className="fas fa-university"></i>
                  <span>Platform Overview</span>
                </div>
                <div className="overview-content">
                  <div className="platform-highlight">
                    <i className="fas fa-sync-alt"></i>
                    <div>
                      <h4>Unified Academic Ecosystem</h4>
                      <p>Integrates administration, teaching, and learning processes</p>
                    </div>
                  </div>
                  <div className="platform-highlight">
                    <i className="fas fa-shield-alt"></i>
                    <div>
                      <h4>Enterprise Security</h4>
                      <p>Role-based access control with data protection</p>
                    </div>
                  </div>
                  <div className="platform-highlight">
                    <i className="fas fa-mobile-alt"></i>
                    <div>
                      <h4>Multi-Platform Access</h4>
                      <p>Responsive design for all devices and screen sizes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section id="overview" className="overview-section">
        <div className="container">
          <div className="section-header">
            <h2>Comprehensive Academic Management Platform</h2>
            <p>Transforming educational delivery through integrated digital solutions</p>
          </div>
          <div className="overview-grid">
            {projectOverview.map((item, index) => (
              <div key={index} className="overview-card">
                <div className="card-number">0{index + 1}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Platform Capabilities</h2>
            <p>Comprehensive academic management tools for modern education</p>
          </div>
          <div className="features-grid">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step-by-Step Access */}
      <section id="access" className="access-section">
        <div className="container">
          <div className="section-header">
            <h2>Role-Based Platform Access</h2>
            <p>Structured access pathways for different academic stakeholders</p>
          </div>
          
          <div className="access-steps">
            {accessSteps.map((step, index) => (
              <div key={index} className={`access-step ${currentStep === index ? 'active' : ''}`}>
                <div className="step-indicator">
                  <div className="step-number">{step.step}</div>
                  <div className="step-connector"></div>
                </div>
                <div className="step-content">
                  <div className="step-header">
                    <i className={step.icon}></i>
                    <h3>{step.title}</h3>
                    <button 
                      className="step-toggle"
                      onClick={() => setCurrentStep(currentStep === index ? -1 : index)}
                    >
                      {currentStep === index ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                  {currentStep === index && (
                    <div className="step-details">
                      <p>{step.description}</p>
                      <div className="step-action">
                        <i className="fas fa-arrow-right"></i>
                        <span>{step.action}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Role Features Display */}
          <div className="roles-display">
            <div className="roles-header">
              <h3>Platform Features by Role</h3>
              <p>Select a role to explore specific capabilities</p>
            </div>
            <div className="role-selector">
              {roles.map((role, index) => (
                <button
                  key={index}
                  className={`role-option ${activeRole === index ? 'active' : ''}`}
                  onClick={() => setActiveRole(index)}
                  style={{ borderColor: activeRole === index ? role.color : 'transparent' }}
                >
                  <i className={role.icon}></i>
                  {role.title}
                </button>
              ))}
            </div>
            <div className="role-features">
              <div className="role-info">
                <div className="role-header">
                  <i 
                    className={roles[activeRole].icon} 
                    style={{ color: roles[activeRole].color }}
                  ></i>
                  <h4>{roles[activeRole].title}</h4>
                </div>
                <p className="role-description">{roles[activeRole].description}</p>
                <div className="features-grid-mini">
                  {roles[activeRole].features.map((feature, index) => (
                    <div key={index} className="feature-item-mini">
                      <i className="fas fa-check" style={{ color: roles[activeRole].color }}></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="technology" className="tech-section">
        <div className="container">
          <div className="section-header">
            <h2>Technology Infrastructure</h2>
            <p>Built on robust, scalable enterprise technologies</p>
          </div>
          <div className="tech-grid">
            <div className="tech-item">
              <div className="tech-icon">
                <i className="fab fa-react"></i>
              </div>
              <h4>React.js Framework</h4>
              <p>Modern frontend architecture with component-based design for responsive user interfaces</p>
            </div>
            <div className="tech-item">
              <div className="tech-icon">
                <i className="fab fa-node-js"></i>
              </div>
              <h4>Node.js Runtime</h4>
              <p>Scalable backend environment with asynchronous processing capabilities</p>
            </div>
            <div className="tech-item">
              <div className="tech-icon">
                <i className="fas fa-database"></i>
              </div>
              <h4>MongoDB Database</h4>
              <p>High-performance NoSQL database with flexible data modeling</p>
            </div>
            <div className="tech-item">
              <div className="tech-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4>JWT Security</h4>
              <p>Enterprise-grade authentication with role-based access control</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Begin Your Digital Academic Journey</h2>
            <p>Join our community of students and faculty advancing education through technology</p>
            <div className="cta-buttons">
              <Link to="/login" className="btn btn-primary btn-large">
                <i className="fas fa-sign-in-alt"></i>
                Access Academic Portal
              </Link>
              <Link to="/register" className="btn btn-secondary btn-large">
                <i className="fas fa-user-plus"></i>
                Request Institutional Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-brand">
                <i className="fas fa-graduation-cap"></i>
                <span>EduPulse LMS</span>
              </div>
              <p>Enterprise Learning Management System<br />RKVALLEY University</p>
              <div className="accreditation">
                <div className="accreditation-badge">
                  <i className="fas fa-award"></i>
                  <span>Accredited Institution</span>
                </div>
              </div>
            </div>
            <div className="footer-section">
              <h4>Academic Resources</h4>
              <a href="#overview">Platform Overview</a>
              <a href="#features">System Capabilities</a>
              <a href="#access">User Access Guide</a>
              <a href="#technology">Technical Specifications</a>
            </div>
            <div className="footer-section">
              <h4>Institutional Contact</h4>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>RK Valley Campus, Vempalli</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>Academic Support Desk</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>lms-support@rguktrkv.ac.in</span>
              </div>
            </div>
            <div className="footer-section">
              <h4>University Information</h4>
              <p>RKVALLEY University</p>
              <p>Shaping Future Leaders Through Excellence in Education</p>
              <div className="social-links">
                <a href="#" className="social-link">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="social-link">
                  <i className="fab fa-facebook"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 EduPulse Learning Management System. All rights reserved. | RKVALLEY University</p>
          </div>
        </div>
      </footer>
    </div>
  )
}