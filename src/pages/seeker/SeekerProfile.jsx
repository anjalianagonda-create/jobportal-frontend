import { useEffect, useState } from 'react';
import { errorMessage, fieldErrors, seekerApi } from '../../api/client.js';
import { ErrorState, Field, PageHeader, Spinner } from '../../components/ui.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import { skillsToText, textToSkills } from '../../utils/format.js';

export default function SeekerProfile() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => seekerApi.profile(), []);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        fullName: data.fullName || '',
        phone: data.phone || '',
        location: data.location || '',
        headline: data.headline || '',
        summary: data.summary || '',
        skills: skillsToText(data.skills),
        education: data.education || '',
        workExperience: data.workExperience || '',
        experienceYears: data.experienceYears ?? 0,
        resumeUrl: data.resumeUrl || '',
        linkedinUrl: data.linkedinUrl || '',
      });
    }
  }, [data]);

  if (loading || !form) return <div className="page container">{error ? <ErrorState message={error} onRetry={reload} /> : <Spinner />}</div>;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await seekerApi.updateProfile({
        ...form,
        skills: textToSkills(form.skills),
        experienceYears: Number(form.experienceYears) || 0,
      });
      toast.success('Profile saved');
      reload();
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
        <PageHeader title="My profile" subtitle="Employers see this information when you apply for a job." />
        <form className="card" onSubmit={submit}>
          <div className="form-grid">
            <Field label="Full name" error={errors.fullName} required><input value={form.fullName} onChange={set('fullName')} /></Field>
            <Field label="Email"><input value={data.email} disabled /></Field>
            <Field label="Professional headline" error={errors.headline}><input value={form.headline} onChange={set('headline')} placeholder="e.g. Java Full Stack Developer" /></Field>
            <Field label="Phone" error={errors.phone}><input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" /></Field>
            <Field label="Location" error={errors.location}><input value={form.location} onChange={set('location')} placeholder="City, State" /></Field>
            <Field label="Total experience (years)" error={errors.experienceYears}>
              <input type="number" min="0" max="60" value={form.experienceYears} onChange={set('experienceYears')} />
            </Field>
            <div className="span-2">
              <Field label="Skills" hint="Separate skills with commas, e.g. Java, Spring Boot, React, MySQL">
                <input value={form.skills} onChange={set('skills')} />
              </Field>
              {textToSkills(form.skills).length > 0 && (
                <div className="chip-row" style={{ marginTop: 10 }}>
                  {textToSkills(form.skills).map((s) => <span key={s} className="chip">{s}</span>)}
                </div>
              )}
            </div>
            <div className="span-2"><Field label="Professional summary" error={errors.summary}><textarea rows={4} value={form.summary} onChange={set('summary')} placeholder="A short introduction about you" /></Field></div>
            <div className="span-2"><Field label="Education" error={errors.education}><textarea rows={3} value={form.education} onChange={set('education')} placeholder="Degree, institution, year" /></Field></div>
            <div className="span-2"><Field label="Work experience / projects" error={errors.workExperience}><textarea rows={4} value={form.workExperience} onChange={set('workExperience')} placeholder="Roles, internships and key projects" /></Field></div>
            <Field label="Resume link" error={errors.resumeUrl} hint="Link to your resume (Google Drive, Dropbox, portfolio...)"><input value={form.resumeUrl} onChange={set('resumeUrl')} placeholder="https://" /></Field>
            <Field label="LinkedIn / portfolio" error={errors.linkedinUrl}><input value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://" /></Field>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
