import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Shield,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  RotateCw,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth';
import { User, UserRole } from '@/types';
import { formatDate } from '@/utils/helpers';

export default function UserManagementPage() {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.listUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const roleMatches = roleFilter === 'all' || u.role.toLowerCase() === roleFilter;
    const queryMatches =
      (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return roleMatches && queryMatches;
  });

  const adminCount = users.filter((u) => u.role.toLowerCase() === 'admin').length;
  const employeeCount = users.filter((u) => u.role.toLowerCase() === 'employee').length;

  const userName =
    user?.full_name ||
    (user?.email
      ? user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Admin');

  return (
    <DashboardLayout
      currentRole="admin"
      userName={userName}
      userEmail={user?.email || 'admin@company.com'}
      onLogout={logout}
    >
      <div className="space-y-6 pb-12 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-surface-200 bg-surface-100 px-2.5 py-0.5 text-xs font-semibold text-surface-700">
                <Users className="h-3.5 w-3.5 text-brand-600" />
                Access Control
              </span>
              <span className="text-xs text-surface-400">&bull;</span>
              <span className="text-xs text-surface-500">
                Two-Role Architecture (Admin &amp; Employee)
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
              User Directory &amp; RBAC
            </h1>
            <p className="mt-1 text-xs text-surface-500">
              Manage verified enterprise accounts with segregated permissions for administrators and employees.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-300 bg-white px-3.5 py-2 text-xs font-semibold text-surface-700 shadow-xs hover:bg-surface-50 transition-colors self-start sm:self-auto"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              Total Accounts
            </span>
            <div className="mt-1 text-2xl font-bold text-surface-900 font-mono">
              {users.length}
            </div>
            <span className="text-[11px] text-surface-400">Authenticated in database</span>
          </div>

          <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              Administrators
            </span>
            <div className="mt-1 text-2xl font-bold text-brand-700 font-mono">
              {adminCount}
            </div>
            <span className="text-[11px] text-brand-600 font-medium">Privileged console access</span>
          </div>

          <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              Employees
            </span>
            <div className="mt-1 text-2xl font-bold text-indigo-700 font-mono">
              {employeeCount}
            </div>
            <span className="text-[11px] text-indigo-600 font-medium">Knowledge &amp; chat access</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-surface-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by full name or email address..."
              className="block w-full rounded-lg border border-surface-300 bg-white py-2.5 pl-10 pr-4 text-xs text-surface-900 placeholder:text-surface-400 transition-colors focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>

          {/* Role Filter Tabs (Admin and Employee ONLY) */}
          <div className="flex items-center gap-1 rounded-lg border border-surface-200 bg-surface-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                roleFilter === 'all'
                  ? 'bg-white text-surface-900 font-semibold shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              All Roles ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('admin')}
              className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                roleFilter === 'admin'
                  ? 'bg-white text-brand-700 font-semibold shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              Admin ({adminCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('employee')}
              className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                roleFilter === 'employee'
                  ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              Employee ({employeeCount})
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Failed to Retrieve Users</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchUsers}
              className="font-semibold text-rose-700 underline hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-xl border border-surface-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-surface-500">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent mb-2" />
              <span>Loading user directory from database...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-8 w-8 text-surface-400 mb-2" />
              <h3 className="text-sm font-semibold text-surface-900">
                {searchQuery || roleFilter !== 'all' ? 'No matching users found' : 'No users registered yet'}
              </h3>
              <p className="mt-1 text-xs text-surface-500">
                {searchQuery || roleFilter !== 'all'
                  ? 'Try changing your search keywords or role filter.'
                  : 'New user registrations will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-surface-150 bg-surface-50 text-[11px] font-semibold uppercase tracking-wider text-surface-500">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Registered</th>
                    <th className="px-4 py-3.5 text-right">User ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filteredUsers.map((u) => {
                    const isAdmin = u.role.toLowerCase() === 'admin';
                    return (
                      <tr key={u.id} className="hover:bg-surface-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                isAdmin
                                  ? 'bg-brand-100 text-brand-700 border border-brand-200'
                                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              }`}
                            >
                              {(u.full_name || u.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-surface-900">
                                {u.full_name || 'Named User'}
                              </div>
                              <div className="text-[11px] text-surface-500 font-mono">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-[10px] font-semibold text-brand-700">
                              <Shield className="h-3 w-3" />
                              Administrator
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                              <UserIcon className="h-3 w-3" />
                              Employee
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {u.is_active ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-surface-200 bg-surface-100 px-2 py-0.5 text-[10px] font-semibold text-surface-600">
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-surface-500">
                          {u.created_at ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-surface-400" />
                              {formatDate(u.created_at)}
                            </span>
                          ) : (
                            <span>Active Account</span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-right font-mono text-surface-400">
                          #{u.id}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

