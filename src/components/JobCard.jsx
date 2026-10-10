import { Link } from 'react-router-dom';
import { JOB_TYPES, WORK_MODES, formatExperience, formatSalary, initials, timeAgo } from '../utils/format.js';
import Icon from './Icon.jsx';
import { Badge } from './ui.jsx';

export default function JobCard({ job, saved, onToggleSave, showSave }) {
  return (
    <article className="job-card">
      <div className="job-card-logo">{initials(job.companyName)}</div>
      <div className="job-card-main">
        <div className="job-card-top">
          <div>
            <h3><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3>
            <div className="job-company">{job.companyName}</div>
          </div>
          {showSave && (
            <button
              className={`icon-btn ${saved ? 'is-saved' : ''}`}
              onClick={() => onToggleSave(job)}
              aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
              title={saved ? 'Remove from saved jobs' : 'Save job'}
            >
              <Icon name="bookmark" size={20} />
            </button>
          )}
        </div>

        <div className="meta-row">
          <span><Icon name="pin" size={15} /> {job.location}</span>
          <span><Icon name="briefcase" size={15} /> {formatExperience(job.minExperience, job.maxExperience)}</span>
          <span><Icon name="rupee" size={15} /> {formatSalary(job.salaryMin, job.salaryMax)}</span>
        </div>

        <div className="chip-row">
          <Badge tone="indigo">{JOB_TYPES[job.jobType]}</Badge>
          <Badge tone="cyan">{WORK_MODES[job.workMode]}</Badge>
          {job.skills.slice(0, 4).map((s) => <span key={s} className="chip">{s}</span>)}
          {job.skills.length > 4 && <span className="chip chip-more">+{job.skills.length - 4}</span>}
        </div>
      </div>
      <div className="job-card-side">
        <span className="posted">{timeAgo(job.createdAt)}</span>
        <Link to={`/jobs/${job.id}`} className="btn btn-outline btn-sm">View details</Link>
      </div>
    </article>
  );
}
