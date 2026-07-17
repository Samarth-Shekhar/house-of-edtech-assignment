import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/authorization";
import { updateJobSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { sanitizeInput } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/jobs/[id] — Get a single job with candidates
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        candidates: {
          include: {
            aiAnalysis: true,
            evaluations: {
              include: {
                reviewer: { select: { id: true, name: true } },
              },
            },
            _count: { select: { interviewQuestions: true } },
          },
          orderBy: { overallScore: { sort: "desc", nulls: "last" } },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job) {
      const { parseRequirements } = require("@/lib/utils");
      (job as any).requirements = parseRequirements(job.requirements);
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("GET /api/jobs/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/jobs/[id] — Update a job posting
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role as "ADMIN" | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER", "update:job")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (data.title) updateData.title = sanitizeInput(data.title);
    if (data.department) updateData.department = sanitizeInput(data.department);
    if (data.location) updateData.location = sanitizeInput(data.location);
    if (data.type) updateData.type = data.type;
    if (data.salaryMin !== undefined) updateData.salaryMin = data.salaryMin;
    if (data.salaryMax !== undefined) updateData.salaryMax = data.salaryMax;
    if (data.description) updateData.description = sanitizeInput(data.description);
    if (data.requirements) updateData.requirements = JSON.stringify(data.requirements);
    if (data.status) updateData.status = data.status;

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        _count: { select: { candidates: true } },
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entity: "JOB",
      entityId: id,
      details: { changes: Object.keys(updateData) },
    });

    if (job) {
      const { parseRequirements } = require("@/lib/utils");
      (job as any).requirements = parseRequirements(job.requirements);
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("PATCH /api/jobs/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/jobs/[id] — Soft delete (archive) a job
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role as "ADMIN" | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER", "delete:job")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Soft delete — archive instead of hard delete
    await prisma.job.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entity: "JOB",
      entityId: id,
      details: { title: existing.title },
    });

    return NextResponse.json({ message: "Job archived successfully" });
  } catch (error) {
    console.error("DELETE /api/jobs/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
