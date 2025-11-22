import { Link } from 'react-router-dom'

export default function Sidebar({ links }) {
  return (
    <div className="bg-light p-3" style={{ minHeight: '100vh', width: '200px' }}>
      <h5 className="mb-4">Menu</h5>
      <ul className="nav flex-column">
        {links.map((link, i) => (
          <li className="nav-item mb-2" key={i}>
            <Link className="nav-link text-primary" to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
