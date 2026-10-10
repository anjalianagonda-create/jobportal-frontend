import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="brand brand-light">JobConnect</div>
          <p className="footer-note">Connecting job seekers with the right opportunities, and employers with the right talent.</p>
        </div>
        <div className="footer-links">
          <Link to="/jobs">Browse jobs</Link>
          <Link to="/register">Create account</Link>
          <Link to="/login">Sign in</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        &copy; {new Date().getFullYear()} JobConnect &middot; Job Searching Management System &middot; Java Full Stack Project
      </div>
    </footer>
  );
}
