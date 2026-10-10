import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../api/client.js';
import Icon from '../components/Icon.jsx';
import { Field } from '../components/ui.jsx';
import { HOME_BY_ROLE, useAuth } from '../context/AuthContext.jsx';

const DEMO = [
  { label: 'Admin', email: 'admin@jobportal.com', password: 'Admin@123' },
  { label: 'Employer', email: 'hr@technova.com', password: 'Employer@123' },
  { label: 'Job seeker', email: 'anjali@example.com', password: 'Seeker@123' },
];

export default function Login() {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(params.get('expired') ? 'Your session has expired. Please sign in again.' : '');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to={HOME_BY_ROLE[user.role] || '/'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
      const from = location.state?.from;
      navigate(from && from !== '/login' ? from : HOME_BY_ROLE[u.role] || '/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Unable to sign in. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-aside">
        <h2>Welcome back to JobConnect</h2>
        <p>Sign in to continue your job search or manage your hiring pipeline.</p>
        <ul>
          <li><Icon name="check" /> Track every application in real time</li>
          <li><Icon name="check" /> Review and shortlist candidates faster</li>
          <li><Icon name="check" /> Secure, role-based access for every user</li>
        </ul>
      </div>
      <div className="auth-main">
        <form className="auth-card" onSubmit={submit} noValidate>
          <div>
            <h1>Sign in</h1>
            <p className="sub">Don't have an account? <Link to="/register">Create one</Link></p>
          </div>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <Field label="Email address" required>
            <input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
          </Field>
          <Field label="Password" required>
            <input type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" required />
          </Field>
          <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy || !form.email || !form.password}>
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
          <div className="demo-box">
            <strong>Demo accounts</strong> (click to fill):
            <div className="row" style={{ marginTop: 6, gap: 14 }}>
              {DEMO.map((d) => (
                <button key={d.label} type="button" onClick={() => setForm({ email: d.email, password: d.password })}>{d.label}</button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
