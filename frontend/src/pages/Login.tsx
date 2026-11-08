import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Database,
  CheckCircle2,
  FileText,
  Sparkles,
  User as UserIcon,
  Headphones,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';

export default function LoginPage() {
  const { login, loading, user, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    // Retrieve values from FormData or state (ensures browser autofill & password managers are captured)
    const formData = new FormData(e.currentTarget);
    const rawEmail = (formData.get('email') as string) || email;
    const rawPassword = (formData.get('password') as string) || password;

    const trimmedEmail = rawEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setValidationError('Please enter your work email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setValidationError('Please enter a valid work email address.');
      return;
    }

    if (!rawPassword) {
      setValidationError('Please enter your account password.');
      return;
    }

    if (rawPassword.length < 8) {
      setValidationError('Password must be at least 8 characters in length.');
      return;
    }

    try {
      setIsSubmitting(true);
      const verifiedUser = await login({ email: trimmedEmail, password: rawPassword }, selectedRole);
      navigate(`/dashboard/${(verifiedUser.role || selectedRole).toLowerCase()}`);
    } catch {
      // Error is caught and surfaced via auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = validationError || authError;

  const roleOptions: Array<{ id: UserRole; label: string; icon: React.ReactNode }> = [
    {
      id: 'employee',
      label: 'Employee',
      icon: <UserIcon className="h-4 w-4" />,
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <Shield className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* Left Feature Showcase Banner (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-surface-900 p-12 text-white relative overflow-hidden border-r border-surface-800">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Top Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                Enterprise Copilot
              </span>
              <span className="block text-xs uppercase tracking-widest text-surface-400 font-medium">
                Knowledge &amp; Support System
              </span>
            </div>
          </div>
        </div>

        {/* Core Value Proposition */}
        <div className="relative z-10 space-y-8 max-w-lg my-auto">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-surface-700 bg-surface-800/80 px-3 py-1 text-xs font-medium text-brand-300 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              <span>Grounded Retrieval-Augmented Generation</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white leading-snug">
              Accurate, verified answers from your enterprise knowledge base.
            </h2>
            <p className="mt-3 text-sm text-surface-300 leading-relaxed">
              Designed for enterprise support teams and employees. Combines dense vector
              search with BM25 keyword matching and real-time citation validation.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-800 border border-surface-700 text-brand-400">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Hybrid Retrieval Pipeline</h3>
                <p className="text-xs text-surface-400 leading-normal">
                  Vector search &amp; BM25 fused with Reciprocal Rank Fusion and Cross-Encoder reranking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-800 border border-surface-700 text-brand-400">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Validated Citations</h3>
                <p className="text-xs text-surface-400 leading-normal">
                  Every assistant answer is verified against indexed documents with exact source attribution.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-800 border border-surface-700 text-brand-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Role-Based Access Control</h3>
                <p className="text-xs text-surface-400 leading-normal">
                  Segregated privileges for Employees, Support Specialists, and System Administrators.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Compliance & Security Footer */}
        <div className="relative z-10 border-t border-surface-800/80 pt-6 flex items-center justify-between text-xs text-surface-400">
          <span>Enterprise Security Protocol</span>
          <span>JWT Auth &bull; 256-bit Encryption</span>
        </div>
      </div>

      {/* Right Sign-in Form Container */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-surface-900">
                Enterprise Copilot
              </span>
              <span className="block text-[11px] uppercase tracking-wider text-surface-500 font-medium">
                Support &amp; Knowledge
              </span>
            </div>
          </div>

          {/* Active Session Notification (if already logged in) */}
          {isAuthenticated && user && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50/80 p-3.5 text-xs text-brand-950 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />
                <span>
                  Active session: <strong>{user.email}</strong> ({user.role})
                </span>
              </div>
              <Link
                to={`/dashboard/${(user.role || 'employee').toLowerCase()}`}
                className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-900 underline ml-2 shrink-0"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Form Card Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900">
              Sign in to your account
            </h1>
            <p className="mt-1.5 text-xs text-surface-500 leading-normal">
              Select your role and enter credentials to access your enterprise dashboard.
            </p>
          </div>

          {/* Error Alert Banner */}
          {displayError && (
            <div className="mb-6 flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 shadow-xs animate-in fade-in duration-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Authentication error</span>
                <span>{displayError}</span>
              </div>
            </div>
          )}

          {/* Sign-in Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Role Selector Segmented Control */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-2">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-100 p-1 border border-surface-200 shadow-inner">
                {roleOptions.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.id);
                        if (validationError) setValidationError(null);
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-white text-brand-700 font-semibold shadow-xs border border-surface-200/80'
                          : 'text-surface-600 hover:text-surface-900 hover:bg-surface-200/50 border border-transparent'
                      }`}
                    >
                      <span className={isSelected ? 'text-brand-600' : 'text-surface-400'}>
                        {role.icon}
                      </span>
                      <span>{role.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-[11px] text-surface-400">
                Select your assigned role. Backend verification enforces actual authorization.
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1.5"
              >
                Work Email
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-surface-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="name@company.com"
                  className="block w-full rounded-md border border-surface-300 bg-white py-2.5 pl-10 pr-3 text-sm text-surface-900 placeholder:text-surface-400 transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/15"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-surface-700"
                >
                  Password
                </label>
                <span className="text-[11px] text-surface-400">
                  Min. 8 characters
                </span>
              </div>
              <div className="relative rounded-md shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-surface-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="••••••••"
                  className="block w-full rounded-md border border-surface-300 bg-white py-2.5 pl-10 pr-10 text-sm text-surface-900 placeholder:text-surface-400 transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-surface-400 hover:text-surface-700 focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full h-10 text-sm font-medium shadow-sm transition-all"
                loading={isSubmitting || loading}
              >
                Sign in as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </Button>
            </div>

            {/* Link to Registration */}
            <div className="pt-1 text-center">
              <p className="text-xs text-surface-600">
                Don&apos;t have an account yet?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </form>

          {/* Quick Role Guidelines for Verification */}
          <div className="mt-8 rounded-md border border-surface-200 bg-surface-50 p-3.5 text-xs text-surface-600">
            <div className="font-semibold text-surface-800 mb-1 flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Role-Based Access
            </div>
            <p className="text-[11px] text-surface-500 leading-normal">
              Sign in with your assigned account. Access to document management and RAG evaluation requires <strong>Admin</strong> credentials.
            </p>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-surface-200 text-center">
            <p className="text-[11px] text-surface-400">
              Enterprise Knowledge &amp; Support Copilot &bull; Strictly Confidential
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

