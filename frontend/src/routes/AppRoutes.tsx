import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import EmployeeDashboard from '@/pages/EmployeeDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import ChatPage from '@/pages/ChatPage';
import ConversationsPage from '@/pages/ConversationsPage';
import KnowledgeBasePage from '@/pages/KnowledgeBasePage';
import DocumentManagementPage from '@/pages/DocumentManagementPage';
import UserManagementPage from '@/pages/UserManagementPage';
import EvaluationPage from '@/pages/EvaluationPage';
import FeedbackManagementPage from '@/pages/FeedbackManagementPage';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

function DashboardDispatcher() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-600 border-t-transparent" />
          <span className="text-xs font-medium text-surface-500">
            Directing to your authorized dashboard...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || 'employee').toLowerCase();
  const target = role === 'admin' ? '/dashboard/admin' : '/dashboard/employee';
  return <Navigate to={target} replace />;
}

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Root & Dashboard Dispatchers */}
      <Route path="/" element={<DashboardDispatcher />} />
      <Route path="/dashboard" element={<DashboardDispatcher />} />

      {/* Role-Protected Dashboards */}
      <Route
        path="/dashboard/employee"
        element={
          <ProtectedRoute allowedRole="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Conversations History (All authenticated roles) */}
      <Route
        path="/conversations"
        element={
          <ProtectedRoute>
            <ConversationsPage />
          </ProtectedRoute>
        }
      />

      {/* Knowledge Base (All authenticated roles) */}
      <Route
        path="/knowledge"
        element={
          <ProtectedRoute>
            <KnowledgeBasePage />
          </ProtectedRoute>
        }
      />

      {/* Chat Copilot Routes (All authenticated roles) */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:conversationId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      {/* Document Management Routes (Admin Only) */}
      <Route
        path="/admin/documents"
        element={
          <ProtectedRoute allowedRole="admin">
            <DocumentManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRole="admin">
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/evaluation"
        element={
          <ProtectedRoute allowedRole="admin">
            <EvaluationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedback"
        element={
          <ProtectedRoute allowedRole="admin">
            <FeedbackManagementPage />
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

