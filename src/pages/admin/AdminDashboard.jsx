import { Link } from 'react-router-dom';
import { adminApi } from '../../api/client.js';
import { ErrorState, PageHeader, Spinner, StatCard } from '../../components/ui.jsx';
import useFetch from '../../hooks/useFetch.js';

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch(() => adminApi.stats(), []);
  if (loading) return <div className="page container"><Spinner /></div>;
  if (error) return <div className="page container"><ErrorState message={error} onRetry={reload} /></div>;

  return (
    <div className="page">
      <div className="container stack">
        <PageHeader title="Platform overview" subtitle="Monitor users, job postings and hiring activity." />
        <div className="grid grid-4">
          <StatCard label="Total users" value={data.totalUsers} icon="users" tone="indigo" />
          <StatCard label="Job seekers" value={data.jobSeekers} icon="user" tone="cyan" />
          <StatCard label="Employers" value={data.employers} icon="building" tone="violet" />
          <StatCard label="Applications" value={data.applications} icon="file" tone="green" />
          <StatCard label="Total jobs" value={data.totalJobs} icon="briefcase" tone="indigo" />
          <StatCard label="Open jobs" value={data.openJobs} icon="check" tone="green" />
          <StatCard label="Removed jobs" value={data.removedJobs} icon="x" tone="red" />
        </div>
        <div className="grid grid-2">
          <div className="card">
            <h3>User management</h3>
            <p className="muted" style={{ margin: '6px 0 14px' }}>Search accounts, review roles and activate or deactivate users.</p>
            <Link to="/admin/users" className="btn btn-outline">Manage users</Link>
          </div>
          <div className="card">
            <h3>Job moderation</h3>
            <p className="muted" style={{ margin: '6px 0 14px' }}>Review postings and remove those that violate platform guidelines.</p>
            <Link to="/admin/jobs" className="btn btn-outline">Moderate jobs</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
