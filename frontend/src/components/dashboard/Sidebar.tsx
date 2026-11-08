import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquarePlus,
  MessagesSquare,
  BookOpen,
  LogOut,
  Files,
  Users,
  BarChart3,
  ThumbsUp,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '@/types';
import { cn } from '@/utils/helpers';

export interface SidebarProps {
  currentRole: UserRole;
  onLogout?: () => void;
  onSelectItem?: () => void;
}

interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

export function Sidebar({ currentRole, onLogout, onSelectItem }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItems = (): NavItemConfig[] => {
    switch (currentRole) {
      case 'admin':
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="h-4 w-4" />,
            path: '/dashboard/admin',
          },
          {
            id: 'documents',
            label: 'Document Management',
            icon: <Files className="h-4 w-4" />,
            path: '/admin/documents',
          },
          {
            id: 'knowledge',
            label: 'Knowledge Base',
            icon: <BookOpen className="h-4 w-4" />,
            path: '/knowledge',
          },
          {
            id: 'users',
            label: 'User Management',
            icon: <Users className="h-4 w-4" />,
            path: '/admin/users',
          },
          {
            id: 'evaluation',
            label: 'Evaluation & Analytics',
            icon: <BarChart3 className="h-4 w-4" />,
            path: '/admin/evaluation',
          },
          {
            id: 'feedback',
            label: 'Feedback Management',
            icon: <ThumbsUp className="h-4 w-4" />,
            path: '/admin/feedback',
          },
        ];
      case 'employee':
      default:
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="h-4 w-4" />,
            path: '/dashboard/employee',
          },
          {
            id: 'new-chat',
            label: 'New Chat',
            icon: <MessageSquarePlus className="h-4 w-4" />,
            path: '/chat/new',
          },
          {
            id: 'conversations',
            label: 'My Conversations',
            icon: <MessagesSquare className="h-4 w-4" />,
            path: '/conversations',
          },
          {
            id: 'knowledge',
            label: 'Knowledge Base',
            icon: <BookOpen className="h-4 w-4" />,
            path: '/knowledge',
          },
        ];
    }
  };

  const navItems = getNavItems();

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onSelectItem) onSelectItem();
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-surface-200 bg-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2.5 border-b border-surface-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <span className="text-sm font-bold tracking-tight text-surface-900 block leading-tight">
            Enterprise Copilot
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-surface-400 capitalize">
            {currentRole} Console
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-surface-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path.includes('#') &&
              location.pathname + location.hash === item.path);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.path)}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors text-left',
                isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-brand-600' : 'text-surface-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    isActive
                      ? 'bg-brand-200/70 text-brand-900'
                      : 'bg-surface-100 text-surface-600'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section: Logout button */}
      <div className="border-t border-surface-200 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

