"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Brain, Loader2, Lock, Mail } from "lucide-react";
import { loginUser } from "@/app/actions/auth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await loginUser(formData);

      if (result.success) {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error || "Login failed");
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
            Sign in to continue to your hiring dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-card dashboard-card animate-fade-in">
          <div className="auth-fields">
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
                  defaultValue="sam@vetted.ai"
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
                  defaultValue="Password123"
                  placeholder="Enter your password"
                  className="input-field input-field-with-icon"
                  autoComplete="current-password"
                  minLength={8}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary auth-submit">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="auth-demo">
          Demo login: <span className="font-semibold text-[var(--color-text-primary)]">sam@vetted.ai</span>
          {" / "}
          <span className="font-semibold text-[var(--color-text-primary)]">Password123</span>
        </div>

        <p className="auth-helper">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[var(--color-accent-mustard)] no-underline hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
