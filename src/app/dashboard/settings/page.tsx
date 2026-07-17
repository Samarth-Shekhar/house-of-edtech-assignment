import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatEnumLabel } from "@/lib/utils";
import { Shield, User, Mail, Clock } from "lucide-react";
import { Footer } from "@/components/shared/footer";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <section className="page-header">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ background: "rgba(212,165,40,0.1)", color: "var(--color-accent-mustard)" }}>
              <Shield size={12} />
              Account control
            </div>
            <h1 className="mt-4 text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl tracking-tight">
              Manage your workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)] leading-relaxed">
              Keep your profile details and security preferences clear and up to date.
            </p>
          </div>
        </div>
      </section>

      {/* Profile */}
      <div className="dashboard-card p-6">
        <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
          <User size={15} className="text-[var(--color-accent-mustard)]" />
          Profile
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "rgba(212,165,40,0.1)" }}>
              <span className="text-lg font-bold text-[var(--color-accent-mustard)]">
                {session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div>
              <div className="text-base font-bold text-[var(--color-text-primary)]">{session.user.name}</div>
              <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                <Mail size={13} /> {session.user.email}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-5">
            <div className="mb-1 flex items-center gap-2">
              <Shield size={14} className="text-[var(--color-accent-mustard)]" />
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">Role</span>
            </div>
            <span className="text-sm text-[var(--color-text-secondary)]">{formatEnumLabel(session.user.role)}</span>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="dashboard-card p-6">
        <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
          <Shield size={15} className="text-[var(--color-accent-sage)]" />
          Security
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-[var(--color-bg-primary)] p-4 border border-[var(--color-border-subtle)]">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Authentication</span>
            <span className="badge border-emerald-200 bg-emerald-50 text-[var(--color-accent-emerald)]">JWT + bcrypt</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-[var(--color-bg-primary)] p-4 border border-[var(--color-border-subtle)]">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Session Expiry</span>
            <span className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)]"><Clock size={13} /> 1 hour</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-[var(--color-bg-primary)] p-4 border border-[var(--color-border-subtle)]">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Rate Limiting</span>
            <span className="badge border-amber-200 bg-amber-50 text-[var(--color-accent-amber)]">Active</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-[var(--color-bg-primary)] p-4 border border-[var(--color-border-subtle)]">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Audit Logging</span>
            <span className="badge border-emerald-200 bg-emerald-50 text-[var(--color-accent-emerald)]">Enabled</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
