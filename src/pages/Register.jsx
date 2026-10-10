import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { errorMessage, fieldErrors } from '../api/client.js';
import Icon from '../components/Icon.jsx';
import { Field } from '../components/ui.jsx';
import { HOME_BY_ROLE, useAuth } from '../context/AuthContext.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: 'JOB_SEEKER', fullName: '', email: '', password: '', confirm: '', companyName: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to={HOME_BY_ROLE[user.role] || '/'} replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email address';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    if (form.role === 'EMPLOYER' && !form.companyName.trim()) e.companyName = 'Company name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const u = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        companyName: form.role === 'EMPLOYER' ? form.companyName.trim() : undefined,
      });
      navigate(form.role === 'JOB_SEEKER' ? '/seeker/profile' : HOME_BY_ROLE[u.role], { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      setServerError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-aside">
        <h2>Create your JobConnect account</h2>
        <p>Whether you are looking for your next role or your next hire, you are in the right place.</p>
        <ul>
          <li><Icon name="check" /> Free to join, ready in under a minute</li>
          <li><Icon name="check" /> Smart search by skills, location and experience</li>
          <li><Icon name="check" /> Passwords are securely hashed and sessions use JWT</li>
        </ul>
      </div>
      <div className="auth-main">
        <form className="auth-card" onSubmit={submit} noValidate>
          <div>
            <h1>Get started</h1>
            <p className="sub">Already registered? <Link to="/login">Sign in</Link></p>
          </div>

          <div className="role-picker">
            <button type="button" className={`role-option ${form.role === 'JOB_SEEKER' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'JOB_SEEKER' })}>
              <strong><Icon name="user" size={16} /> Job seeker</strong>
              <span>Find and apply for jobs</span>
            </button>
            <button type="button" className={`role-option ${form.role === 'EMPLOYER' ? 'active' : ''}`} onClick={() => setForm({ ...form, role: 'EMPLOYER' })}>
              <strong><Icon name="building" size={16} /> Employer</strong>
              <span>Post jobs and hire talent</span>
            </button>
          </div>

          {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}

          <Field label="Full name" error={errors.fullName} required>
            <input value={form.fullName} onChange={set('fullName')} autoComplete="name" placeholder="Your full name" />
          </Field>
          {form.role === 'EMPLOYER' && (
            <Field label="Company name" error={errors.companyName} required>
              <input value={form.companyName} onChange={set('companyName')} placeholder="Your company" />
            </Field>
          )}
          <Field label="Email address" error={errors.email} required>
            <input type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" />
          </Field>
          <div className="form-grid">
            <Field label="Password" error={errors.password} hint="At least 8 characters" required>
              <input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
            </Field>
            <Field label="Confirm password" error={errors.confirm} required>
              <input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
            </Field>
          </div>
          <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>
            {busy ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
