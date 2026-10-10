import { useState } from 'react';
import { Link } from 'react-router-dom';
import { employerApi, errorMessage } from '../../api/client.js';
import Icon from '../../components/Icon.jsx';
import { ConfirmDialog, EmptyState, ErrorState, JobStatusBadge, PageHeader, Spinner } from '../../components/ui.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import { JOB_TYPES, WORK_MODES, formatDate } from '../../utils/format.js';

export default function MyJobs() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => employerApi.jobs(), []);
  const [confirm, setConfirm] = useState(null); // { job, status }
  const [busy, setBusy] = useState(false);

  const changeStatus = async () => {
    setBusy(true);
    try {
      await employerApi.setJobStatus(confirm.job.id, confirm.status);
      toast.success(confirm.status === 'CLOSED' ? 'Job closed' : 'Job reopened');
      setConfirm(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="page container"><Spinner /></div>;
  if (error) return <div className="page container"><ErrorState message={error} onRetry={reload} /></div>;

  return (
    <div className="page">
      <div className="container stack">
        <PageHeader
          title="My job postings"
          subtitle={`${data.length} posting${data.length === 1 ? '' : 's'}`}
          actions={<Link to="/employer/jobs/new" className="btn btn-primary"><Icon name="plus" size={16} /> Post a job</Link>}
        />

        {data.length === 0 ? (
          <EmptyState icon="briefcase" title="No job postings yet" text="Create your first job posting to start receiving applications."
            action={<Link to="/employer/jobs/new" className="btn btn-primary">Post a job</Link>} />
        ) : (
          <div className="card card-flush">
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Job</th><th>Type</th><th>Posted</th><th>Deadline</th><th>Applicants</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {data.map((j) => (
                    <tr key={j.id}>
                      <td>
                        <div className="cell-title">{j.title}</div>
                        <div className="muted small">{j.location} &middot; {WORK_MODES[j.workMode]}</div>
                      </td>
                      <td>{JOB_TYPES[j.jobType]}</td>
                      <td>{formatDate(j.createdAt)}</td>
                      <td>{j.deadline ? formatDate(j.deadline) : '-'}</td>
                      <td><Link to={`/employer/jobs/${j.id}/applicants`}><strong>{j.applicantCount}</strong></Link></td>
                      <td><JobStatusBadge status={j.status} /></td>
                      <td>
                        <div className="cell-actions">
                          <Link className="btn btn-outline btn-sm" to={`/employer/jobs/${j.id}/applicants`}>Applicants</Link>
                          <Link className="btn btn-outline btn-sm" to={`/employer/jobs/${j.id}/edit`}><Icon name="edit" size={14} /> Edit</Link>
                          {j.status === 'OPEN' ? (
                            <button className="btn btn-ghost btn-sm" onClick={() => setConfirm({ job: j, status: 'CLOSED' })}>Close</button>
                          ) : (
                            <button className="btn btn-ghost btn-sm" onClick={() => setConfirm({ job: j, status: 'OPEN' })}>Reopen</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm.status === 'CLOSED' ? 'Close this job?' : 'Reopen this job?'}
          message={confirm.status === 'CLOSED'
            ? `"${confirm.job.title}" will be hidden from job seekers and will stop accepting applications.`
            : `"${confirm.job.title}" will become visible again and accept applications.`}
          confirmLabel={confirm.status === 'CLOSED' ? 'Close job' : 'Reopen job'}
          danger={confirm.status === 'CLOSED'}
          busy={busy}
          onConfirm={changeStatus}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
