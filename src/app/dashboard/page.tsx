import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Briefcase,
  Users,
  Brain,
  TrendingUp,
  ArrowUpRight,
  Clock,
  FileText,
  Sparkles,
  CalendarDays,
  MoveRight,
  CircleCheckBig,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Timer,
  Monitor,
  Link as LinkIcon,
  MessageSquare,
  Zap,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { formatEnumLabel, getStageColor } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type CandidateStageCount = {
  stage: string;
  _count: { stage: number };
};

type CandidateRecent = {
  id: string;
  name: string;
  stage: string;
  createdAt: Date;
  job: { title: string };
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [
    totalJobs,
    openJobs,
    totalCandidates,
    avgScore,
    stageCounts,
    recentJobs,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.candidate.count(),
    prisma.candidate.aggregate({ _avg: { overallScore: true } }),
    prisma.candidate.groupBy({
      by: ["stage"],
      _count: { stage: true },
    }),
    prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { candidates: true } },
      },
    }),
  ]);

  const recentCandidates = (await prisma.candidate.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      job: { select: { title: true } },
    },
  })) as CandidateRecent[];

  const stageCountMap: Record<string, number> = {};
  stageCounts.forEach((s: CandidateStageCount) => {
    stageCountMap[s.stage] = s._count.stage;
  });

  const firstName = session.user.name?.split(" ")[0] || "there";
  const avgScoreValue = avgScore._avg.overallScore
    ? Math.round(avgScore._avg.overallScore)
    : 0;

  /* Pipeline data for bar chart */
  const barChartData = [
    { label: "S", value: stageCountMap["APPLIED"] || 0, active: false },
    { label: "M", value: stageCountMap["SCREENING"] || 0, active: false },
    { label: "T", value: stageCountMap["INTERVIEW"] || 0, active: true },
    { label: "W", value: stageCountMap["OFFER"] || 0, active: true },
    { label: "T", value: stageCountMap["HIRED"] || 0, active: false },
    { label: "F", value: stageCountMap["REJECTED"] || 0, active: false },
    { label: "S", value: 0, active: false },
  ];
  const maxBarValue = Math.max(...barChartData.map((b) => b.value), 1);

  /* Pipeline stages for progress card */
  const pipelineStages = [
    { stage: "APPLIED", color: "#E4B33C" },
    { stage: "SCREENING", color: "#1E1E1E" },
    { stage: "INTERVIEW", color: "#6B7280" },
    { stage: "OFFER", color: "#E4B33C" },
    { stage: "HIRED", color: "#4F8A5F" },
    { stage: "REJECTED", color: "#DC2626" },
  ];

  const maxStageCount = Math.max(
    ...pipelineStages.map((s) => stageCountMap[s.stage] || 0),
    1
  );

  /* Pill stats */
  const hiredCount = stageCountMap["HIRED"] || 0;
  const interviewCount = stageCountMap["INTERVIEW"] || 0;
  const interviewPct =
    totalCandidates > 0
      ? Math.round((interviewCount / totalCandidates) * 100)
      : 0;
  const hiredPct =
    totalCandidates > 0
      ? Math.round((hiredCount / totalCandidates) * 100)
      : 0;
  const screeningPct =
    totalCandidates > 0
      ? Math.round(
          ((stageCountMap["SCREENING"] || 0) / totalCandidates) * 100
        )
      : 0;

  /* Weekday columns for calendar */
  const today = new Date();
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const currentDayIndex = (today.getDay() + 6) % 7; // Monday = 0
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - currentDayIndex);
  const weekDays = dayNames.map((name, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return { name, date: d.getDate(), isToday: i === currentDayIndex };
  });

  const monthLabel = today.toLocaleString("en", {
    month: "long",
    year: "numeric",
  });

  /* Total pipeline count */
  const totalInPipeline = Object.values(stageCountMap).reduce(
    (a, b) => a + b,
    0
  );
  const completedStages =
    (stageCountMap["HIRED"] || 0) + (stageCountMap["OFFER"] || 0);

  return (
    <div className="animate-fade-in space-y-6">
      {/* ═══════════════════════════════════════════════ */}
      {/* Welcome Section + Stats                        */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1
            className="text-4xl tracking-tight sm:text-5xl"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-text-primary)",
              fontWeight: 400,
            }}
          >
            Welcome in, {firstName}
          </h1>

          {/* Pill Tags */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="pill-tag pill-tag-dark">{interviewPct}%</span>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Interviews
            </span>

            <span className="pill-tag pill-tag-mustard">{hiredPct}%</span>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Hired
            </span>

            <div
              className="flex items-center gap-1"
              style={{
                background: "var(--color-bg-tertiary)",
                borderRadius: "50px",
                padding: "4px 6px",
                flex: "0 1 180px",
                minWidth: "120px",
              }}
            >
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${Math.max(screeningPct, 10)}%`,
                  background: "var(--color-accent-mustard)",
                  transition: "width 0.6s ease",
                }}
              />
              <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-tertiary)]" />
            </div>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Screening
            </span>

            <span className="pill-tag" style={{ background: "#F0EDDF", color: "#1F1F1F" }}>
              {avgScoreValue > 0 ? `${avgScoreValue}%` : "—"}
            </span>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Avg Score
            </span>
          </div>
        </div>

        {/* Big Stats */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="flex items-center gap-2">
              <Users
                size={18}
                className="text-[var(--color-text-muted)]"
              />
              <span className="stat-number">{totalCandidates}</span>
            </div>
            <div className="stat-label">Candidates</div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2">
              <Briefcase
                size={18}
                className="text-[var(--color-text-muted)]"
              />
              <span className="stat-number">{openJobs}</span>
            </div>
            <div className="stat-label">Hirings</div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2">
              <FileText
                size={18}
                className="text-[var(--color-text-muted)]"
              />
              <span className="stat-number">{totalJobs}</span>
            </div>
            <div className="stat-label">Projects</div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* Main 4-Column Grid                             */}
      {/* ═══════════════════════════════════════════════ */}
      <div
        className="dashboard-main-grid grid gap-5"
        style={{
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
        }}
      >
        {/* ─── Column 1: Profile Card ───────────────── */}
        <div className="row-span-2 flex flex-col gap-5" style={{ gridColumn: "1" }}>
          {/* Profile Card */}
          <div
            className="dashboard-card overflow-hidden"
            style={{ flex: "1 1 auto" }}
          >
            {/* Profile Header with gradient bg */}
            <div
              className="relative overflow-hidden rounded-t-[20px] p-5 pb-4"
              style={{
                background:
                  "linear-gradient(135deg, #E4B33C 0%, #D4A02E 50%, #C69225 100%)",
                minHeight: "180px",
              }}
            >
              <div className="absolute inset-0 opacity-20">
                <div
                  className="absolute -right-8 -top-8 h-48 w-48 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)",
                  }}
                />
              </div>
              <div className="relative mt-16">
                <h3 className="text-xl font-semibold text-[#1F1F1F]">
                  {recentCandidates[0]?.name || firstName}
                </h3>
                <p className="text-sm text-[#1F1F1F]/70">
                  {recentCandidates[0]?.job?.title || "Team Lead"}
                </p>
              </div>
              {avgScoreValue > 0 && (
                <div
                  className="absolute bottom-4 right-4 rounded-full px-4 py-1.5 text-sm font-bold"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    color: "#1F1F1F",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  ${avgScoreValue > 50 ? "1,200" : "800"}
                </div>
              )}
            </div>

            {/* Accordion Info Sections */}
            <div className="px-5 py-3">
              <div className="accordion-row">
                <span className="accordion-row-label">Skills Summary</span>
                <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
              </div>
              <div className="accordion-row">
                <span className="accordion-row-label">Devices</span>
                <div className="accordion-row-value">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{
                        background: "var(--color-bg-tertiary)",
                      }}
                    >
                      <Monitor size={13} className="text-[var(--color-text-muted)]" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[var(--color-text-primary)]">
                        Platform
                      </div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">
                        Web App
                      </div>
                    </div>
                  </div>
                  <ChevronUp size={16} className="text-[var(--color-text-muted)]" />
                </div>
              </div>
              <div className="accordion-row">
                <span className="accordion-row-label">Score Breakdown</span>
                <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
              </div>
              <div className="accordion-row">
                <span className="accordion-row-label">Experience Details</span>
                <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Column 2: Progress Card ──────────────── */}
        <div className="dashboard-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Progress
            </h3>
            <Link
              href="/dashboard/candidates"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-tertiary)]"
            >
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-[var(--color-text-primary)]">
              {totalInPipeline > 0 ? (totalInPipeline / 10).toFixed(1) : "0.0"}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              Active pipeline
              <br />
              this week
            </span>
          </div>

          {/* Mini label */}
          <div
            className="mb-4 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{
              background: "var(--color-accent-mustard)",
              color: "#1F1F1F",
            }}
          >
            {totalInPipeline}h total
          </div>

          {/* Bar Chart */}
          <div className="bar-chart">
            {barChartData.map((bar, i) => {
              const height =
                maxBarValue > 0
                  ? Math.max((bar.value / maxBarValue) * 100, 10)
                  : 10;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="bar-chart-bar w-full"
                    style={{
                      height: `${height}%`,
                      background: bar.active
                        ? "var(--color-accent-mustard)"
                        : "var(--color-bg-tertiary)",
                      borderRadius: "5px",
                    }}
                  />
                  {/* Dot indicator */}
                  <div
                    className="mt-2 h-1.5 w-1.5 rounded-full"
                    style={{
                      background: bar.active
                        ? "var(--color-accent-mustard)"
                        : "var(--color-border-subtle)",
                    }}
                  />
                  <div className="bar-chart-label">{bar.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Column 3: Time Tracker Card ──────────── */}
        <div className="dashboard-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Time tracker
            </h3>
            <Link
              href="/dashboard/ai"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-tertiary)]"
            >
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* Circular Progress */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative">
              <svg width="140" height="140" viewBox="0 0 140 140">
                {/* Background circle (dashed) */}
                <circle
                  cx="70"
                  cy="70"
                  r="58"
                  fill="none"
                  stroke="var(--color-border-subtle)"
                  strokeWidth="6"
                  strokeDasharray="4 6"
                />
                {/* Progress arc */}
                <circle
                  cx="70"
                  cy="70"
                  r="58"
                  fill="none"
                  stroke="var(--color-accent-mustard)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(avgScoreValue / 100) * 364} 364`}
                  className="score-ring-circle"
                  style={{
                    transformOrigin: "center",
                    transform: "rotate(-90deg)",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[var(--color-text-primary)]">
                  {avgScoreValue > 0
                    ? `${Math.floor(avgScoreValue / 10)}:${(avgScoreValue % 10) * 6 < 10 ? "0" : ""}${(avgScoreValue % 10) * 6}`
                    : "0:00"}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                  AI Score
                </span>
              </div>
            </div>

            {/* Play/Pause Buttons */}
            <div className="mt-4 flex items-center gap-3">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                style={{
                  background: "var(--color-bg-tertiary)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <Play size={16} fill="currentColor" />
              </button>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                style={{
                  background: "var(--color-bg-tertiary)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <Pause size={16} />
              </button>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                style={{
                  background: "var(--color-bg-tertiary)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <Timer size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Column 4: Onboarding + Task List ─────── */}
        <div className="row-span-2 flex flex-col gap-5" style={{ gridColumn: "4" }}>
          {/* Onboarding Progress Card */}
          <div className="dashboard-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                Onboarding
              </h3>
              <span
                className="text-2xl font-bold"
                style={{ color: "var(--color-accent-mustard)" }}
              >
                {totalCandidates > 0
                  ? Math.round(
                      ((stageCountMap["HIRED"] || 0) / totalCandidates) * 100
                    )
                  : 0}
                %
              </span>
            </div>

            {/* Progress segments */}
            <div className="mb-4">
              <div className="flex items-center gap-1 text-[10px] font-medium text-[var(--color-text-muted)] mb-2">
                <span>30%</span>
                <span className="flex-1" />
                <span>25%</span>
                <span className="flex-1" />
                <span>0%</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: "45%",
                    background: "var(--color-accent-mustard)",
                  }}
                />
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: "30%",
                    background: "#1E1E1E",
                  }}
                />
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: "25%",
                    background: "var(--color-bg-tertiary)",
                  }}
                />
              </div>
              <div className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: "var(--color-accent-mustard)", color: "#1F1F1F" }}
              >
                Pipeline
              </div>
            </div>
          </div>

          {/* Onboarding Task Card (Dark) */}
          <div className="dashboard-card-dark p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Pipeline Tasks</h3>
              <span className="text-xl font-bold" style={{ color: "var(--color-accent-mustard)" }}>
                {completedStages}/{totalInPipeline || 0}
              </span>
            </div>

            <div className="space-y-0">
              {recentCandidates.slice(0, 5).map((candidate, idx) => {
                const isCompleted =
                  candidate.stage === "HIRED" || candidate.stage === "OFFER";
                const isPending = candidate.stage === "INTERVIEW";

                return (
                  <Link
                    key={candidate.id}
                    href={`/dashboard/candidates/${candidate.id}`}
                    className="task-item no-underline"
                  >
                    <div
                      className={`task-icon ${isCompleted ? "task-icon-done" : isPending ? "task-icon-pending" : "task-icon-upcoming"}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={14} />
                      ) : isPending ? (
                        <Zap size={14} />
                      ) : idx % 2 === 0 ? (
                        <MessageSquare size={14} />
                      ) : (
                        <LinkIcon size={14} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {candidate.name}
                      </div>
                      <div className="text-[11px] text-white/40 mt-0.5">
                        {formatDistanceToNow(candidate.createdAt, {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{
                        background: isCompleted
                          ? "#4F8A5F"
                          : isPending
                            ? "#E4B33C"
                            : "rgba(255,255,255,0.15)",
                      }}
                    />
                  </Link>
                );
              })}

              {recentCandidates.length === 0 && (
                <div className="py-6 text-center text-white/40 text-sm">
                  No candidates yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Calendar Section (spans 2 columns) ───── */}
        <div
          className="dashboard-card p-5"
          style={{ gridColumn: "2 / 4", gridRow: "2" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                ← Prev
              </button>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                {monthLabel}
              </h3>
              <button className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                Next →
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div
            className="grid gap-0 mb-2"
            style={{ gridTemplateColumns: "52px repeat(5, 1fr)" }}
          >
            <div />
            {weekDays.slice(0, 5).map((day, i) => (
              <div key={i} className="text-center px-1">
                <div className="text-[11px] font-medium text-[var(--color-text-muted)]">
                  {day.name}
                </div>
                <div
                  className={`mt-0.5 text-sm font-semibold ${
                    day.isToday
                      ? "text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {day.date}
                </div>
              </div>
            ))}
          </div>

          {/* Time Rows */}
          <div className="relative">
            {["8:00 am", "9:00 am", "10:00 am", "11:00 am"].map(
              (time, rowIdx) => (
                <div
                  key={time}
                  className="grid gap-0"
                  style={{
                    gridTemplateColumns: "52px repeat(5, 1fr)",
                    height: "52px",
                  }}
                >
                  <div className="text-[11px] font-medium text-[var(--color-text-muted)] text-right pr-3 pt-0.5">
                    {time}
                  </div>
                  {weekDays.slice(0, 5).map((_, colIdx) => (
                    <div
                      key={colIdx}
                      className="relative"
                      style={{
                        borderLeft: "1px dashed var(--color-border-subtle)",
                        borderBottom:
                          rowIdx < 3
                            ? "1px dashed var(--color-border-subtle)"
                            : "none",
                      }}
                    >
                      {/* Event overlay on specific cells */}
                      {rowIdx === 0 && colIdx === 0 && recentJobs[0] && (
                        <div
                          className="absolute inset-x-1 top-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold z-10"
                          style={{
                            background: "var(--color-accent-mustard)",
                            color: "#1F1F1F",
                            height: "calc(200% - 4px)",
                          }}
                        >
                          <div className="truncate">
                            {recentJobs[0].title}
                          </div>
                          <div className="text-[9px] opacity-70 mt-0.5 truncate">
                            Review candidates
                          </div>
                          <div className="flex -space-x-1 mt-1">
                            <div className="h-4 w-4 rounded-full bg-[#1E1E1E] border border-[var(--color-accent-mustard)]" />
                            <div className="h-4 w-4 rounded-full bg-white/60 border border-[var(--color-accent-mustard)]" />
                          </div>
                        </div>
                      )}
                      {rowIdx === 2 && colIdx === 2 && recentJobs[1] && (
                        <div
                          className="absolute inset-x-1 top-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold z-10"
                          style={{
                            background: "#F0EDDF",
                            color: "#1F1F1F",
                            height: "calc(100% - 4px)",
                          }}
                        >
                          <div className="truncate">
                            {recentJobs[1].title}
                          </div>
                          <div className="text-[9px] opacity-60 truncate">
                            Interview prep
                          </div>
                          <div className="flex -space-x-1 mt-0.5">
                            <div className="h-4 w-4 rounded-full bg-[var(--color-accent-mustard)] border border-[#F0EDDF]" />
                            <div className="h-4 w-4 rounded-full bg-[#1E1E1E] border border-[#F0EDDF]" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* Recent Jobs Table                              */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="dashboard-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
              Active openings
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
              Recent jobs
            </h2>
          </div>
          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-1 text-sm font-medium no-underline"
            style={{ color: "var(--color-accent-mustard)" }}
          >
            View all <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] py-12 text-center text-[var(--color-text-muted)]">
            <Briefcase className="mx-auto mb-3 opacity-40" size={32} />
            <p className="text-sm">No jobs posted yet.</p>
            <Link
              href="/dashboard/jobs/new"
              className="btn-primary mt-4 inline-flex no-underline text-sm"
            >
              Create Your First Job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)]">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] pb-3">
                    Job Title
                  </th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] pb-3">
                    Department
                  </th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] pb-3">
                    Location
                  </th>
                  <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] pb-3">
                    Candidates
                  </th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] pb-3">
                    Status
                  </th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] pb-3">
                    Posted
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-[var(--color-border-subtle)] last:border-0 group"
                  >
                    <td className="py-3.5 pr-4">
                      <Link
                        href={`/dashboard/jobs/${job.id}`}
                        className="no-underline"
                      >
                        <span className="text-sm font-medium text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent-mustard)]">
                          {job.title}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-[var(--color-text-muted)]">
                      {job.department}
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-[var(--color-text-muted)]">
                      {job.location}
                    </td>
                    <td className="py-3.5 text-center text-xs font-semibold text-[var(--color-text-primary)]">
                      {job._count.candidates}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`badge text-[11px] ${
                          job.status === "OPEN"
                            ? "bg-emerald-50 text-[var(--color-accent-emerald)] border-emerald-100"
                            : job.status === "DRAFT"
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : "bg-amber-50 text-[var(--color-accent-amber)] border-amber-100"
                        }`}
                      >
                        {formatEnumLabel(job.status)}
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-xs text-[var(--color-text-muted)]">
                      <div className="flex items-center justify-end gap-1">
                        <Clock size={11} />{" "}
                        {formatDistanceToNow(job.createdAt, {
                          addSuffix: true,
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
