import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, errorMessage } from '../../api/client.js';
import { ConfirmDialog, EmptyState, ErrorState, JobStatusBadge, PageHeader, Pagination, Spinner } from '../../components/ui.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import { formatDate } from '../../utils/format.js';

export default function ManageJobs() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [confirm, setConfirm] = useState(null); // { job, status }
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload } = useFetch(
    () => adminApi.jobs({ q: search || undefined, status: status || undefined, page, size: 10 }),
    [search, status, page]
  );

  const apply = async () => {
    setBusy(true);
    try {
      await adminApi.setJobStatus(confirm.job.id, confirm.status);
      toast.success(confirm.status === 'REMOVED' ? 'Job removed from the platform' : 'Job restored');
      setConfirm(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="container stack">
        <PageHeader title="Job moderation" subtitle="Removed jobs are hidden from job seekers and cannot be edited by the employer." />

        <form className="card row" onSubmit={(e) => { e.preventDefault(); setPage(0); setSearch(q.trim()); }}>
          <input style={{ flex: 1, minWidth: 220 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by job title or company" />
          <select style={{ width: 'auto' }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="REMOVED">Removed</option>
          </select>
          <button className="btn btn-primary" type="submit">Search</button>
        </form>

        {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} /> : data.content.length === 0 ? (
          <EmptyState icon="briefcase" title="No jobs found" text="Try a different search or status." />
        ) : (
          <>
            <div className="card card-flush">
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Job</th><th>Company</th><th>Location</th><th>Posted</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {data.content.map((j) => (
                      <tr key={j.id}>
                        <td className="cell-title">{j.status === 'REMOVED' ? j.title : <Link to={`/jobs/${j.id}`}>{j.title}</Link>}</td>
                        <td>{j.companyName}</td>
                        <td>{j.location}</td>
                        <td>{formatDate(j.createdAt)}</td>
                        <td><JobStatusBadge status={j.status} /></td>
                        <td className="text-right">
                          {j.status === 'REMOVED' ? (
                            <button className="btn btn-outline btn-sm" onClick={() => setConfirm({ job: j, status: 'OPEN' })}>Restore</button>
                          ) : (
                            <button className="btn btn-outline btn-sm" onClick={() => setConfirm({ job: j, status: 'REMOVED' })}>Remove</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm.status === 'REMOVED' ? 'Remove this job?' : 'Restore this job?'}
          message={confirm.status === 'REMOVED'
            ? `"${confirm.job.title}" by ${confirm.job.companyName} will be hidden from the platform.`
            : `"${confirm.job.title}" will be reopened and become visible to job seekers.`}
          confirmLabel={confirm.status === 'REMOVED' ? 'Remove job' : 'Restore job'}
          danger={confirm.status === 'REMOVED'}
          busy={busy}
          onConfirm={apply}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
