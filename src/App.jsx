import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';
import SeekerDashboard from './pages/seeker/SeekerDashboard.jsx';
import SeekerProfile from './pages/seeker/SeekerProfile.jsx';
import MyApplications from './pages/seeker/MyApplications.jsx';
import SavedJobs from './pages/seeker/SavedJobs.jsx';
import EmployerDashboard from './pages/employer/EmployerDashboard.jsx';
import CompanyProfile from './pages/employer/CompanyProfile.jsx';
import MyJobs from './pages/employer/MyJobs.jsx';
import JobForm from './pages/employer/JobForm.jsx';
import Applicants from './pages/employer/Applicants.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import ManageJobs from './pages/admin/ManageJobs.jsx';

const seeker = (el) => <ProtectedRoute roles={['JOB_SEEKER']}>{el}</ProtectedRoute>;
const employer = (el) => <ProtectedRoute roles={['EMPLOYER']}>{el}</ProtectedRoute>;
const admin = (el) => <ProtectedRoute roles={['ADMIN']}>{el}</ProtectedRoute>;

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main-wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/seeker" element={seeker(<SeekerDashboard />)} />
          <Route path="/seeker/profile" element={seeker(<SeekerProfile />)} />
          <Route path="/seeker/applications" element={seeker(<MyApplications />)} />
          <Route path="/seeker/saved" element={seeker(<SavedJobs />)} />

          <Route path="/employer" element={employer(<EmployerDashboard />)} />
          <Route path="/employer/profile" element={employer(<CompanyProfile />)} />
          <Route path="/employer/jobs" element={employer(<MyJobs />)} />
          <Route path="/employer/jobs/new" element={employer(<JobForm />)} />
          <Route path="/employer/jobs/:id/edit" element={employer(<JobForm />)} />
          <Route path="/employer/jobs/:id/applicants" element={employer(<Applicants />)} />

          <Route path="/admin" element={admin(<AdminDashboard />)} />
          <Route path="/admin/users" element={admin(<ManageUsers />)} />
          <Route path="/admin/jobs" element={admin(<ManageJobs />)} />

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
