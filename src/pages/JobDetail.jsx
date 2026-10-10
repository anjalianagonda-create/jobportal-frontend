import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { errorMessage, jobsApi, seekerApi } from '../api/client.js';
import Icon from '../components/Icon.jsx';
import { ApplicationStatusBadge, Badge, ErrorState, Field, Modal, Spinner } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { JOB_TYPES, WORK_MODES, formatDate, formatExperience, formatSalary, initials, timeAgo } from '../utils/format.js';

export default function JobDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const toast = useToast();
  const isSeeker = user?.role === 'JOB_SEEKER';

  const { data: job, loading, error, reload } = useFetch(() => jobsApi.get(id), [id]);
  const [application, setApplication] = useState(null);
  const [saved, setSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isSeeker) return;
    Promise.all([seekerApi.applications(), seekerApi.saved()])
      .then(([apps, savedJobs]) => {
        setApplication(apps.find((a) => String(a.jobId) === String(id)) || null);
        setSaved(savedJobs.some((j) => String(j.id) === String(id)));
      })
      .catch(() => {});
  }, [isSeeker, id]);

  const submitApplication = async () => {
    setSubmitting(true);
    try {
      const created = await seekerApi.apply(id, { coverLetter });
      setApplication(created);
      setApplyOpen(false);
      toast.success('Application submitted successfully');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSave = async () => {
    try {
      if (saved) await seekerApi.unsave(id);
      else await seekerApi.save(id);
      setSaved(!saved);
      toast.success(saved ? 'Removed from saved jobs' : 'Job saved');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading) return <div className="page container"><Spinner /></div>;
  if (error) return <div className="page container"><ErrorState message={error} onRetry={reload} /></div>;

  const expired = job.deadline && new Date(job.deadline + 'T23:59:59') < new Date();
  const acceptingApplications = job.status === 'OPEN' && !expired;

  const renderAction = () => {
    if (!user) {
      return (
        <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary btn-block">Sign in to apply</Link>
      );
    }
    if (!isSeeker) {
      return <div className="alert alert-info">Only job seeker accounts can apply for jobs.</div>;
    }
    if (application) {
      return (
        <div className="stack" style={{ gap: 10 }}>
          <div className="alert alert-success">You applied on {formatDate(application.appliedAt)}.</div>
          <div className="row"><span className="muted small">Status:</span><ApplicationStatusBadge status={application.status} /></div>
          <Link to="/seeker/applications" className="btn btn-outline btn-block">Track application</Link>
        </div>
      );
    }
    if (!acceptingApplications) {
      return <div className="alert alert-error">This job is no longer accepting applications.</div>;
    }
    return (
      <div className="stack" style={{ gap: 10 }}>
        <button className="btn btn-primary btn-block btn-lg" onClick={() => setApplyOpen(true)}>Apply now</button>
        <button className="btn btn-outline btn-block" onClick={toggleSave}>
          <Icon name="bookmark" size={16} /> {saved ? 'Saved' : 'Save for later'}
        </button>
      </div>
    );
  };

  return (
    <div className="page">
      <div className="container">
        <p className="small" style={{ marginBottom: 16 }}><Link to="/jobs">&larr; Back to all jobs</Link></p>

        <div className="detail-layout">
          <div className="stack">
            <div className="card">
              <div className="detail-head">
                <div className="job-card-logo">{initials(job.companyName)}</div>
                <div className="stack" style={{ gap: 8 }}>
                  <h1>{job.title}</h1>
                  <div className="muted">{job.companyName}{job.companyIndustry ? ` · ${job.companyIndustry}` : ''}</div>
                  <div className="chip-row">
                    <Badge tone="indigo">{JOB_TYPES[job.jobType]}</Badge>
                    <Badge tone="cyan">{WORK_MODES[job.workMode]}</Badge>
                    {job.status !== 'OPEN' && <Badge tone="gray">Closed</Badge>}
                    {expired && <Badge tone="red">Deadline passed</Badge>}
                  </div>
                </div>
              </div>
            </div>

            <div className="card prose">
              <h3>About the role</h3>
              <p className="pre-wrap">{job.description}</p>
              {job.eligibility && (<><h3>Eligibility criteria</h3><p className="pre-wrap">{job.eligibility}</p></>)}
              {job.skills.length > 0 && (
                <>
                  <h3>Skills required</h3>
                  <div className="chip-row">{job.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
                </>
              )}
              {job.companyDescription && (<><h3>About {job.companyName}</h3><p className="pre-wrap">{job.companyDescription}</p></>)}
            </div>
          </div>

          <aside className="sticky-side">
            <div className="card">{renderAction()}</div>
            <div className="card facts">
              <div className="fact"><Icon name="pin" /><div><small>Location</small><strong>{job.location}</strong></div></div>
              <div className="fact"><Icon name="briefcase" /><div><small>Experience</small><strong>{formatExperience(job.minExperience, job.maxExperience)}</strong></div></div>
              <div className="fact"><Icon name="rupee" /><div><small>Salary</small><strong>{formatSalary(job.salaryMin, job.salaryMax)}</strong></div></div>
              <div className="fact"><Icon name="users" /><div><small>Openings</small><strong>{job.openings}</strong></div></div>
              <div className="fact"><Icon name="clock" /><div><small>Apply before</small><strong>{job.deadline ? formatDate(job.deadline) : 'Open until filled'}</strong></div></div>
              <div className="fact"><Icon name="file" /><div><small>Posted</small><strong>{timeAgo(job.createdAt)}</strong></div></div>
            </div>
          </aside>
        </div>
      </div>

      {applyOpen && (
        <Modal
          title={`Apply to ${job.title}`}
          onClose={() => !submitting && setApplyOpen(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setApplyOpen(false)} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={submitApplication} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit application'}</button>
            </>
          }
        >
          <div className="stack">
            <p className="muted small">Your profile (skills, education and experience) is shared with {job.companyName}. Keep it up to date for the best chance.</p>
            <Field label="Cover letter (optional)" hint={`${coverLetter.length}/3000`}>
              <textarea rows={7} maxLength={3000} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Tell the employer why you are a great fit..." />
            </Field>
            <Link to="/seeker/profile" className="small">Review or update my profile</Link>
          </div>
        </Modal>
      )}
    </div>
  );
}
