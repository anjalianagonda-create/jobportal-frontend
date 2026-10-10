import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employerApi, errorMessage, fieldErrors } from '../../api/client.js';
import { ErrorState, Field, PageHeader, Spinner } from '../../components/ui.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import { JOB_TYPES, WORK_MODES, skillsToText, textToSkills } from '../../utils/format.js';

const EMPTY = {
  title: '', description: '', eligibility: '', skills: '', location: '', jobType: 'FULL_TIME', workMode: 'ONSITE',
  minExperience: 0, maxExperience: '', salaryMin: '', salaryMax: '', openings: 1, deadline: '',
};

const num = (v) => (v === '' || v == null ? null : Number(v));

export default function JobForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => (editing ? employerApi.job(id) : Promise.resolve(null)), [id]);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title, description: data.description, eligibility: data.eligibility || '',
        skills: skillsToText(data.skills), location: data.location, jobType: data.jobType, workMode: data.workMode,
        minExperience: data.minExperience, maxExperience: data.maxExperience ?? '', salaryMin: data.salaryMin ?? '',
        salaryMax: data.salaryMax ?? '', openings: data.openings, deadline: data.deadline || '',
      });
    } else if (!editing) {
      setForm(EMPTY);
    }
  }, [data, editing]);

  if (loading) return <div className="page container"><Spinner /></div>;
  if (error) return <div className="page container"><ErrorState message={error} onRetry={reload} /></div>;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Job title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (form.maxExperience !== '' && Number(form.maxExperience) < Number(form.minExperience)) e.maxExperience = 'Cannot be lower than minimum experience';
    if (form.salaryMin !== '' && form.salaryMax !== '' && Number(form.salaryMax) < Number(form.salaryMin)) e.salaryMax = 'Cannot be lower than minimum salary';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      eligibility: form.eligibility.trim(),
      skills: textToSkills(form.skills),
      location: form.location.trim(),
      jobType: form.jobType,
      workMode: form.workMode,
      minExperience: Number(form.minExperience) || 0,
      maxExperience: num(form.maxExperience),
      salaryMin: num(form.salaryMin),
      salaryMax: num(form.salaryMax),
      openings: Number(form.openings) || 1,
      deadline: form.deadline || null,
    };
    try {
      if (editing) await employerApi.updateJob(id, payload);
      else await employerApi.createJob(payload);
      toast.success(editing ? 'Job updated' : 'Job posted successfully');
      navigate('/employer/jobs');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <PageHeader title={editing ? 'Edit job posting' : 'Post a new job'} subtitle="Clear, complete postings attract better candidates." />
        <form className="card" onSubmit={submit} noValidate>
          <div className="form-grid">
            <div className="span-2"><Field label="Job title" error={errors.title} required><input value={form.title} onChange={set('title')} placeholder="e.g. Java Full Stack Developer" /></Field></div>
            <Field label="Job type" required>
              <select value={form.jobType} onChange={set('jobType')}>{Object.entries(JOB_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            </Field>
            <Field label="Work mode" required>
              <select value={form.workMode} onChange={set('workMode')}>{Object.entries(WORK_MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            </Field>
            <Field label="Location" error={errors.location} required><input value={form.location} onChange={set('location')} placeholder="City or 'Remote'" /></Field>
            <Field label="Openings" error={errors.openings}><input type="number" min="1" value={form.openings} onChange={set('openings')} /></Field>
            <Field label="Minimum experience (years)" error={errors.minExperience} required><input type="number" min="0" value={form.minExperience} onChange={set('minExperience')} /></Field>
            <Field label="Maximum experience (years)" error={errors.maxExperience}><input type="number" min="0" value={form.maxExperience} onChange={set('maxExperience')} /></Field>
            <Field label="Minimum salary (₹ per year)" error={errors.salaryMin}><input type="number" min="0" step="10000" value={form.salaryMin} onChange={set('salaryMin')} placeholder="e.g. 600000" /></Field>
            <Field label="Maximum salary (₹ per year)" error={errors.salaryMax}><input type="number" min="0" step="10000" value={form.salaryMax} onChange={set('salaryMax')} placeholder="e.g. 1000000" /></Field>
            <div className="span-2"><Field label="Required skills" hint="Separate with commas, e.g. Java, Spring Boot, React"><input value={form.skills} onChange={set('skills')} /></Field></div>
            <div className="span-2"><Field label="Job description" error={errors.description} required><textarea rows={7} value={form.description} onChange={set('description')} placeholder="Responsibilities, day-to-day work, team and growth opportunities" /></Field></div>
            <div className="span-2"><Field label="Eligibility criteria" error={errors.eligibility} hint="Degree, certifications, notice period, etc."><textarea rows={3} value={form.eligibility} onChange={set('eligibility')} /></Field></div>
            <Field label="Application deadline" error={errors.deadline} hint="Leave empty to keep the job open until you close it"><input type="date" value={form.deadline} onChange={set('deadline')} /></Field>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/employer/jobs')} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Publish job'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
