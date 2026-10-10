import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HOME_BY_ROLE, useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABEL, initials } from '../utils/format.js';
import Icon from './Icon.jsx';

const LINKS = {
  JOB_SEEKER: [
    { to: '/seeker', label: 'Dashboard', end: true },
    { to: '/seeker/applications', label: 'My applications' },
    { to: '/seeker/saved', label: 'Saved jobs' },
    { to: '/seeker/profile', label: 'Profile' },
  ],
  EMPLOYER: [
    { to: '/employer', label: 'Dashboard', end: true },
    { to: '/employer/jobs', label: 'My jobs' },
    { to: '/employer/profile', label: 'Company' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/jobs', label: 'Job moderation' },
  ],
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const links = user ? LINKS[user.role] || [] : [];

  const handleLogout = () => {
    close();
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark"><Icon name="briefcase" size={18} /></span>
          JobConnect
        </Link>

        <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle navigation">
          <Icon name={open ? 'x' : 'menu'} size={22} />
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/jobs" onClick={close}>Find jobs</NavLink>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={close}>{l.label}</NavLink>
          ))}

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <div className="user-chip" title={ROLE_LABEL[user.role]}>
                  <span className="avatar">{initials(user.fullName)}</span>
                  <span className="user-chip-text">
                    <strong>{user.fullName}</strong>
                    <small>{ROLE_LABEL[user.role]}</small>
                  </span>
                </div>
                <Link to={HOME_BY_ROLE[user.role]} className="btn btn-outline btn-sm" onClick={close}>Dashboard</Link>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  <Icon name="logout" size={16} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm" onClick={close}>Sign in</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Get started</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
