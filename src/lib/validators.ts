import { z } from "zod";

// ─── AUTH SCHEMAS ────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and a number"
      ),
    confirmPassword: z.string(),
    role: z.enum(["RECRUITER", "HIRING_MANAGER", "INTERVIEWER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── JOB SCHEMAS ────────────────────────────────────────

export const jobRequirementsSchema = z.object({
  skills: z.array(z.string().min(1)).min(1, "At least one skill is required"),
  experience: z.string().min(1, "Experience requirement is needed"),
  education: z.string().min(1, "Education requirement is needed"),
  certifications: z.array(z.string()).default([]),
});

export const createJobSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title is too long"),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "REMOTE"]),
  salaryMin: z.number().int().positive().optional().nullable(),
  salaryMax: z.number().int().positive().optional().nullable(),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters"),
  requirements: jobRequirementsSchema,
});

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(["DRAFT", "OPEN", "PAUSED", "CLOSED", "ARCHIVED"]).optional(),
});

// ─── CANDIDATE SCHEMAS ──────────────────────────────────

export const createCandidateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  linkedIn: z.string().url("Invalid LinkedIn URL").optional().nullable(),
  resumeText: z.string().min(50, "Resume text must be at least 50 characters"),
  jobId: z.string().min(1, "Job ID is required"),
});

export const updateCandidateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  linkedIn: z.string().url().optional().nullable(),
  resumeText: z.string().min(50).optional(),
  stage: z
    .enum([
      "APPLIED",
      "SCREENING",
      "INTERVIEW",
      "OFFER",
      "HIRED",
      "REJECTED",
    ])
    .optional(),
});

// ─── EVALUATION SCHEMAS ─────────────────────────────────

export const createEvaluationSchema = z.object({
  candidateId: z.string().min(1, "Candidate ID is required"),
  rating: z.enum(["STRONG_NO", "NO", "MAYBE", "YES", "STRONG_YES"]),
  technicalScore: z.number().int().min(1).max(5),
  communicationScore: z.number().int().min(1).max(5),
  cultureFitScore: z.number().int().min(1).max(5),
  experienceScore: z.number().int().min(1).max(5),
  notes: z.string().optional().nullable(),
});

// ─── AI SCHEMAS ─────────────────────────────────────────

export const analyzeResumeSchema = z.object({
  resumeText: z.string().min(50, "Resume text is too short"),
  jobRequirements: jobRequirementsSchema,
  jobTitle: z.string().min(1),
  jobDescription: z.string().min(1),
});

export const generateQuestionsSchema = z.object({
  candidateId: z.string().min(1),
  resumeText: z.string().min(50),
  jobTitle: z.string().min(1),
  jobRequirements: jobRequirementsSchema,
  focusAreas: z.array(z.string()).optional(),
});

export const biasCheckSchema = z.object({
  text: z.string().min(10, "Text is too short to analyze"),
  context: z.enum(["JOB_DESCRIPTION", "EVALUATION", "GENERAL"]),
});

export const aiChatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000),
  jobId: z.string().optional(),
});

// ─── TYPES ──────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;
export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
