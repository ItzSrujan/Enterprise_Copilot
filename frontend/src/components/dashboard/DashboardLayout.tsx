import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { UserRole } from '@/types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export interface DashboardLayoutProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  showRoleSwitcher?: boolean;
  children?: React.ReactNode;
}

export function DashboardLayout({
  currentRole,
  onRoleChange,
  userName = 'Authorized User',
  userEmail = 'user@company.com',
  onLogout,
  showRoleSwitcher = false,
  children,
}: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-50 font-sans text-surface-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar currentRole={currentRole} onLogout={onLogout} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-surface-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-xl z-50">
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="rounded-md p-1.5 text-surface-500 hover:bg-surface-100 hover:text-surface-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar
              currentRole={currentRole}
              onLogout={onLogout}
              onSelectItem={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header Bar with Hamburger */}
        <div className="flex items-center justify-between border-b border-surface-200 bg-white px-4 py-2.5 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-md p-1.5 text-surface-600 hover:bg-surface-100 hover:text-surface-900"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-xs font-bold text-surface-800">
            Enterprise Copilot
          </span>
          <div className="w-5" />
        </div>

        {/* Global Dashboard Header */}
        <Header
          currentRole={currentRole}
          onRoleChange={onRoleChange}
          userName={userName}
          userEmail={userEmail}
          showRoleSwitcher={showRoleSwitcher}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children ? children : <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}

