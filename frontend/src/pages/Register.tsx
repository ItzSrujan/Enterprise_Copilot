import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Database,
  FileText,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { UserRole, RegisterData } from '@/types';

export default function RegisterPage() {
  const { register, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role switching handler: clear invitation code when switching to employee
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'employee') {
      setInvitationCode('');
    }
    setValidationError(null);
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);
    setSuccessMessage(null);

    // Retrieve values from FormData or state (for autofill resilience)
    const formData = new FormData(e.currentTarget);
    const rawFullName = (formData.get('full_name') as string) || fullName;
    const rawEmail = (formData.get('email') as string) || email;
    const rawPassword = (formData.get('password') as string) || password;
    const rawConfirmPassword = (formData.get('confirm_password') as string) || confirmPassword;
    const rawInvitationCode = (formData.get('invitation_code') as string) || invitationCode;

    // 1. Full name validation
    const trimmedName = rawFullName.trim();
    if (!trimmedName) {
      setValidationError('Full name is required.');
      return;
    }
    if (trimmedName.length < 2) {
      setValidationError('Full name must be at least 2 characters.');
      return;
    }

    // 2. Email validation
    const trimmedEmail = rawEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setValidationError('Work email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setValidationError('Please enter a valid work email address.');
      return;
    }

    // 3. Password validation
    if (!rawPassword) {
      setValidationError('Password is required.');
      return;
    }
    if (rawPassword.length < 8) {
      setValidationError('Password must be at least 8 characters in length.');
      return;
    }

    // 4. Confirm password validation
    if (!rawConfirmPassword) {
      setValidationError('Please confirm your password.');
      return;
    }
    if (rawPassword !== rawConfirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    // 5. Invitation code validation for Admin
    const trimmedCode = rawInvitationCode.trim();
    if (selectedRole === 'admin' && !trimmedCode) {
      setValidationError('An invitation code is required to register an Admin account.');
      return;
    }

    // 6. Build API payload
    const payload: RegisterData = {
      full_name: trimmedName,
      email: trimmedEmail,
      password: rawPassword,
      confirm_password: rawConfirmPassword,
      role: selectedRole,
    };

    // Conditional inclusion: never send invitation_code for employee
    if (selectedRole !== 'employee' && trimmedCode) {
      payload.invitation_code = trimmedCode;
    }

    try {
      setIsSubmitting(true);
      await register(payload);

      setSuccessMessage(
        'Account successfully created! Redirecting to the sign-in page...'
      );

      // Redirect to login after brief pause for user feedback
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setApiError(err.message || 'Failed to create account. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = validationError || apiError;

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
              <span>Enterprise User Registration</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white leading-snug">
              Join your organization&apos;s verified AI knowledge workspace.
            </h2>
            <p className="mt-3 text-sm text-surface-300 leading-relaxed">
              Create an account with role-segregated access to company SOPs, support resolution playbooks, and knowledge administration tools.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-800 border border-surface-700 text-brand-400">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Instant Employee Access</h3>
                <p className="text-xs text-surface-400 leading-normal">
                  Standard employee accounts can be registered immediately with work credentials.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-800 border border-surface-700 text-brand-400">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Privileged Roles Protected</h3>
                <p className="text-xs text-surface-400 leading-normal">
                  Administrative roles require an authorized enterprise invitation code.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-800 border border-surface-700 text-brand-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Authoritative Backend Validation</h3>
                <p className="text-xs text-surface-400 leading-normal">
                  All permissions, roles, and invitation keys are verified strictly on the backend.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Compliance & Security Footer */}
        <div className="relative z-10 border-t border-surface-800/80 pt-6 flex items-center justify-between text-xs text-surface-400">
          <span>Enterprise Security Protocol</span>
          <span>Role-Based Access Control (RBAC)</span>
        </div>
      </div>

      {/* Right Registration Form Container */}
      <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 md:px-8 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-surface-900">
                Enterprise Copilot
              </span>
              <span className="block text-[11px] uppercase tracking-wider text-surface-500 font-medium">
                Account Registration
              </span>
            </div>
          </div>

          {/* Form Card Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900">
              Create an account
            </h1>
            <p className="mt-1 text-xs text-surface-500 leading-normal">
              Select your organization role and enter your details below.
            </p>
          </div>

          {/* Success Alert Banner */}
          {successMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 shadow-xs animate-in fade-in duration-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Registration successful</span>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Alert Banner */}
          {displayError && (
            <div className="mb-6 flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 shadow-xs animate-in fade-in duration-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Registration error</span>
                <span>{displayError}</span>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Role Selector Segmented Control */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-100 p-1 border border-surface-200 shadow-inner">
                {roleOptions.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleChange(role.id)}
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
                {selectedRole === 'employee'
                  ? 'Standard access to company knowledge base and Copilot chat.'
                  : 'Admin role registration requires a valid enterprise invitation code.'}
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-surface-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="e.g. Jane Doe"
                  className="block w-full rounded-md border border-surface-300 bg-white py-2.5 pl-10 pr-3 text-sm text-surface-900 placeholder:text-surface-400 transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/15"
                />
              </div>
            </div>

            {/* Work Email */}
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
                  autoComplete="email"
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-surface-700"
                >
                  Password
                </label>
                <span className="text-[11px] text-surface-400">Min. 8 characters</span>
              </div>
              <div className="relative rounded-md shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-surface-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm_password"
                className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-surface-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="••••••••"
                  className="block w-full rounded-md border border-surface-300 bg-white py-2.5 pl-10 pr-10 text-sm text-surface-900 placeholder:text-surface-400 transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/15"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-surface-400 hover:text-surface-700 focus:outline-none transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Conditional Invitation Code Field (Admin Only) */}
            {selectedRole === 'admin' && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3.5 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="invitation_code"
                    className="block text-xs font-semibold uppercase tracking-wider text-amber-900"
                  >
                    Invitation Code
                  </label>
                  <span className="text-[11px] font-medium text-amber-700">Required</span>
                </div>
                <div className="relative rounded-md shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="invitation_code"
                    name="invitation_code"
                    type="text"
                    required
                    value={invitationCode}
                    onChange={(e) => {
                      setInvitationCode(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Enter admin invitation code"
                    className="block w-full rounded-md border border-amber-300 bg-white py-2 pl-9 pr-3 text-xs text-surface-900 placeholder:text-surface-400 transition-colors focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 font-mono"
                  />
                </div>
                <p className="text-[11px] text-amber-800 leading-normal">
                  Administrative roles require authorization. Contact your system administrator if you do not have an invitation code.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full h-10 text-sm font-medium shadow-sm transition-all"
                loading={isSubmitting || authLoading}
                disabled={isSubmitting || authLoading || !!successMessage}
              >
                Create {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Account
              </Button>
            </div>

            {/* Link to Login */}
            <div className="pt-1 text-center">
              <p className="text-xs text-surface-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>

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

