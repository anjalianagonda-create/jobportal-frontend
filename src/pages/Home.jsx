import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/client.js';
import JobCard from '../components/JobCard.jsx';
import Icon from '../components/Icon.jsx';
import { Spinner } from '../components/ui.jsx';
import useFetch from '../hooks/useFetch.js';
import { HOME_BY_ROLE, useAuth } from '../context/AuthContext.jsx';

const POPULAR = ['Java', 'React', 'Python', 'SQL', 'Spring Boot'];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const { data, loading } = useFetch(() => jobsApi.search({ size: 5, sort: 'newest' }), []);

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Find the job that fits you. <span>Hire the talent that fits your team.</span></h1>
          <p>One platform for job seekers, employers and administrators to manage profiles, openings, applications and hiring decisions.</p>

          <form className="search-bar" onSubmit={submit}>
            <div className="search-input">
              <Icon name="search" />
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Job title, skill or company" aria-label="Keyword" />
            </div>
            <div className="search-input">
              <Icon name="pin" />
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or location" aria-label="Location" />
            </div>
            <button className="btn btn-primary btn-lg" type="submit">Search jobs</button>
          </form>

          <div className="hero-tags">
            <span>Popular:</span>
            {POPULAR.map((s) => (
              <button key={s} type="button" onClick={() => navigate(`/jobs?skill=${encodeURIComponent(s)}`)}>{s}</button>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Latest opportunities</h2>
              <p>Freshly posted by verified employers on the platform.</p>
            </div>
            <Link to="/jobs" className="btn btn-outline btn-sm">View all jobs <Icon name="arrowRight" size={16} /></Link>
          </div>
          {loading ? (
            <Spinner />
          ) : data?.content?.length ? (
            <div className="job-list">{data.content.map((job) => <JobCard key={job.id} job={job} />)}</div>
          ) : (
            <div className="empty"><h3>No jobs posted yet</h3><p>Check back soon, or create an employer account to post the first opening.</p></div>
          )}
        </section>

        <section className="section">
          <div className="section-head"><div><h2>How it works</h2><p>Three roles, one streamlined hiring workflow.</p></div></div>
          <div className="grid grid-3">
            <div className="card feature">
              <span className="stat-icon tone-indigo"><Icon name="user" size={20} /></span>
              <h3>Job seekers</h3>
              <p>Build a profile with skills, education and experience, search and filter openings, apply in one click and track every application in real time.</p>
            </div>
            <div className="card feature">
              <span className="stat-icon tone-green"><Icon name="building" size={20} /></span>
              <h3>Employers</h3>
              <p>Publish openings with eligibility criteria, review applicant profiles, shortlist candidates and manage the entire recruitment pipeline.</p>
            </div>
            <div className="card feature">
              <span className="stat-icon tone-violet"><Icon name="shield" size={20} /></span>
              <h3>Administrators</h3>
              <p>Oversee user accounts, moderate job postings and keep the platform trustworthy, with secure role-based access.</p>
            </div>
          </div>
        </section>

        <div className="cta">
          <div>
            <h2>Ready to take the next step?</h2>
            <p>Join as a job seeker or an employer. It only takes a minute.</p>
          </div>
          {user ? (
            <Link to={HOME_BY_ROLE[user.role]} className="btn btn-outline btn-lg">Go to dashboard</Link>
          ) : (
            <Link to="/register" className="btn btn-outline btn-lg">Create free account</Link>
          )}
        </div>
      </div>
      <div style={{ height: 56 }} />
    </>
  );
}
