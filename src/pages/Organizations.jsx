import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import SuperAdminNavbar from '../components/SuperAdminNavbar';
import API from '../services/api';
import {
  FiPlus, FiSearch, FiBriefcase, FiUser,
  FiX, FiCheck, FiRefreshCw, FiPower, FiUserPlus,
  FiAlertTriangle, FiUsers
} from 'react-icons/fi';

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ── Create Org Modal ──────────────────────────────────────────────────────────
function CreateOrgModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', slug: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.name.trim() || !form.slug.trim()) {
    toast.error('Name and slug are required');
    return;
  }

  setLoading(true);

  try {
    const res = await API.post('/super-admin/organizations', {
      name: form.name,           // ✅ FIX
      subdomain: form.slug,      // ✅ FIX
    });

    toast.success('Organization created successfully');
    onCreated(res.data);
    onClose();

  } catch (err) {
    toast.error(err.response?.data?.detail || 'Failed to create organization');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Organization</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><FiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Organization Name</label>
            <input type="text" placeholder="e.g. TCS India" value={form.name}
              onChange={e => setForm({ name: e.target.value, slug: slugify(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Slug</label>
            <input type="text" placeholder="e.g. tcs-india" value={form.slug}
              onChange={e => setForm({ ...form, slug: slugify(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm" required />
            <p className="text-xs text-gray-400 mt-1">URL: ?org=<span className="font-semibold">{form.slug || 'slug'}</span></p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiCheck className="w-4 h-4" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Create Admin Modal ────────────────────────────────────────────────────────
function CreateAdminModal({ org, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('All fields are required'); return; }
    setLoading(true);
    try {
      await API.post(`/super-admin/organizations/${org.id}/admin`, form);
      toast.success('Admin created successfully');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create admin');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Assign Admin</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><FiX className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          For: <span className="font-semibold text-purple-600 dark:text-purple-400">{org.name}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Admin Name' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'admin@company.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 6 characters' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required minLength={f.key === 'password' ? 6 : undefined} />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiUser className="w-4 h-4" />}
              Assign Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function Organizations() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [createAdminFor, setCreateAdminFor] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => { fetchOrgs(); }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/super-admin/organizations');
      const normalized = (res.data || []).map(org => ({
        ...org,
        slug: org.slug || org.subdomain,
        admin_email: org.admin_email || org.admin?.email || org.admins?.[0]?.email || null,
        admin_name:  org.admin_name  || org.admin?.name  || org.admins?.[0]?.name  || null,
      }));
      setOrgs(normalized);
    } catch { toast.error('Failed to load organizations'); }
    finally { setLoading(false); }
  };

  const filtered = orgs.filter(org => {
    const q = search.toLowerCase();
    const matchSearch = org.name?.toLowerCase().includes(q) || org.slug?.toLowerCase().includes(q);
    const matchFilter = adminFilter === 'all' ? true : adminFilter === 'has_admin' ? !!org.admin_email : !org.admin_email;
    return matchSearch && matchFilter;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const toggleActive = async (org) => {
    setTogglingId(org.id);
    const isActive = org.is_active !== false;
    try {
      await API.put(`/super-admin/organizations/${org.id}/${isActive ? 'deactivate' : 'activate'}`);
      setOrgs(prev => prev.map(o => o.id === org.id ? { ...o, is_active: !isActive } : o));
      toast.success(`Organization ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    } finally { setTogglingId(null); }
  };

  const totalOrgs   = orgs.length;
  const withAdmin   = orgs.filter(o => o.admin_email).length;
  const noAdmin     = orgs.filter(o => !o.admin_email).length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 lg:ml-56 pt-14 lg:pt-0">
      <Toaster position="top-right" />
      <SuperAdminNavbar />

      {showCreateOrg && (
        <CreateOrgModal onClose={() => setShowCreateOrg(false)} onCreated={org => setOrgs(p => [org, ...p])} />
      )}
      {createAdminFor && (
        <CreateAdminModal org={createAdminFor} onClose={() => setCreateAdminFor(null)} onCreated={fetchOrgs} />
      )}

      <div className="px-8 py-8">

        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <FiBriefcase className="w-7 h-7 text-purple-600" />
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Organizations</h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-10">Manage all tenant organizations</p>
          </div>
          <button
            onClick={() => setShowCreateOrg(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-500/25"
          >
            <FiPlus className="w-4 h-4" />
            Create Organization
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Total */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiBriefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">Total Organizations</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{totalOrgs}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">All registered organizations</p>
              </div>
            </div>
          </div>
          {/* With Admin */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border-t-4 border-green-500">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiUsers className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">With Admin</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{withAdmin}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Organizations with assigned admin</p>
              </div>
            </div>
          </div>
          {/* No Admin */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border-t-4 border-red-400">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">No Admin Assigned</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{noAdmin}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Organizations needing admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 px-4 py-3 mb-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search organizations by name or slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={adminFilter}
              onChange={e => setAdminFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-medium"
            >
              <option value="all">All Organizations</option>
              <option value="has_admin">Has Admin</option>
              <option value="no_admin">No Admin</option>
            </select>
            <button onClick={fetchOrgs} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
            <FiBriefcase className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No organizations found</p>
            <button onClick={() => setShowCreateOrg(true)} className="mt-4 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium text-sm transition-colors">
              Create First Organization
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Organization</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {filtered.map(org => (
                    <tr key={org.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/40 transition-colors">
                      {/* Org name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {org.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{org.name}</span>
                        </div>
                      </td>
                      {/* Slug */}
                      <td className="py-4 px-5">
                        <code className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-mono">
                          {org.slug || org.subdomain}
                        </code>
                      </td>
                      {/* Admin */}
                      <td className="py-4 px-5">
                        {org.admin_email ? (
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">Active</span>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{org.admin_email}</p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">No Admin Assigned</span>
                        )}
                      </td>
                      {/* Created */}
                      <td className="py-4 px-5">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(org.created_at)}</span>
                      </td>
                      {/* Status */}
                      <td className="py-4 px-5">
                        {org.is_active !== false ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">Active</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Inactive</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCreateAdminFor(org)}
                            title="Assign Admin"
                            className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                          >
                            <FiUserPlus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleActive(org)}
                            disabled={togglingId === org.id}
                            title={org.is_active !== false ? 'Deactivate' : 'Activate'}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              org.is_active !== false
                                ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50'
                                : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50'
                            }`}
                          >
                            {togglingId === org.id
                              ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              : <FiPower className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
              Showing {filtered.length} of {orgs.length} organizations
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Organizations;
