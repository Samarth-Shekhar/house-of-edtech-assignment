import { type ClassValue, clsx } from "clsx";

/**
 * Merge Tailwind CSS classes without conflicts.
 * Uses clsx for conditional class joining.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Capitalize the first letter of a string and lowercase the rest.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format a pipeline stage enum value for display.
 * e.g., "HIRING_MANAGER" → "Hiring Manager"
 */
export function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Truncate a string to a specified length with ellipsis.
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

/**
 * Generate initials from a name (e.g., "John Doe" → "JD")
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get the color class for a pipeline stage.
 */
export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    APPLIED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    SCREENING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    INTERVIEW: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    OFFER: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    HIRED: "bg-green-500/20 text-green-300 border-green-500/30",
    REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[stage] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}

/**
 * Get the score color based on value (0-100).
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

/**
 * Get score gradient for SVG ring.
 */
export function getScoreGradient(score: number): [string, string] {
  if (score >= 80) return ["#34d399", "#10b981"];
  if (score >= 60) return ["#fbbf24", "#f59e0b"];
  if (score >= 40) return ["#fb923c", "#f97316"];
  return ["#f87171", "#ef4444"];
}

/**
 * Sanitize user input — strip HTML tags and trim whitespace.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/**
 * Format a number as a compact string (e.g., 1200 → "1.2K")
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

/**
 * Calculate weighted score from multiple dimensions.
 */
export function calculateWeightedScore(scores: {
  skillScore: number;
  experienceScore: number;
  educationScore: number;
}): number {
  const weights = { skill: 0.5, experience: 0.35, education: 0.15 };
  return Math.round(
    scores.skillScore * weights.skill +
      scores.experienceScore * weights.experience +
      scores.educationScore * weights.education
  );
}

export interface JobRequirements {
  skills: string[];
  experience: string;
  education: string;
  certifications: string[];
}

export function parseRequirements(req: unknown): JobRequirements {
  const fallback: JobRequirements = {
    skills: [],
    experience: "",
    education: "",
    certifications: [],
  };

  if (!req) return fallback;
  if (typeof req === "object" && req !== null) {
    const o = req as Record<string, unknown>;
    return {
      skills: Array.isArray(o.skills) ? o.skills : [],
      experience: typeof o.experience === "string" ? o.experience : "",
      education: typeof o.education === "string" ? o.education : "",
      certifications: Array.isArray(o.certifications) ? o.certifications : [],
    };
  }

  if (typeof req === "string") {
    try {
      const parsed = JSON.parse(req);
      return parseRequirements(parsed);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

