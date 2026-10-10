import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { employerApi, errorMessage } from '../../api/client.js';
import { ApplicationStatusBadge, EmptyState, ErrorState, JobStatusBadge, Modal, PageHeader, Field, Spinner } from '../../components/ui.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import { APPLICATION_STATUS, formatDate, initials, timeAgo } from '../../utils/format.js';

const ACTIONS = ['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'];
const FILTERS = ['ALL', 'APPLIED', ...ACTIONS, 'WITHDRAWN'];

function Detail({ title, children }) {
  if (!children) return null;
  return (
    <div>
      <h4>{title}</h4>
      <div className="pre-wrap">{children}</div>
    </div>
  );
}

export default function Applicants() {
  const { id } = useParams();
  const toast = useToast();
  const job = useFetch(() => employerApi.job(id), [id]);
  const apps = useFetch(() => employerApi.applicants(id), [id]);
  const [filter, setFilter] = useState('ALL');
  const [open, setOpen] = useState(null); // application id with expanded details
  const [pending, setPending] = useState(null); // { application, status }
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const startUpdate = (application, status) => {
    setPending({ application, status });
    setNote(application.employerNote || '');
  };

  const confirmUpdate = async () => {
    setBusy(true);
    try {
      const updated = await employerApi.setApplicationStatus(pending.application.id, pending.status, note);
      apps.setData((list) => list.map((a) => (a.id === updated.id ? updated : a)));
      toast.success(`Candidate marked as ${APPLICATION_STATUS[pending.status].label.toLowerCase()}`);
      setPending(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (job.loading || apps.loading) return <div className="page container"><Spinner /></div>;
  const error = job.error || apps.error;
  if (error) return <div className="page container"><ErrorState message={error} onRetry={() => { job.reload(); apps.reload(); }} /></div>;

  const list = filter === 'ALL' ? apps.data : apps.data.filter((a) => a.status === filter);
  const count = (s) => apps.data.filter((a) => a.status === s).length;

  return (
    <div className="page">
      <div className="container stack">
        <p className="small"><Link to="/employer/jobs">&larr; Back to my jobs</Link></p>
        <PageHeader
          title={job.data.title}
          subtitle={`${apps.data.length} applicant${apps.data.length === 1 ? '' : 's'} \u00b7 ${job.data.location}`}
          actions={<><JobStatusBadge status={job.data.status} /><Link to={`/employer/jobs/${id}/edit`} className="btn btn-outline btn-sm">Edit job</Link></>}
        />

        <div className="chip-row">
          {FILTERS.map((f) => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
              {f === 'ALL' ? `All (${apps.data.length})` : `${APPLICATION_STATUS[f].label} (${count(f)})`}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState icon="users" title="No applicants here" text={apps.data.length === 0 ? 'Applications will appear here as candidates apply.' : 'No candidates in this stage.'} />
        ) : (
          list.map((a) => {
            const p = a.applicant;
            const expanded = open === a.id;
            return (
              <div key={a.id} className="card applicant">
                <div className="applicant-top">
                  <span className="avatar">{initials(p.fullName)}</span>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h3>{p.fullName}</h3>
                    <div className="muted small">{p.headline || 'No headline'} &middot; {p.location || 'Location not set'} &middot; {p.experienceYears} yr exp</div>
                    <div className="muted small">Applied {formatDate(a.appliedAt)} ({timeAgo(a.appliedAt)})</div>
                  </div>
                  <ApplicationStatusBadge status={a.status} />
                </div>

                {p.skills.length > 0 && <div className="chip-row">{p.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>}

                <div className="status-actions">
                  {a.status === 'WITHDRAWN' ? (
                    <span className="muted small">The candidate withdrew this application.</span>
                  ) : (
                    ACTIONS.filter((s) => s !== a.status).map((s) => (
                      <button key={s} className={`btn btn-sm ${s === 'REJECTED' ? 'btn-outline' : s === 'OFFERED' ? 'btn-success' : 'btn-outline'}`} onClick={() => startUpdate(a, s)}>
                        {s === 'REJECTED' ? 'Reject' : s === 'OFFERED' ? 'Make offer' : `Mark ${APPLICATION_STATUS[s].label.toLowerCase()}`}
                      </button>
                    ))
                  )}
                  <span className="spacer" />
                  <button className="btn btn-ghost btn-sm" onClick={() => setOpen(expanded ? null : a.id)}>{expanded ? 'Hide profile' : 'View profile'}</button>
                </div>

                {a.employerNote && <div className="note-box"><strong>Your note:</strong> {a.employerNote}</div>}

                {expanded && (
                  <div className="applicant-body">
                    <Detail title="Email">{p.email}</Detail>
                    <Detail title="Phone">{p.phone}</Detail>
                    <div className="span-2"><Detail title="Summary">{p.summary}</Detail></div>
                    <Detail title="Education">{p.education}</Detail>
                    <Detail title="Experience / projects">{p.workExperience}</Detail>
                    <div className="span-2"><Detail title="Cover letter">{a.coverLetter || 'No cover letter provided.'}</Detail></div>
                    <div className="span-2 row">
                      {p.resumeUrl && <a className="btn btn-outline btn-sm" href={p.resumeUrl} target="_blank" rel="noreferrer noopener">Open resume</a>}
                      {p.linkedinUrl && <a className="btn btn-outline btn-sm" href={p.linkedinUrl} target="_blank" rel="noreferrer noopener">LinkedIn / portfolio</a>}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {pending && (
        <Modal
          title={`${APPLICATION_STATUS[pending.status].label}: ${pending.application.applicant.fullName}`}
          onClose={() => !busy && setPending(null)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setPending(null)} disabled={busy}>Cancel</button>
              <button className={`btn ${pending.status === 'REJECTED' ? 'btn-danger' : 'btn-primary'}`} onClick={confirmUpdate} disabled={busy}>
                {busy ? 'Saving...' : 'Confirm'}
              </button>
            </>
          }
        >
          <Field label="Note for the candidate (optional)" hint="Visible to the candidate in their application tracker">
            <textarea rows={4} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Interview scheduled for Monday 10:00 AM" />
          </Field>
        </Modal>
      )}
    </div>
  );
}
