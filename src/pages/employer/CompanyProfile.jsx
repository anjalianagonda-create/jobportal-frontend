import { useEffect, useState } from 'react';
import { employerApi, errorMessage, fieldErrors } from '../../api/client.js';
import { ErrorState, Field, PageHeader, Spinner } from '../../components/ui.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useFetch from '../../hooks/useFetch.js';

const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function CompanyProfile() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => employerApi.profile(), []);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        contactName: data.contactName || '',
        companyName: data.companyName || '',
        industry: data.industry || '',
        companySize: data.companySize || '',
        website: data.website || '',
        location: data.location || '',
        description: data.description || '',
      });
    }
  }, [data]);

  if (loading || !form) return <div className="page container">{error ? <ErrorState message={error} onRetry={reload} /> : <Spinner />}</div>;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim()) return setErrors({ companyName: 'Company name is required' });
    setSaving(true);
    setErrors({});
    try {
      await employerApi.updateProfile(form);
      toast.success('Company profile saved');
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
        <PageHeader title="Company profile" subtitle="This information is shown to candidates on your job postings." />
        <form className="card" onSubmit={submit}>
          <div className="form-grid">
            <Field label="Company name" error={errors.companyName} required><input value={form.companyName} onChange={set('companyName')} /></Field>
            <Field label="Industry" error={errors.industry}><input value={form.industry} onChange={set('industry')} placeholder="e.g. Information Technology" /></Field>
            <Field label="Company size">
              <select value={form.companySize} onChange={set('companySize')}>
                <option value="">Select size</option>
                {SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </Field>
            <Field label="Headquarters / location" error={errors.location}><input value={form.location} onChange={set('location')} /></Field>
            <Field label="Website" error={errors.website}><input value={form.website} onChange={set('website')} placeholder="https://" /></Field>
            <Field label="Recruiter name" error={errors.contactName}><input value={form.contactName} onChange={set('contactName')} /></Field>
            <Field label="Contact email"><input value={data.email} disabled /></Field>
            <div className="span-2">
              <Field label="About the company" error={errors.description}>
                <textarea rows={5} value={form.description} onChange={set('description')} placeholder="What does your company do? What is the culture like?" />
              </Field>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
