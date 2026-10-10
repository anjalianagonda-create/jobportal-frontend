import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage, seekerApi } from '../../api/client.js';
import Icon from '../../components/Icon.jsx';
import { ApplicationStatusBadge, ConfirmDialog, EmptyState, ErrorState, PageHeader, Spinner } from '../../components/ui.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import { APPLICATION_STATUS, formatDate, timeAgo } from '../../utils/format.js';

const FLOW = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED'];
const FILTERS = ['ALL', ...FLOW, 'REJECTED', 'WITHDRAWN'];

function Tracker({ status }) {
  const current = FLOW.indexOf(status);
  if (current === -1) return null; // rejected / withdrawn are shown through the badge only
  return (
    <div className="tracker" aria-label={`Progress: ${APPLICATION_STATUS[status].label}`}>
      {FLOW.map((step, i) => (
        <div key={step} className={`tracker-step ${i <= current ? 'done' : ''} ${i === current ? 'current' : ''}`}>
          <span className="tracker-dot">{i <= current && <Icon name="check" size={12} />}</span>
          {APPLICATION_STATUS[step].label}
        </div>
      ))}
    </div>
  );
}

export default function MyApplications() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => seekerApi.applications(), []);
  const [filter, setFilter] = useState('ALL');
  const [withdrawing, setWithdrawing] = useState(null);
  const [busy, setBusy] = useState(false);

  const withdraw = async () => {
    setBusy(true);
    try {
      await seekerApi.withdraw(withdrawing.id);
      toast.success('Application withdrawn');
      setWithdrawing(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="page container"><Spinner /></div>;
  if (error) return <div className="page container"><ErrorState message={error} onRetry={reload} /></div>;

  const list = filter === 'ALL' ? data : data.filter((a) => a.status === filter);

  return (
    <div className="page">
      <div className="container stack">
        <PageHeader title="My applications" subtitle={`${data.length} application${data.length === 1 ? '' : 's'} submitted`} />

        <div className="chip-row">
          {FILTERS.map((f) => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
              {f === 'ALL' ? 'All' : APPLICATION_STATUS[f].label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState icon="file" title={data.length === 0 ? 'No applications yet' : 'Nothing in this status'}
            text={data.length === 0 ? 'Find a job you like and apply. Your applications will be tracked here.' : 'Try another status filter.'}
            action={data.length === 0 && <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>} />
        ) : (
          list.map((a) => (
            <div key={a.id} className="card app-card">
              <div className="app-card-top">
                <div>
                  <h3><Link to={`/jobs/${a.jobId}`}>{a.jobTitle}</Link></h3>
                  <div className="muted small">{a.companyName} &middot; {a.jobLocation} &middot; Applied {formatDate(a.appliedAt)} ({timeAgo(a.appliedAt)})</div>
                </div>
                <ApplicationStatusBadge status={a.status} />
              </div>
              <Tracker status={a.status} />
              {a.employerNote && <div className="note-box"><strong>Note from employer:</strong> {a.employerNote}</div>}
              {!['WITHDRAWN', 'REJECTED', 'OFFERED'].includes(a.status) && (
                <div className="row">
                  <span className="muted small">Last updated {timeAgo(a.updatedAt)}</span>
                  <span className="spacer" />
                  <button className="btn btn-outline btn-sm" onClick={() => setWithdrawing(a)}>Withdraw</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {withdrawing && (
        <ConfirmDialog
          title="Withdraw application?"
          message={`You are about to withdraw your application for "${withdrawing.jobTitle}" at ${withdrawing.companyName}. This cannot be undone.`}
          confirmLabel="Withdraw"
          danger
          busy={busy}
          onConfirm={withdraw}
          onCancel={() => setWithdrawing(null)}
        />
      )}
    </div>
  );
}
