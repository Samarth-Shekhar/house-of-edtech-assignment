"use client";

import { useState } from "react";
import {
  Plus, Users, Brain, MapPin, Clock, DollarSign,
  ArrowLeft, Loader2, ChevronDown, Send, Sparkles, X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatEnumLabel, getStageColor, getScoreColor } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ScoreRing } from "@/components/candidates/score-ring";

interface JobRequirements {
  skills: string[];
  experience: string;
  education: string;
  certifications: string[];
}

interface AIAnalysis {
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  strengths: string[];
  gaps: string[];
  summary: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: string;
  overallScore: number | null;
  resumeText: string;
  createdAt: string;
  aiAnalysis: AIAnalysis | null;
  evaluations: { reviewer: { name: string }; rating: string }[];
  _count: { interviewQuestions: number };
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  requirements: JobRequirements;
  status: string;
  createdAt: string;
  creator: { name: string };
  candidates: Candidate[];
}

const STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];

export function JobDetailClient({ job: initialJob }: { job: Job }) {
  const [job, setJob] = useState(initialJob);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  async function addCandidate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddingCandidate(true);

    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone") || null,
          linkedIn: form.get("linkedIn") || null,
          resumeText: form.get("resumeText"),
          jobId: job.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast.success("Candidate added!");
      setShowAddCandidate(false);
      // Refresh job data
      const jobRes = await fetch(`/api/jobs/${job.id}`);
      const updatedJob = await jobRes.json();
      setJob(updatedJob);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add candidate";
      toast.error(message);
    } finally {
      setAddingCandidate(false);
    }
  }

  async function analyzeCandidate(candidate: Candidate) {
    setAnalyzingId(candidate.id);
    try {
      const res = await fetch("/api/ai/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate.id,
          resumeText: candidate.resumeText,
          jobTitle: job.title,
          jobDescription: job.description,
          jobRequirements: job.requirements,
        }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      toast.success("AI analysis complete!");
      const jobRes = await fetch(`/api/jobs/${job.id}`);
      const updatedJob = await jobRes.json();
      setJob(updatedJob);
    } catch {
      toast.error("AI analysis failed. Check your API key.");
    } finally {
      setAnalyzingId(null);
    }
  }

  async function moveCandidate(candidateId: string, newStage: string) {
    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) throw new Error("Failed to update stage");

      toast.success(`Moved to ${formatEnumLabel(newStage)}`);
      const jobRes = await fetch(`/api/jobs/${job.id}`);
      const updatedJob = await jobRes.json();
      setJob(updatedJob);
    } catch {
      toast.error("Failed to update stage");
    }
  }

  async function updateJobStatus(status: string) {
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update");
      setJob({ ...job, status });
      toast.success(`Job status updated to ${formatEnumLabel(status)}`);
    } catch {
      toast.error("Failed to update job status");
    }
  }

  const requirements = (typeof job.requirements === "string"
    ? JSON.parse(job.requirements)
    : job.requirements) as JobRequirements;

  return (
    <div className="animate-fade-in">
      <Link
        href="/dashboard/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors no-underline mb-6"
      >
        <ArrowLeft size={14} /> Back to Jobs
      </Link>

      {/* Job Header */}
      <div className="dashboard-card p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">{job.title}</h1>
              <span className={`badge text-[11px] ${
                job.status === "OPEN"
                  ? "bg-emerald-50 text-[var(--color-accent-emerald)] border-emerald-250"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                {formatEnumLabel(job.status)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
              <span>{job.department}</span>
              <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
              {job.salaryMin && job.salaryMax && (
                <span className="flex items-center gap-1">
                  <DollarSign size={13} /> ${job.salaryMin.toLocaleString()} — ${job.salaryMax.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={job.status}
              onChange={(e) => updateJobStatus(e.target.value)}
              className="input-field w-auto text-sm py-2 px-3 font-semibold"
            >
              {["DRAFT", "OPEN", "PAUSED", "CLOSED"].map((s) => (
                <option key={s} value={s}>{formatEnumLabel(s)}</option>
              ))}
            </select>
            <button onClick={() => setShowAddCandidate(true)} className="btn-primary">
              <Plus size={16} /> Add Candidate
            </button>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-5 pt-4 border-t border-[var(--color-border-subtle)]">
          <div className="flex flex-wrap gap-1.5">
            {requirements.skills.map((skill) => (
              <span key={skill} className="badge"
                style={{ background: "rgba(212,165,40,0.08)", color: "var(--color-accent-mustard)", borderColor: "rgba(212,165,40,0.15)" }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Kanban */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Users size={16} className="text-[var(--color-accent-mustard)]" />
          Candidate Pipeline ({job.candidates.length})
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAGES.map((stage) => {
            const candidates = job.candidates.filter((c) => c.stage === stage);
            return (
              <div key={stage} className="glass-card-sm p-3 bg-white border border-[var(--color-border-subtle)] rounded-xl flex flex-col">
                <div className="flex items-center justify-between mb-3 border-b border-[var(--color-border-subtle)] pb-2">
                  <span className={`badge text-[10px] font-bold ${getStageColor(stage)}`}>
                    {formatEnumLabel(stage)}
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--color-text-muted)]">
                    {candidates.length}
                  </span>
                </div>

                <div className="space-y-2 min-h-[140px] flex-1">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidate(candidate)}
                      className="p-2.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-cream-card)] hover:border-[var(--color-accent-mustard)] cursor-pointer transition-all group"
                    >
                      <div className="text-xs font-bold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent-mustard)] transition-colors">
                        {candidate.name}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-dashed border-[var(--color-border-subtle)]">
                        {candidate.overallScore != null ? (
                          <span className={`text-[11px] font-mono font-bold ${getScoreColor(candidate.overallScore)}`}>
                            Score: {Math.round(candidate.overallScore)}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              analyzeCandidate(candidate);
                            }}
                            disabled={analyzingId === candidate.id}
                            className="text-[10px] text-[var(--color-accent-mustard)] hover:underline flex items-center gap-0.5 font-bold"
                          >
                            {analyzingId === candidate.id ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <Brain size={10} />
                            )}
                            Analyze
                          </button>
                        )}
                        {/* Stage selector */}
                        <select
                          value={candidate.stage}
                          onChange={(e) => {
                            e.stopPropagation();
                            moveCandidate(candidate.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] bg-transparent border-none text-[var(--color-text-muted)] font-semibold cursor-pointer outline-none p-0"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{formatEnumLabel(s)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  {candidates.length === 0 && (
                    <div className="h-full flex items-center justify-center text-[10px] font-medium text-[var(--color-text-muted)] py-8">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Candidate Detail Panel */}
      {selectedCandidate && (
        <div className="dashboard-card p-6 mb-6 animate-slide-in">
          <div className="flex items-start justify-between mb-5 border-b border-[var(--color-border-subtle)] pb-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{selectedCandidate.name}</h3>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">{selectedCandidate.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {selectedCandidate.overallScore != null && (
                <ScoreRing score={selectedCandidate.overallScore} size={64} strokeWidth={5} />
              )}
              <button
                onClick={() => setSelectedCandidate(null)}
                className="btn-secondary p-2 rounded-full h-8 w-8 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {selectedCandidate.aiAnalysis ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-[var(--color-text-secondary)] leading-relaxed">
                {selectedCandidate.aiAnalysis.summary}
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card-sm p-3 text-center">
                  <div className="text-lg font-mono font-bold text-[var(--color-accent-mustard)]">
                    {Math.round(selectedCandidate.aiAnalysis.skillScore)}
                  </div>
                  <div className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Skills</div>
                </div>
                <div className="glass-card-sm p-3 text-center">
                  <div className="text-lg font-mono font-bold text-[var(--color-accent-violet)]">
                    {Math.round(selectedCandidate.aiAnalysis.experienceScore)}
                  </div>
                  <div className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Experience</div>
                </div>
                <div className="glass-card-sm p-3 text-center">
                  <div className="text-lg font-mono font-bold text-[var(--color-accent-amber)]">
                    {Math.round(selectedCandidate.aiAnalysis.educationScore)}
                  </div>
                  <div className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Education</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-accent-emerald)] mb-2 uppercase tracking-wide">✓ Strengths</h4>
                  <ul className="space-y-1">
                    {selectedCandidate.aiAnalysis.strengths.map((s, i) => (
                      <li key={i} className="text-xs font-medium text-[var(--color-text-secondary)]">• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-accent-amber)] mb-2 uppercase tracking-wide">⚠ Gaps</h4>
                  <ul className="space-y-1">
                    {selectedCandidate.aiAnalysis.gaps.map((g, i) => (
                      <li key={i} className="text-xs font-medium text-[var(--color-text-secondary)]">• {g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href={`/dashboard/candidates/${selectedCandidate.id}`}
                className="btn-primary text-xs no-underline inline-flex"
              >
                View Full Profile →
              </Link>
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-[var(--color-border-subtle)] rounded-xl bg-[var(--color-bg-primary)]">
              <Brain className="mx-auto mb-3 text-[var(--color-text-muted)] opacity-50" size={28} />
              <p className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
                No AI analysis yet
              </p>
              <button
                onClick={() => analyzeCandidate(selectedCandidate)}
                disabled={analyzingId === selectedCandidate.id}
                className="btn-primary text-sm"
              >
                {analyzingId === selectedCandidate.id ? (
                  <><Loader2 className="animate-spin" size={14} /> Analyzing...</>
                ) : (
                  <><Sparkles size={14} /> Run AI Analysis</>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Candidate Modal */}
      {showAddCandidate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="dashboard-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in bg-white">
            <div className="flex items-center justify-between mb-5 border-b border-[var(--color-border-subtle)] pb-3">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Add Candidate</h2>
              <button onClick={() => setShowAddCandidate(false)} className="btn-secondary h-8 w-8 rounded-full p-0 flex items-center justify-center">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={addCandidate} className="space-y-4">
              <div>
                <label htmlFor="cand-name" className="input-label">Full Name *</label>
                <input id="cand-name" name="name" required className="input-field" placeholder="Jane Smith" />
              </div>
              <div>
                <label htmlFor="cand-email" className="input-label">Email *</label>
                <input id="cand-email" name="email" type="email" required className="input-field" placeholder="jane@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cand-phone" className="input-label">Phone</label>
                  <input id="cand-phone" name="phone" className="input-field" placeholder="+1 (555) 123-4567" />
                </div>
                <div>
                  <label htmlFor="cand-linkedin" className="input-label">LinkedIn</label>
                  <input id="cand-linkedin" name="linkedIn" type="url" className="input-field" placeholder="https://linkedin.com/in/..." />
                </div>
              </div>
              <div>
                <label htmlFor="cand-resume" className="input-label">Resume Text *</label>
                <textarea
                  id="cand-resume"
                  name="resumeText"
                  required
                  rows={8}
                  className="input-field resize-y font-mono text-xs"
                  placeholder="Paste the candidate's resume text here..."
                  minLength={50}
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border-subtle)]">
                <button type="button" onClick={() => setShowAddCandidate(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={addingCandidate} className="btn-primary">
                  {addingCandidate ? (
                    <><Loader2 className="animate-spin" size={14} /> Adding...</>
                  ) : (
                    <><Send size={14} /> Add Candidate</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
