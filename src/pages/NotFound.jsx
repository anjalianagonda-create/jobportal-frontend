import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui.jsx';

export default function NotFound() {
  return (
    <div className="page container">
      <EmptyState icon="search" title="Page not found" text="The page you are looking for does not exist or has been moved."
        action={<Link to="/" className="btn btn-primary">Back to home</Link>} />
    </div>
  );
}
