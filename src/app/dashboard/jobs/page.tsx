import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Users,
  MapPin,
  Clock,
} from "lucide-react";
import { formatEnumLabel } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { hasPermission } from "@/lib/authorization";

export default async function JobsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const canCreate = hasPermission(
    session.user.role as "ADMIN" | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER",
    "create:job"
  );

  const jobs = await prisma.job.findMany({
    include: {
      creator: { select: { name: true } },
      _count: { select: { candidates: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const openCount = jobs.filter((job) => job.status === "OPEN").length;
  const draftCount = jobs.filter((job) => job.status === "DRAFT").length;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header — warm clean style */}
      <section className="page-header">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ background: "rgba(212,165,40,0.1)", color: "var(--color-accent-mustard)" }}>
              <Briefcase size={12} />
              Hiring roles
            </div>
            <h1 className="mt-4 text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl tracking-tight">
              Manage your active openings
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)] leading-relaxed">
              Track every role, keep hiring momentum visible, and launch new positions from one polished workspace.
            </p>
          </div>
          {canCreate && (
            <Link href="/dashboard/jobs/new" className="btn-primary no-underline">
              <Plus size={16} /> New Job
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-4">
            <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Total jobs</div>
            <div className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">{jobs.length}</div>
          </div>
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-4">
            <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Open roles</div>
            <div className="mt-2 text-2xl font-bold text-[var(--color-accent-sage)]">{openCount}</div>
          </div>
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-4">
            <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Drafts</div>
            <div className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">{draftCount}</div>
          </div>
        </div>
      </section>

      {jobs.length === 0 ? (
        <div className="dashboard-card p-16 text-center">
          <Briefcase className="mx-auto mb-4 text-[var(--color-text-muted)] opacity-40" size={48} />
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">No jobs yet</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Create your first job posting to start receiving candidates.
          </p>
          {canCreate && (
            <Link href="/dashboard/jobs/new" className="btn-primary no-underline">
              <Plus size={16} /> Create First Job
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/dashboard/jobs/${job.id}`}
              className="dashboard-card p-5 transition-all duration-300 group block no-underline"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(212,165,40,0.1)" }}>
                  <Briefcase size={18} style={{ color: "var(--color-accent-mustard)" }} />
                </div>
                <span className={`badge text-[11px] ${
                  job.status === "OPEN"
                    ? "bg-emerald-50 text-[var(--color-accent-emerald)] border-emerald-200"
                    : job.status === "DRAFT"
                      ? "bg-slate-100 text-slate-600 border-slate-200"
                      : job.status === "CLOSED"
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-amber-50 text-[var(--color-accent-amber)] border-amber-200"
                }`}>
                  {formatEnumLabel(job.status)}
                </span>
              </div>

              <h3 className="mb-1 text-base font-bold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent-mustard)]">
                {job.title}
              </h3>
              <p className="mb-4 text-xs font-medium text-[var(--color-text-muted)]">{job.department}</p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} /> {job._count.candidates}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {formatDistanceToNow(job.createdAt, { addSuffix: true })}
                </span>
              </div>

              {job.salaryMin && job.salaryMax && (
                <div className="mt-4 border-t border-[var(--color-border-subtle)] pt-3">
                  <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    ${job.salaryMin.toLocaleString()} — ${job.salaryMax.toLocaleString()}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
