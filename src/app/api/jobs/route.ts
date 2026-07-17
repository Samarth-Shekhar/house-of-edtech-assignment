import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/authorization";
import { createJobSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/utils";

/**
 * GET /api/jobs — List all jobs with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    // Non-admin users can only see OPEN jobs or their own
    if (session.user.role === "INTERVIEWER") {
      where.status = "OPEN";
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, email: true } },
          _count: { select: { candidates: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs — Create a new job posting
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role as "ADMIN" | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER", "create:job")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Rate limit
    const rateCheck = checkRateLimit(`create-job:${session.user.id}`, {
      maxRequests: 10,
      windowSeconds: 60,
    });
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetIn);
    }

    const body = await request.json();
    const parsed = createJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const job = await prisma.job.create({
      data: {
        title: sanitizeInput(data.title),
        department: sanitizeInput(data.department),
        location: sanitizeInput(data.location),
        type: data.type,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        description: sanitizeInput(data.description),
        requirements: JSON.stringify(data.requirements),
        creatorId: session.user.id,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { candidates: true } },
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "CREATE",
      entity: "JOB",
      entityId: job.id,
      details: { title: job.title },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
