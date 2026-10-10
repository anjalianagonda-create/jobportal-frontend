import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobsApi, seekerApi, errorMessage } from '../api/client.js';
import JobCard from '../components/JobCard.jsx';
import Icon from '../components/Icon.jsx';
import { EmptyState, ErrorState, Field, Pagination, Spinner } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import useFetch from '../hooks/useFetch.js';
import { JOB_TYPES, WORK_MODES } from '../utils/format.js';

const PAGE_SIZE = 8;

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  const isSeeker = user?.role === 'JOB_SEEKER';

  const get = (k) => params.get(k) || '';
  const [text, setText] = useState({ keyword: get('keyword'), location: get('location'), skill: get('skill'), experience: get('experience') });

  // keep the text inputs in sync when the URL changes (e.g. from the home page or back button)
  useEffect(() => {
    setText({ keyword: get('keyword'), location: get('location'), skill: get('skill'), experience: get('experience') });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const page = Number(get('page') || 0);
  const query = {
    keyword: get('keyword') || undefined,
    location: get('location') || undefined,
    skill: get('skill') || undefined,
    experience: get('experience') || undefined,
    jobType: get('jobType') || undefined,
    workMode: get('workMode') || undefined,
    sort: get('sort') || 'newest',
    page,
    size: PAGE_SIZE,
  };

  const { data, loading, error, reload } = useFetch(() => jobsApi.search(query), [params.toString()]);
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    if (!isSeeker) return;
    seekerApi.saved().then((list) => setSavedIds(new Set(list.map((j) => j.id)))).catch(() => {});
  }, [isSeeker]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, v)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const applyText = (e) => {
    e.preventDefault();
    update({ keyword: text.keyword.trim(), location: text.location.trim(), skill: text.skill.trim(), experience: text.experience });
  };

  const clearAll = () => setParams(new URLSearchParams());
  const hasFilters = ['keyword', 'location', 'skill', 'experience', 'jobType', 'workMode'].some((k) => get(k));

  const toggleSave = async (job) => {
    const wasSaved = savedIds.has(job.id);
    try {
      if (wasSaved) await seekerApi.unsave(job.id);
      else await seekerApi.save(job.id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        wasSaved ? next.delete(job.id) : next.add(job.id);
        return next;
      });
      toast.success(wasSaved ? 'Removed from saved jobs' : 'Job saved');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Find jobs</h1>
            <p>Search by keyword, location, skills and experience level.</p>
          </div>
        </div>

        <div className="jobs-layout">
          <aside className="filters">
            <form className="card stack" onSubmit={applyText}>
              <div className="card-title" style={{ marginBottom: 0 }}>
                <h3>Filters</h3>
                {hasFilters && <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll}>Clear all</button>}
              </div>
              <Field label="Keyword">
                <input value={text.keyword} onChange={(e) => setText({ ...text, keyword: e.target.value })} placeholder="Title, company, skill" />
              </Field>
              <Field label="Location">
                <input value={text.location} onChange={(e) => setText({ ...text, location: e.target.value })} placeholder="e.g. Hyderabad" />
              </Field>
              <Field label="Skill">
                <input value={text.skill} onChange={(e) => setText({ ...text, skill: e.target.value })} placeholder="e.g. React" />
              </Field>
              <Field label="My experience (years)" hint="Shows jobs you already qualify for">
                <input type="number" min="0" max="60" value={text.experience} onChange={(e) => setText({ ...text, experience: e.target.value })} placeholder="e.g. 2" />
              </Field>
              <Field label="Job type">
                <select value={get('jobType')} onChange={(e) => update({ jobType: e.target.value })}>
                  <option value="">All types</option>
                  {Object.entries(JOB_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Work mode">
                <select value={get('workMode')} onChange={(e) => update({ workMode: e.target.value })}>
                  <option value="">Any mode</option>
                  {Object.entries(WORK_MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <button className="btn btn-primary" type="submit"><Icon name="search" size={16} /> Apply filters</button>
            </form>
          </aside>

          <section>
            <div className="results-bar">
              <span className="muted">
                {loading ? 'Searching...' : `${data?.totalElements ?? 0} job${data?.totalElements === 1 ? '' : 's'} found`}
              </span>
              <label className="row small">
                <span className="muted">Sort by</span>
                <select style={{ width: 'auto' }} value={query.sort} onChange={(e) => update({ sort: e.target.value })}>
                  <option value="newest">Newest first</option>
                  <option value="salary">Highest salary</option>
                  <option value="deadline">Closing soon</option>
                </select>
              </label>
            </div>

            {loading ? (
              <Spinner label="Finding jobs..." />
            ) : error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : data.content.length === 0 ? (
              <EmptyState icon="search" title="No matching jobs" text="Try different keywords, widen the location or clear some filters."
                action={hasFilters && <button className="btn btn-outline btn-sm" onClick={clearAll}>Clear filters</button>} />
            ) : (
              <>
                <div className="job-list">
                  {data.content.map((job) => (
                    <JobCard key={job.id} job={job} showSave={isSeeker} saved={savedIds.has(job.id)} onToggleSave={toggleSave} />
                  ))}
                </div>
                <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => { update({ page: p }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
