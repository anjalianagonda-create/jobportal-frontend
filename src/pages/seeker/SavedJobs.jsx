import { Link } from 'react-router-dom';
import { errorMessage, seekerApi } from '../../api/client.js';
import JobCard from '../../components/JobCard.jsx';
import { EmptyState, ErrorState, PageHeader, Spinner } from '../../components/ui.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useFetch from '../../hooks/useFetch.js';

export default function SavedJobs() {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useFetch(() => seekerApi.saved(), []);

  const remove = async (job) => {
    try {
      await seekerApi.unsave(job.id);
      setData((list) => list.filter((j) => j.id !== job.id));
      toast.success('Removed from saved jobs');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading) return <div className="page container"><Spinner /></div>;
  if (error) return <div className="page container"><ErrorState message={error} onRetry={reload} /></div>;

  return (
    <div className="page">
      <div className="container stack">
        <PageHeader title="Saved jobs" subtitle="Jobs you bookmarked to apply for later." />
        {data.length === 0 ? (
          <EmptyState icon="bookmark" title="No saved jobs" text="Use the bookmark icon on any job to save it here."
            action={<Link to="/jobs" className="btn btn-primary">Browse jobs</Link>} />
        ) : (
          <div className="job-list">
            {data.map((job) => <JobCard key={job.id} job={job} showSave saved onToggleSave={remove} />)}
          </div>
        )}
      </div>
    </div>
  );
}
