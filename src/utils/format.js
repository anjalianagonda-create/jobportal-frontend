export const JOB_TYPES = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

export const WORK_MODES = { ONSITE: 'On-site', REMOTE: 'Remote', HYBRID: 'Hybrid' };

export const APPLICATION_STATUS = {
  APPLIED: { label: 'Applied', tone: 'blue' },
  UNDER_REVIEW: { label: 'Under review', tone: 'amber' },
  SHORTLISTED: { label: 'Shortlisted', tone: 'violet' },
  INTERVIEW: { label: 'Interview', tone: 'cyan' },
  OFFERED: { label: 'Offered', tone: 'green' },
  REJECTED: { label: 'Rejected', tone: 'red' },
  WITHDRAWN: { label: 'Withdrawn', tone: 'gray' },
};

export const JOB_STATUS = {
  OPEN: { label: 'Open', tone: 'green' },
  CLOSED: { label: 'Closed', tone: 'gray' },
  REMOVED: { label: 'Removed', tone: 'red' },
};

export const ROLE_LABEL = { JOB_SEEKER: 'Job seeker', EMPLOYER: 'Employer', ADMIN: 'Administrator' };

const inr = new Intl.NumberFormat('en-IN');

function lpa(value) {
  const lakhs = value / 100000;
  return lakhs >= 1 ? `${+lakhs.toFixed(1)}L` : inr.format(value);
}

export function formatSalary(min, max) {
  if (min == null && max == null) return 'Not disclosed';
  if (min != null && max != null) return `₹${lpa(min)} - ₹${lpa(max)} / yr`;
  return `₹${lpa(min ?? max)}${min != null ? '+' : ''} / yr`;
}

export function formatExperience(min, max) {
  if (!min && (max == null || max === 0)) return 'Freshers welcome';
  if (max != null && max > min) return `${min}-${max} yrs`;
  return `${min}+ yrs`;
}

export function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDate(value);
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export function skillsToText(skills) {
  return (skills || []).join(', ');
}

export function textToSkills(text) {
  return (text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
