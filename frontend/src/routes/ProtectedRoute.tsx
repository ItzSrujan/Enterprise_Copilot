import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole | UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole,
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-600 border-t-transparent" />
          <span className="text-xs font-medium text-surface-500">
            Verifying authentication session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole) {
    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    const userRole = (user.role || '').toLowerCase();
    const hasPermission = roles.some((r) => r.toLowerCase() === userRole);

    if (!hasPermission) {
      // Redirect to their authorized role dashboard
      const target = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/employee';
      return <Navigate to={target} replace />;
    }
  }

  return <>{children}</>;
};

