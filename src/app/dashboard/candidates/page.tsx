import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Briefcase } from "lucide-react";
import { formatEnumLabel, getStageColor } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type CandidateRow = {
  id: string;
  name: string;
  email: string;
  stage: string;
  overallScore: number | null;
  createdAt: Date;
  job: { id: string; title: string; department: string };
  aiAnalysis?: { overallScore: number | null };
  _count: { evaluations: number };
};

export default async function CandidatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const candidates = await prisma.candidate.findMany({
    include: {
      job: { select: { id: true, title: true, department: true } },
      aiAnalysis: {
        select: { overallScore: true, skillScore: true, summary: true },
      },
      _count: { select: { evaluations: true } },
    },
    orderBy: { createdAt: "desc" },
  }) as CandidateRow[];

  const reviewedCount = candidates.filter((c) => c._count.evaluations > 0).length;
  const avgScore = candidates.length
    ? Math.round(
        candidates.reduce<number>(
          (sum, c: { aiAnalysis?: { overallScore: number | null } }) =>
            sum + (c.aiAnalysis?.overallScore ?? 0),
          0
        ) / candidates.length
      )
    : 0;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <section className="page-header">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ background: "rgba(212,165,40,0.1)", color: "var(--color-accent-mustard)" }}>
              <Users size={12} />
              Candidate pipeline
            </div>
            <h1 className="mt-4 text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl tracking-tight">
              Track every applicant
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)] leading-relaxed">
              Review submissions, keep interview stages moving, and spot standout candidates faster.
            </p>
          </div>
          <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] no-underline hover:bg-[var(--color-bg-tertiary)] transition-colors">
            <Briefcase size={14} />
            Explore jobs
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-4">
            <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Applicants</div>
            <div className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">{candidates.length}</div>
          </div>
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-4">
            <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Reviewed</div>
            <div className="mt-2 text-2xl font-bold text-[var(--color-accent-sage)]">{reviewedCount}</div>
          </div>
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-4">
            <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Avg. score</div>
            <div className="mt-2 text-2xl font-bold text-[var(--color-accent-mustard)]">{avgScore}%</div>
          </div>
        </div>
      </section>

      {candidates.length === 0 ? (
        <div className="dashboard-card p-16 text-center">
          <Users className="mx-auto mb-4 text-[var(--color-text-muted)] opacity-40" size={48} />
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">No candidates yet</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Candidates will appear here once added to a job posting.
          </p>
          <Link href="/dashboard/jobs" className="btn-primary no-underline">
            <Briefcase size={16} /> Go to Jobs
          </Link>
        </div>
      ) : (
        <div className="dashboard-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Candidate</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Job</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Stage</th>
                  <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Score</th>
                  <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Reviews</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Applied</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b border-[var(--color-border-subtle)] last:border-0 transition-colors group hover:bg-[var(--color-bg-primary)]">
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/candidates/${candidate.id}`} className="flex min-w-0 items-center gap-3 no-underline">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                          style={{ background: "rgba(212,165,40,0.1)", color: "var(--color-accent-mustard)" }}>
                          {candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent-mustard)]">
                            {candidate.name}
                          </div>
                          <div className="truncate text-xs text-[var(--color-text-muted)]">{candidate.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{candidate.job.title}</td>
                    <td className="px-5 py-4">
                      <span className={`badge text-[11px] ${getStageColor(candidate.stage)}`}>
                        {formatEnumLabel(candidate.stage)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {candidate.overallScore != null ? (
                        <span className={`badge text-[11px] ${
                          candidate.overallScore >= 80
                            ? "bg-emerald-50 text-[var(--color-accent-emerald)] border-emerald-200"
                            : candidate.overallScore >= 50
                              ? "bg-amber-50 text-[var(--color-accent-amber)] border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {Math.round(candidate.overallScore)}%
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center text-sm font-medium text-[var(--color-text-secondary)]">{candidate._count.evaluations}</td>
                    <td className="px-5 py-4 text-right text-xs text-[var(--color-text-muted)]">
                      {formatDistanceToNow(candidate.createdAt, { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
