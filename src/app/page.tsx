import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Footer } from "@/components/shared/footer";

const tasks = [
  { title: "Bias scan complete", meta: "Senior Product Designer", done: true },
  { title: "Interview kit ready", meta: "Frontend Engineer", done: true },
  { title: "Resume batch scoring", meta: "Data Analyst", done: false },
  { title: "Manager feedback due", meta: "Product Manager", done: false },
];

const features = [
  {
    icon: Brain,
    title: "AI resume scoring",
    text: "Rank applicants against the job brief with transparent skill and fit signals.",
  },
  {
    icon: ShieldCheck,
    title: "Bias detection",
    text: "Flag risky language before it influences hiring decisions.",
  },
  {
    icon: MessageSquare,
    title: "Hiring assistant",
    text: "Ask complex questions and get clear answers from the workspace instantly.",
  },
  {
    icon: BarChart3,
    title: "Pipeline control",
    text: "Monitor every role, candidate, and interview step in one calm view.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <nav className="sticky top-5 z-50 px-4">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 rounded-full border border-[var(--color-border-subtle)] bg-white/96 px-4 shadow-[0_20px_60px_rgba(17,24,39,0.08)] backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-mustard)] text-[#1f1f1f] shadow-sm">
              <Brain size={17} />
            </span>
            <span className="text-base font-semibold text-[var(--color-text-primary)]">
              Vetted<span className="text-[var(--color-accent-mustard)]">.ai</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost no-underline">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary no-underline px-5 py-3">
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="page-container grid min-h-[calc(100vh-120px)] items-start gap-14 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
          <div className="max-w-xl">
            <div className="eyebrow-pill">
              <Sparkles size={13} className="text-[var(--color-accent-mustard)]" />
              AI hiring workspace
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-[1.02] text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl">
              Hire with more clarity, less noise.
            </h1>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-white/75 px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent-mustard)]" />
              One calm workspace for screening, notes, and interviews
            </div>

            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--color-text-secondary)]">
              Vetted.ai turns resume screening, scoring, and interview planning into one calm, thoughtful workspace for modern hiring teams.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn-primary no-underline">
                Start Hiring <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="btn-secondary no-underline">
                Open Dashboard
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Review time", value: "2.3x faster" },
                { label: "Signal clarity", value: "96% aligned" },
                { label: "Decision comfort", value: "Built in" },
              ].map((item) => (
                <div key={item.label} className="rounded-[20px] border border-[var(--color-border-subtle)] bg-white/85 px-4 py-4 shadow-sm backdrop-blur-sm">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{item.label}</div>
                  <div className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-shell overflow-hidden p-3 sm:p-4 self-start">
            <div className="rounded-[28px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    Hiring board
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">Weekly pipeline</h2>
                </div>
                <div className="rounded-full border border-[var(--color-border-subtle)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                  Live view
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-3">
                  <div className="soft-surface p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Open roles</p>
                        <div className="mt-1 text-3xl font-semibold">4 active</div>
                      </div>
                      <div className="rounded-full bg-[var(--color-bg-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                        +12% this week
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {[
                        { label: "Applied", value: "42", tone: "dark" },
                        { label: "Screen", value: "18", tone: "gold" },
                        { label: "Interview", value: "9", tone: "soft" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-[16px] border border-[var(--color-border-subtle)] bg-white/80 p-3">
                          <div className={`mb-2 h-2 rounded-full ${item.tone === 'dark' ? 'bg-[#1f1f1f]' : item.tone === 'gold' ? 'bg-[var(--color-accent-mustard)]' : 'bg-[var(--color-bg-tertiary)]'}`} />
                          <div className="text-xl font-semibold">{item.value}</div>
                          <div className="mt-1 text-[11px] font-medium text-[var(--color-text-muted)]">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dashboard-card p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Candidate progress</h3>
                      <span className="text-xs font-semibold text-[var(--color-text-muted)]">78%</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        { label: "Resume match", value: "82%" },
                        { label: "Interview readiness", value: "74%" },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--color-text-muted)]">
                            <span>{item.label}</span>
                            <span>{item.value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-[var(--color-bg-tertiary)]">
                            <div className="h-2 rounded-full bg-[var(--color-accent-mustard)]" style={{ width: item.value }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="dashboard-card p-4 bg-white">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Priority tasks</h3>
                    <span className="text-xl font-semibold text-[var(--color-text-secondary)]">2/4</span>
                  </div>
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.title} className="flex items-center gap-3 rounded-[20px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${task.done ? 'bg-[rgba(212,165,40,0.16)] text-[var(--color-accent-mustard)]' : 'bg-white/10 text-[var(--color-text-muted)]'}`}>
                          {task.done ? <CheckCircle2 size={15} /> : <Zap size={15} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-[var(--color-text-primary)]">{task.title}</span>
                          <span className="block truncate text-[10px] text-[var(--color-text-muted)]">{task.meta}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-[20px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Suggested next action</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-[var(--color-text-primary)]">Review 3 standout candidates</div>
                      <div className="rounded-full bg-[var(--color-accent-mustard)] px-2.5 py-1 text-[11px] font-semibold text-[#1f1f1f]">
                        12 min
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--color-border-subtle)] bg-white/55 py-16">
          <div className="page-container">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-mustard)]">
                  Everything in one place
                </p>
                <h2 className="mt-2 text-3xl font-semibold">
                  Designed to feel lightweight and clear.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-[var(--color-text-muted)]">
                The workflow stays consistent from resume intake to final interviews, with less friction and better visibility.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="dashboard-card p-5">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-bg-primary)] text-[var(--color-accent-mustard)]">
                    <feature.icon size={20} />
                  </div>
                  <h3 className="text-base font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-container py-16">
          <div className="hero-shell p-2 sm:p-3">
            <div className="flex flex-col items-start justify-between gap-6 rounded-[24px] bg-[var(--color-bg-surface)] p-6 text-[var(--color-text-primary)] md:flex-row md:items-center md:p-8">
              <div>
                <p className="text-sm font-semibold text-[var(--color-accent-mustard)]">
                  Ready when your team is
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">
                  Build a calmer hiring rhythm from day one.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
                  Give every stakeholder a shared view of candidates, priorities, and interview momentum without the usual tooling friction.
                </p>
              </div>
              <Link href="/register" className="btn-primary no-underline">
                Create Account <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
