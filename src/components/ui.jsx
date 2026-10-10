import { useEffect } from 'react';
import { APPLICATION_STATUS, JOB_STATUS } from '../utils/format.js';
import Icon from './Icon.jsx';

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="spinner-wrap" role="status">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon = 'file', title, text, action }) {
  return (
    <div className="empty">
      <span className="empty-icon"><Icon name={icon} size={26} /></span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="empty">
      <span className="empty-icon empty-icon-error"><Icon name="x" size={26} /></span>
      <h3>Unable to load data</h3>
      <p>{message}</p>
      {onRetry && <button className="btn btn-outline btn-sm" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon, tone = 'indigo' }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon tone-${tone}`}><Icon name={icon} size={20} /></span>
      <div>
        <div className="stat-value">{value ?? '-'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export function Badge({ tone = 'gray', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function ApplicationStatusBadge({ status }) {
  const s = APPLICATION_STATUS[status] || { label: status, tone: 'gray' };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function JobStatusBadge({ status }) {
  const s = JOB_STATUS[status] || { label: status, tone: 'gray' };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function Field({ label, error, hint, children, required }) {
  return (
    <label className={`field ${error ? 'field-error' : ''}`}>
      <span className="field-label">
        {label}
        {required && <em> *</em>}
      </span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-msg">{error}</span>}
    </label>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  const pages = [];
  for (let i = start; i < Math.min(totalPages, start + 5); i++) pages.push(i);
  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => onChange(page - 1)}>Previous</button>
      {pages.map((p) => (
        <button key={p} className={`page-num ${p === page ? 'active' : ''}`} onClick={() => onChange(p)}>
          {p + 1}
        </button>
      ))}
      <button className="btn btn-outline btn-sm" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  );
}

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel, busy }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Please wait...' : confirmLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
