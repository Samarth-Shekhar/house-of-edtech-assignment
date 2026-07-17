"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const jobTypes = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "REMOTE", label: "Remote" },
];

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState("");

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  }

  function addCert() {
    const trimmed = certInput.trim();
    if (trimmed && !certifications.includes(trimmed)) {
      setCertifications([...certifications, trimmed]);
      setCertInput("");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);

      const body = {
        title: form.get("title") as string,
        department: form.get("department") as string,
        location: form.get("location") as string,
        type: form.get("type") as string,
        salaryMin: form.get("salaryMin") ? Number(form.get("salaryMin")) : null,
        salaryMax: form.get("salaryMax") ? Number(form.get("salaryMax")) : null,
        description: form.get("description") as string,
        requirements: {
          skills,
          experience: form.get("experience") as string,
          education: form.get("education") as string,
          certifications,
        },
      };

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create job");
      }

      const job = await res.json();
      toast.success("Job created successfully!");
      router.push(`/dashboard/jobs/${job.id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create job";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <Link
        href="/dashboard/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors no-underline mb-6"
      >
        <ArrowLeft size={14} /> Back to Jobs
      </Link>

      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2 tracking-tight">Create New Job</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        Fill in the details to create a new job posting.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="dashboard-card p-6 space-y-5">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-1 uppercase tracking-wider">Basic Information</h2>

          <div>
            <label htmlFor="title" className="input-label">Job Title *</label>
            <input id="title" name="title" required className="input-field" placeholder="e.g., Senior Frontend Engineer" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="department" className="input-label">Department *</label>
              <input id="department" name="department" required className="input-field" placeholder="e.g., Engineering" />
            </div>
            <div>
              <label htmlFor="location" className="input-label">Location *</label>
              <input id="location" name="location" required className="input-field" placeholder="e.g., Remote / NYC" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="type" className="input-label">Job Type *</label>
              <select id="type" name="type" required className="input-field">
                {jobTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="salaryMin" className="input-label">Min Salary ($)</label>
              <input id="salaryMin" name="salaryMin" type="number" className="input-field" placeholder="80000" />
            </div>
            <div>
              <label htmlFor="salaryMax" className="input-label">Max Salary ($)</label>
              <input id="salaryMax" name="salaryMax" type="number" className="input-field" placeholder="150000" />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="input-label">Job Description *</label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              className="input-field resize-y"
              placeholder="Describe the role, responsibilities, and what the ideal candidate looks like..."
              minLength={50}
            />
          </div>
        </div>

        {/* Requirements */}
        <div className="dashboard-card p-6 space-y-5">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-1 uppercase tracking-wider">Requirements</h2>

          {/* Skills */}
          <div>
            <label className="input-label">Required Skills *</label>
            <div className="flex gap-2 mb-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                className="input-field flex-1"
                placeholder="Type a skill and press Enter"
              />
              <button type="button" onClick={addSkill} className="btn-secondary px-3">
                <Plus size={16} />
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="badge pr-1.5"
                    style={{ background: "rgba(212,165,40,0.1)", color: "var(--color-accent-mustard)", borderColor: "rgba(212,165,40,0.2)" }}>
                    {skill}
                    <button type="button" onClick={() => setSkills(skills.filter((s) => s !== skill))} className="ml-1 hover:opacity-60 transition-opacity">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {skills.length === 0 && (
              <p className="input-error">Add at least one required skill</p>
            )}
          </div>

          <div>
            <label htmlFor="experience" className="input-label">Experience *</label>
            <input id="experience" name="experience" required className="input-field" placeholder="e.g., 3-5 years in frontend development" />
          </div>

          <div>
            <label htmlFor="education" className="input-label">Education *</label>
            <input id="education" name="education" required className="input-field" placeholder="e.g., Bachelor's in CS or equivalent" />
          </div>

          {/* Certifications */}
          <div>
            <label className="input-label">Certifications (optional)</label>
            <div className="flex gap-2 mb-2">
              <input
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCert())}
                className="input-field flex-1"
                placeholder="e.g., AWS Certified"
              />
              <button type="button" onClick={addCert} className="btn-secondary px-3">
                <Plus size={16} />
              </button>
            </div>
            {certifications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <span key={cert} className="badge pr-1.5"
                    style={{ background: "rgba(224,144,0,0.1)", color: "var(--color-accent-amber)", borderColor: "rgba(224,144,0,0.2)" }}>
                    {cert}
                    <button type="button" onClick={() => setCertifications(certifications.filter((c) => c !== cert))} className="ml-1 hover:opacity-60 transition-opacity">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/jobs" className="btn-secondary no-underline">
            Cancel
          </Link>
          <button type="submit" disabled={loading || skills.length === 0} className="btn-primary">
            {loading ? (
              <><Loader2 className="animate-spin" size={16} /> Creating...</>
            ) : (
              <><Send size={16} /> Create Job</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
