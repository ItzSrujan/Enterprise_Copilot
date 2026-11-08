import { useState } from 'react';
import { Search, Bell, ShieldCheck } from 'lucide-react';
import { UserRole } from '@/types';

export interface HeaderProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  userEmail?: string;
  userName?: string;
  showRoleSwitcher?: boolean;
}

export function Header({
  currentRole,
  onRoleChange,
  userName = 'Authorized User',
  showRoleSwitcher = false,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-surface-200 bg-white px-4 sm:px-6">
      {/* Search Input */}
      <div className="flex flex-1 items-center max-w-md">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-surface-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search enterprise knowledge, tickets, policies..."
            className="block w-full rounded-md border border-surface-300 bg-surface-50/70 py-1.5 pl-9 pr-3 text-xs text-surface-900 placeholder:text-surface-400 transition-colors focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </div>
      </div>

      {/* Right Controls: Role Switcher & Profile */}
      <div className="flex items-center gap-3">
        {showRoleSwitcher && onRoleChange ? (
          <div className="flex items-center rounded-lg border border-surface-200 bg-surface-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onRoleChange('employee')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                currentRole === 'employee'
                  ? 'bg-white text-brand-700 font-semibold shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              Employee
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('admin')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                currentRole === 'admin'
                  ? 'bg-white text-brand-700 font-semibold shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              Admin
            </button>
          </div>
        ) : (
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-surface-200 bg-surface-100 px-3 py-1 text-xs font-semibold text-surface-700 capitalize">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
            <span>{currentRole} Console</span>
          </div>
        )}

        {/* Notifications Icon */}
        <button
          type="button"
          className="relative rounded-md p-1.5 text-surface-500 hover:bg-surface-100 hover:text-surface-700 focus:outline-none"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-600" />
        </button>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 border-l border-surface-200 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-100 border border-surface-200 text-surface-700 font-semibold text-xs">
            {userName.charAt(0)}
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-semibold text-surface-900 leading-tight">
              {userName}
            </span>
            <span className="block text-[11px] text-surface-500 capitalize">
              {currentRole} Role
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

