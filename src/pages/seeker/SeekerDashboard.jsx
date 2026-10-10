import { Link } from 'react-router-dom';
import { seekerApi } from '../../api/client.js';
import Icon from '../../components/Icon.jsx';
import { ApplicationStatusBadge, ErrorState, PageHeader, Spinner, StatCard } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import { formatDate } from '../../utils/format.js';

export default function SeekerDashboard() {
  const { user } = useAuth();
  const stats = useFetch(() => seekerApi.stats(), []);
  const apps = useFetch(() => seekerApi.applications(), []);
  const profile = useFetch(() => seekerApi.profile(), []);

  if (stats.loading || apps.loading || profile.loading) return <div className="page container"><Spinner /></div>;
  const error = stats.error || apps.error || profile.error;
  if (error) return <div className="page container"><ErrorState message={error} onRetry={() => { stats.reload(); apps.reload(); profile.reload(); }} /></div>;

  const p = profile.data;
  const checks = [p.headline, p.phone, p.location, p.summary, p.skills.length > 0, p.education, p.workExperience, p.resumeUrl];
  const completion = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const s = stats.data;

  return (
    <div className="page">
      <div className="container stack">
        <PageHeader
          title={`Welcome back, ${user.fullName.split(' ')[0]}`}
          subtitle="Here is a summary of your job search."
          actions={<Link to="/jobs" className="btn btn-primary"><Icon name="search" size={16} /> Find jobs</Link>}
        />

        <div className="grid grid-4">
          <StatCard label="Applications" value={s.applications} icon="file" tone="indigo" />
          <StatCard label="Shortlisted" value={s.shortlisted} icon="check" tone="violet" />
          <StatCard label="Interviews" value={s.interviews} icon="users" tone="cyan" />
          <StatCard label="Offers" value={s.offers} icon="briefcase" tone="green" />
        </div>

        {completion < 100 && (
          <div className="card row" style={{ justifyContent: 'space-between' }}>
            <div>
              <h3>Your profile is {completion}% complete</h3>
              <p className="muted small">Complete profiles get noticed more by employers. Add your skills, education and experience.</p>
            </div>
            <Link to="/seeker/profile" className="btn btn-outline">Complete profile</Link>
          </div>
        )}

        <div className="card card-flush">
          <div className="card-title" style={{ padding: '20px 24px 0' }}>
            <h3>Recent applications</h3>
            <Link to="/seeker/applications" className="small">View all</Link>
          </div>
          {apps.data.length === 0 ? (
            <div style={{ padding: 24 }} className="muted">You have not applied to any jobs yet. <Link to="/jobs">Browse open positions</Link>.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Job</th><th>Company</th><th>Applied</th><th>Status</th></tr></thead>
                <tbody>
                  {apps.data.slice(0, 5).map((a) => (
                    <tr key={a.id}>
                      <td><Link className="cell-title" to={`/jobs/${a.jobId}`}>{a.jobTitle}</Link></td>
                      <td>{a.companyName}</td>
                      <td>{formatDate(a.appliedAt)}</td>
                      <td><ApplicationStatusBadge status={a.status} /></td>
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
