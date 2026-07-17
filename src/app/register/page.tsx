"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Check,
  Loader2,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";
import { registerUser } from "@/app/actions/auth";
import { toast } from "sonner";

const roles = [
  {
    value: "RECRUITER",
    label: "Recruiter",
    desc: "Create jobs and manage candidates",
  },
  {
    value: "HIRING_MANAGER",
    label: "Hiring Manager",
    desc: "Evaluate candidates and manage pipeline",
  },
  {
    value: "INTERVIEWER",
    label: "Interviewer",
    desc: "Review and score candidates",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("RECRUITER");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("role", selectedRole);
      const result = await registerUser(formData);

      if (result.success) {
        toast.success("Account created! Welcome to Vetted.");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch {
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page dot-pattern">
      <div className="auth-shell">
        <div className="auth-brand">
          <Link href="/" className="auth-logo">
            <span className="auth-logo-mark">
              <Brain size={22} />
            </span>
            <span className="text-3xl font-semibold text-[var(--color-text-primary)]">
              Vetted<span className="text-[var(--color-accent-mustard)]">.ai</span>
            </span>
          </Link>
          <p className="text-sm text-[var(--color-text-muted)]">
            Create an account for your hiring workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-card dashboard-card animate-fade-in">
          <div className="auth-fields">
            <div className="auth-field">
              <label htmlFor="name" className="input-label">
                Full Name
              </label>
              <div className="input-icon-wrap">
                <User size={17} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="input-field input-field-with-icon"
                  minLength={2}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <div className="input-icon-wrap">
                <Mail size={17} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="input-field input-field-with-icon"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="input-icon-wrap">
                <Lock size={17} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Min 8 chars, upper + lower + number"
                  className="input-field input-field-with-icon"
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword" className="input-label">
                Confirm Password
              </label>
              <div className="input-icon-wrap">
                <Lock size={17} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Repeat your password"
                  className="input-field input-field-with-icon"
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="input-label flex items-center gap-1.5">
                <Shield size={13} /> Your Role
              </label>
              <div className="auth-role-grid">
                {roles.map((role) => {
                  const isActive = selectedRole === role.value;

                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={`auth-role-option ${isActive ? "auth-role-option-active" : ""}`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span
                            className={`block text-sm font-semibold ${
                              isActive
                                ? "text-[var(--color-accent-mustard)]"
                                : "text-[var(--color-text-primary)]"
                            }`}
                          >
                            {role.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">
                            {role.desc}
                          </span>
                        </span>
                        {isActive && (
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-mustard)] text-white">
                            <Check size={12} />
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary auth-submit">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="auth-helper">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--color-accent-mustard)] no-underline hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
