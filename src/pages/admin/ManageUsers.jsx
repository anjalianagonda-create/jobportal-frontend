import { useState } from 'react';
import { adminApi, errorMessage } from '../../api/client.js';
import { Badge, ConfirmDialog, EmptyState, ErrorState, PageHeader, Pagination, Spinner } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import { ROLE_LABEL, formatDate } from '../../utils/format.js';

export default function ManageUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload } = useFetch(
    () => adminApi.users({ q: search || undefined, role: role || undefined, page, size: 10 }),
    [search, role, page]
  );

  const toggle = async () => {
    setBusy(true);
    try {
      await adminApi.setUserActive(confirm.id, !confirm.active);
      toast.success(confirm.active ? 'User deactivated' : 'User activated');
      setConfirm(null);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="container stack">
        <PageHeader title="User management" subtitle="Deactivated users can no longer sign in, and their jobs are hidden." />

        <form className="card row" onSubmit={(e) => { e.preventDefault(); setPage(0); setSearch(q.trim()); }}>
          <input style={{ flex: 1, minWidth: 220 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" />
          <select style={{ width: 'auto' }} value={role} onChange={(e) => { setRole(e.target.value); setPage(0); }}>
            <option value="">All roles</option>
            <option value="JOB_SEEKER">Job seekers</option>
            <option value="EMPLOYER">Employers</option>
            <option value="ADMIN">Administrators</option>
          </select>
          <button className="btn btn-primary" type="submit">Search</button>
        </form>

        {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} /> : data.content.length === 0 ? (
          <EmptyState icon="users" title="No users found" text="Try a different search or role filter." />
        ) : (
          <>
            <div className="card card-flush">
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {data.content.map((u) => (
                      <tr key={u.id}>
                        <td className="cell-title">{u.fullName}</td>
                        <td>{u.email}</td>
                        <td><Badge tone={u.role === 'ADMIN' ? 'violet' : u.role === 'EMPLOYER' ? 'cyan' : 'indigo'}>{ROLE_LABEL[u.role]}</Badge></td>
                        <td>{formatDate(u.createdAt)}</td>
                        <td><Badge tone={u.active ? 'green' : 'red'}>{u.active ? 'Active' : 'Deactivated'}</Badge></td>
                        <td className="text-right">
                          {u.role !== 'ADMIN' && u.id !== me.id && (
                            <button className={`btn btn-sm ${u.active ? 'btn-outline' : 'btn-primary'}`} onClick={() => setConfirm(u)}>
                              {u.active ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm.active ? 'Deactivate user?' : 'Activate user?'}
          message={confirm.active
            ? `${confirm.fullName} will be signed out and unable to log in. Their job postings will be hidden from the public.`
            : `${confirm.fullName} will be able to sign in again.`}
          confirmLabel={confirm.active ? 'Deactivate' : 'Activate'}
          danger={confirm.active}
          busy={busy}
          onConfirm={toggle}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
