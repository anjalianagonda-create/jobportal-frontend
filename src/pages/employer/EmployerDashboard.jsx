import { Link } from 'react-router-dom';
import { employerApi } from '../../api/client.js';
import Icon from '../../components/Icon.jsx';
import { ErrorState, JobStatusBadge, PageHeader, Spinner, StatCard } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import { formatDate } from '../../utils/format.js';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const stats = useFetch(() => employerApi.stats(), []);
  const jobs = useFetch(() => employerApi.jobs(), []);

  if (stats.loading || jobs.loading) return <div className="page container"><Spinner /></div>;
  const error = stats.error || jobs.error;
  if (error) return <div className="page container"><ErrorState message={error} onRetry={() => { stats.reload(); jobs.reload(); }} /></div>;
  const s = stats.data;

  return (
    <div className="page">
      <div className="container stack">
        <PageHeader
          title={`Hello, ${user.fullName.split(' ')[0]}`}
          subtitle="Overview of your recruitment pipeline."
          actions={<Link to="/employer/jobs/new" className="btn btn-primary"><Icon name="plus" size={16} /> Post a job</Link>}
        />

        <div className="grid grid-4">
          <StatCard label="Open jobs" value={s.openJobs} icon="briefcase" tone="indigo" />
          <StatCard label="Total applicants" value={s.applicants} icon="users" tone="cyan" />
          <StatCard label="Shortlisted" value={s.shortlisted} icon="check" tone="violet" />
          <StatCard label="Offers made" value={s.offers} icon="file" tone="green" />
        </div>

        <div className="card card-flush">
          <div className="card-title" style={{ padding: '20px 24px 0' }}>
            <h3>Your latest postings</h3>
            <Link to="/employer/jobs" className="small">Manage all</Link>
          </div>
          {jobs.data.length === 0 ? (
            <div style={{ padding: 24 }} className="muted">You have not posted any jobs yet. <Link to="/employer/jobs/new">Post your first job</Link>.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Title</th><th>Posted</th><th>Applicants</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {jobs.data.slice(0, 5).map((j) => (
                    <tr key={j.id}>
                      <td className="cell-title">{j.title}</td>
                      <td>{formatDate(j.createdAt)}</td>
                      <td>{j.applicantCount}</td>
                      <td><JobStatusBadge status={j.status} /></td>
                      <td className="text-right"><Link className="btn btn-outline btn-sm" to={`/employer/jobs/${j.id}/applicants`}>View applicants</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
