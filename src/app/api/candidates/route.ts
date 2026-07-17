import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/authorization";
import { createCandidateSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/utils";

/**
 * GET /api/candidates — List candidates with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const jobId = searchParams.get("jobId");
    const stage = searchParams.get("stage");
    const search = searchParams.get("search");
    const minScore = searchParams.get("minScore");

    const where: Record<string, unknown> = {};

    if (jobId) where.jobId = jobId;
    if (stage) where.stage = stage;
    if (minScore) where.overallScore = { gte: parseFloat(minScore) };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        include: {
          job: { select: { id: true, title: true, department: true } },
          aiAnalysis: {
            select: {
              overallScore: true,
              skillScore: true,
              experienceScore: true,
              educationScore: true,
              strengths: true,
              gaps: true,
            },
          },
          _count: { select: { evaluations: true, interviewQuestions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.candidate.count({ where }),
    ]);

    return NextResponse.json({
      candidates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/candidates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/candidates — Add a new candidate to a job
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role as "ADMIN" | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER", "create:candidate")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rateCheck = checkRateLimit(`create-candidate:${session.user.id}`, {
      maxRequests: 20,
      windowSeconds: 60,
    });
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetIn);
    }

    const body = await request.json();
    const parsed = createCandidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify job exists and is open
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check for duplicate candidate on same job
    const existing = await prisma.candidate.findUnique({
      where: {
        email_jobId: {
          email: data.email.toLowerCase(),
          jobId: data.jobId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This candidate has already applied for this job" },
        { status: 409 }
      );
    }

    const candidate = await prisma.candidate.create({
      data: {
        name: sanitizeInput(data.name),
        email: data.email.toLowerCase().trim(),
        phone: data.phone ? sanitizeInput(data.phone) : null,
        linkedIn: data.linkedIn || null,
        resumeText: data.resumeText,
        jobId: data.jobId,
      },
      include: {
        job: { select: { id: true, title: true } },
        aiAnalysis: true,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entity: "CANDIDATE",
      entityId: candidate.id,
      details: { name: candidate.name, jobId: candidate.jobId },
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error("POST /api/candidates error:", error);
    return NextResponse.json(
      { error: "Failed to create candidate" },
      { status: 500 }
    );
  }
}
