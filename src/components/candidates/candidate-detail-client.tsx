"use client";

import { useState } from "react";
import {
  ArrowLeft, Brain, Sparkles, Loader2, MessageSquare,
  Star, Send, X, Plus,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatEnumLabel, getStageColor, getScoreColor } from "@/lib/utils";
import { ScoreRing } from "@/components/candidates/score-ring";

interface JobRequirements {
  skills: string[];
  experience: string;
  education: string;
  certifications: string[];
}

interface Job {
  id: string;
  title: string;
  department: string;
  requirements: JobRequirements;
  description: string;
}

interface AIAnalysis {
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  strengths: string[];
  gaps: string[];
  summary: string;
  skillMatch?: { matched?: string[]; missing?: string[]; extra?: string[] };
}

interface Evaluation {
  id: string;
  rating: string;
  technicalScore: number;
  communicationScore: number;
  cultureFitScore: number;
  experienceScore: number;
  notes: string | null;
  reviewer: { id: string; name: string; role: string };
}

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  targetSkill: string | null;
  difficulty: string;
}

interface CandidateData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  linkedIn: string | null;
  stage: string;
  overallScore: number | null;
  resumeText: string;
  job: Job;
  aiAnalysis: AIAnalysis | null;
  evaluations: Evaluation[];
  interviewQuestions: InterviewQuestion[];
}

const ratingLabels: Record<string, { label: string; color: string }> = {
  STRONG_YES: { label: "Strong Yes", color: "text-[var(--color-accent-emerald)] font-bold bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-lg text-xs" },
  YES: { label: "Yes", color: "text-[var(--color-accent-emerald)] font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-xs" },
  MAYBE: { label: "Maybe", color: "text-[var(--color-accent-amber)] font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs" },
  NO: { label: "No", color: "text-[var(--color-accent-rose)] font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg text-xs" },
  STRONG_NO: { label: "Strong No", color: "text-[var(--color-accent-rose)] font-bold bg-red-50 border border-red-250 px-2 py-0.5 rounded-lg text-xs" },
};

export function CandidateDetailClient({ candidate: initial }: { candidate: CandidateData }) {
  const [candidate, setCandidate] = useState(initial);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [submittingEval, setSubmittingEval] = useState(false);

  async function runAnalysis() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate.id,
          resumeText: candidate.resumeText,
          jobTitle: candidate.job.title,
          jobDescription: candidate.job.description,
          jobRequirements: candidate.job.requirements,
        }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      toast.success("AI analysis complete!");
      const candidateRes = await fetch(`/api/candidates/${candidate.id}`);
      setCandidate(await candidateRes.json());
    } catch {
      toast.error("AI analysis failed. Check your Gemini API key.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function generateQuestions() {
    setGeneratingQuestions(true);
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate.id,
          resumeText: candidate.resumeText,
          jobTitle: candidate.job.title,
          jobRequirements: candidate.job.requirements,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Interview questions generated!");
      const candidateRes = await fetch(`/api/candidates/${candidate.id}`);
      setCandidate(await candidateRes.json());
    } catch {
      toast.error("Failed to generate questions.");
    } finally {
      setGeneratingQuestions(false);
    }
  }

  async function submitEvaluation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmittingEval(true);
    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate.id,
          rating: form.get("rating"),
          technicalScore: Number(form.get("technicalScore")),
          communicationScore: Number(form.get("communicationScore")),
          cultureFitScore: Number(form.get("cultureFitScore")),
          experienceScore: Number(form.get("experienceScore")),
          notes: form.get("notes") || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Evaluation submitted!");
      setShowEvalForm(false);
      const candidateRes = await fetch(`/api/candidates/${candidate.id}`);
      setCandidate(await candidateRes.json());
    } catch {
      toast.error("Failed to submit evaluation.");
    } finally {
      setSubmittingEval(false);
    }
  }

  const difficultyColor: Record<string, string> = {
    EASY: "text-[var(--color-accent-emerald)] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold",
    MEDIUM: "text-[var(--color-accent-amber)] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-bold",
    HARD: "text-[var(--color-accent-rose)] bg-red-50 border border-red-200 px-2 py-0.5 rounded-md text-[10px] font-bold",
  };

  const categoryColor: Record<string, string> = {
    TECHNICAL: "bg-[rgba(212,165,40,0.08)] text-[var(--color-accent-mustard)] border border-[rgba(212,165,40,0.2)] text-[10px] font-bold px-2 py-0.5 rounded-md",
    BEHAVIORAL: "bg-[rgba(124,58,237,0.08)] text-[var(--color-accent-violet)] border border-[rgba(124,58,237,0.2)] text-[10px] font-bold px-2 py-0.5 rounded-md",
    SITUATIONAL: "bg-[rgba(224,144,0,0.08)] text-[var(--color-accent-amber)] border border-[rgba(224,144,0,0.2)] text-[10px] font-bold px-2 py-0.5 rounded-md",
  };

  return (
    <div className="animate-fade-in max-w-5xl">
      <Link
        href="/dashboard/candidates"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors no-underline mb-6"
      >
        <ArrowLeft size={14} /> Back to Candidates
      </Link>

      {/* Header */}
      <div className="dashboard-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1 tracking-tight">{candidate.name}</h1>
            <p className="text-sm font-medium text-[var(--color-text-muted)] mb-3">{candidate.email}</p>
            <div className="flex items-center gap-3">
              <span className={`badge text-[11px] ${getStageColor(candidate.stage)}`}>
                {formatEnumLabel(candidate.stage)}
              </span>
              <Link
                href={`/dashboard/jobs/${candidate.job.id}`}
                className="text-xs font-semibold no-underline"
                style={{ color: "var(--color-accent-mustard)" }}
              >
                {candidate.job.title} →
              </Link>
            </div>
          </div>
          {candidate.overallScore != null && (
            <ScoreRing score={candidate.overallScore} size={80} strokeWidth={6} label="AI Score" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Analysis */}
          <div className="dashboard-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Brain size={16} className="text-[var(--color-accent-mustard)]" />
                AI Analysis
              </h2>
              <button
                onClick={runAnalysis}
                disabled={analyzing}
                className="btn-secondary text-xs font-semibold py-1.5 px-3"
              >
                {analyzing ? (
                  <><Loader2 size={12} className="animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles size={12} /> {candidate.aiAnalysis ? "Re-analyze" : "Run Analysis"}</>
                )}
              </button>
            </div>

            {candidate.aiAnalysis ? (
              <div className="space-y-5">
                <p className="text-sm font-medium text-[var(--color-text-secondary)] leading-relaxed">
                  {candidate.aiAnalysis.summary}
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Skills", score: candidate.aiAnalysis.skillScore, color: "text-[var(--color-accent-mustard)]" },
                    { label: "Experience", score: candidate.aiAnalysis.experienceScore, color: "text-[var(--color-accent-violet)]" },
                    { label: "Education", score: candidate.aiAnalysis.educationScore, color: "text-[var(--color-accent-amber)]" },
                  ].map((item) => (
                    <div key={item.label} className="glass-card-sm p-4 text-center">
                      <div className={`text-2xl font-mono font-bold ${item.color}`}>
                        {Math.round(item.score)}
                      </div>
                      <div className="text-[11px] font-semibold text-[var(--color-text-muted)] mt-1 uppercase tracking-wider">{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Skill Match */}
                {candidate.aiAnalysis.skillMatch && (
                  <div className="space-y-3">
                    {candidate.aiAnalysis.skillMatch.matched && candidate.aiAnalysis.skillMatch.matched.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-[var(--color-accent-emerald)] mb-1.5 block uppercase tracking-wide">Matched Skills</span>
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.aiAnalysis.skillMatch.matched.map((s) => (
                            <span key={s} className="badge bg-emerald-50 text-[var(--color-accent-emerald)] border border-emerald-200 text-[11px] font-semibold">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {candidate.aiAnalysis.skillMatch.missing && candidate.aiAnalysis.skillMatch.missing.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-[var(--color-accent-rose)] mb-1.5 block uppercase tracking-wide">Missing Skills</span>
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.aiAnalysis.skillMatch.missing.map((s) => (
                            <span key={s} className="badge bg-red-50 text-[var(--color-accent-rose)] border border-red-200 text-[11px] font-semibold">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-accent-emerald)] mb-2 uppercase tracking-wide">✓ Strengths</h4>
                    <ul className="space-y-1.5">
                      {candidate.aiAnalysis.strengths.map((s, i) => (
                        <li key={i} className="text-xs font-medium text-[var(--color-text-secondary)] leading-relaxed">• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-accent-amber)] mb-2 uppercase tracking-wide">⚠ Gaps</h4>
                    <ul className="space-y-1.5">
                      {candidate.aiAnalysis.gaps.map((g, i) => (
                        <li key={i} className="text-xs font-medium text-[var(--color-text-secondary)] leading-relaxed">• {g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-[var(--color-border-subtle)] rounded-2xl bg-[var(--color-bg-primary)]">
                <Brain className="mx-auto mb-3 text-[var(--color-text-muted)] opacity-50" size={32} />
                <p className="text-sm font-medium text-[var(--color-text-muted)]">No analysis yet. Click &quot;Run Analysis&quot; above.</p>
              </div>
            )}
          </div>

          {/* Interview Questions */}
          <div className="dashboard-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <MessageSquare size={16} className="text-[var(--color-accent-violet)]" />
                Interview Questions ({candidate.interviewQuestions.length})
              </h2>
              <button
                onClick={generateQuestions}
                disabled={generatingQuestions}
                className="btn-secondary text-xs font-semibold py-1.5 px-3"
              >
                {generatingQuestions ? (
                  <><Loader2 size={12} className="animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles size={12} /> Generate Questions</>
                )}
              </button>
            </div>

            {candidate.interviewQuestions.length > 0 ? (
              <div className="space-y-3">
                {candidate.interviewQuestions.map((q, i) => (
                  <div key={q.id} className="glass-card-sm p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono font-bold text-[var(--color-text-muted)] mt-0.5 shrink-0">
                        Q{i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[var(--color-text-primary)] leading-relaxed mb-3">{q.question}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`badge text-[10px] ${categoryColor[q.category] || ""}`}>
                            {q.category}
                          </span>
                          <span className={`badge ${difficultyColor[q.difficulty] || ""}`}>
                            {q.difficulty}
                          </span>
                          {q.targetSkill && (
                            <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                              → Focus: {q.targetSkill}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-[var(--color-border-subtle)] rounded-2xl bg-[var(--color-bg-primary)]">
                <MessageSquare className="mx-auto mb-3 text-[var(--color-text-muted)] opacity-50" size={32} />
                <p className="text-sm font-medium text-[var(--color-text-muted)]">No interview questions generated yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Evaluations */}
        <div className="space-y-6">
          <div className="dashboard-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Star size={16} className="text-[var(--color-accent-amber)]" />
                Evaluations ({candidate.evaluations.length})
              </h2>
              <button
                onClick={() => setShowEvalForm(!showEvalForm)}
                className="btn-secondary text-xs font-semibold py-1.5 px-3 flex items-center gap-1"
              >
                {showEvalForm ? <X size={12} /> : <Plus size={12} />}
                {showEvalForm ? "Cancel" : "Add Review"}
              </button>
            </div>

            {showEvalForm && (
              <form onSubmit={submitEvaluation} className="space-y-4 mb-5 p-4 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]">
                <div>
                  <label htmlFor="eval-rating" className="input-label">Overall Recommendation</label>
                  <select id="eval-rating" name="rating" required className="input-field text-sm">
                    {Object.entries(ratingLabels).map(([val, { label }]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                {["technicalScore", "communicationScore", "cultureFitScore", "experienceScore"].map((field) => (
                  <div key={field}>
                    <label htmlFor={`eval-${field}`} className="input-label">
                      {field.replace("Score", "").replace(/([A-Z])/g, " $1").trim()} (1-5)
                    </label>
                    <input
                      id={`eval-${field}`}
                      name={field}
                      type="number"
                      min={1}
                      max={5}
                      required
                      className="input-field text-sm"
                      defaultValue={3}
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="eval-notes" className="input-label">Evaluation Notes</label>
                  <textarea id="eval-notes" name="notes" rows={3} className="input-field text-sm resize-y" placeholder="Additional feedback about the candidate..." />
                </div>
                <button type="submit" disabled={submittingEval} className="btn-primary w-full justify-center text-sm">
                  {submittingEval ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Submit Evaluation
                </button>
              </form>
            )}

            {candidate.evaluations.length > 0 ? (
              <div className="space-y-3">
                {candidate.evaluations.map((ev) => (
                  <div key={ev.id} className="glass-card-sm p-4 border border-[var(--color-border-subtle)] bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">{ev.reviewer.name}</span>
                      <span className={ratingLabels[ev.rating]?.color || ""}>
                        {ratingLabels[ev.rating]?.label || ev.rating}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold text-[var(--color-text-muted)] mt-2">
                      <span>Tech: {ev.technicalScore}/5</span>
                      <span>Comm: {ev.communicationScore}/5</span>
                      <span>Culture: {ev.cultureFitScore}/5</span>
                      <span>Exp: {ev.experienceScore}/5</span>
                    </div>
                    {ev.notes && (
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-3 italic border-t border-[var(--color-border-subtle)] pt-2 leading-relaxed">
                        &quot;{ev.notes}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-6 border border-dashed border-[var(--color-border-subtle)] rounded-2xl bg-[var(--color-bg-primary)]">
                No evaluations yet.
              </p>
            )}
          </div>

          {/* Resume Preview */}
          <div className="dashboard-card p-6">
            <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-3">Resume Content</h2>
            <div className="max-h-[400px] overflow-y-auto border border-[var(--color-border-subtle)] rounded-xl bg-[var(--color-bg-primary)] p-4">
              <pre className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap font-mono leading-relaxed">
                {candidate.resumeText}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
