import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/authorization";
import { updateCandidateSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { sanitizeInput } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/candidates/[id] — Get full candidate profile
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            requirements: true,
            description: true,
          },
        },
        aiAnalysis: true,
        evaluations: {
          include: {
            reviewer: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        interviewQuestions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    if (candidate && candidate.job) {
      const { parseRequirements } = require("@/lib/utils");
      (candidate.job as any).requirements = parseRequirements(candidate.job.requirements);
    }

    return NextResponse.json(candidate);
  } catch (error) {
    console.error("GET /api/candidates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidate" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/candidates/[id] — Update candidate (including pipeline stage)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role as "ADMIN" | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER", "update:candidate")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCandidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.candidate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (data.name) updateData.name = sanitizeInput(data.name);
    if (data.email) updateData.email = data.email.toLowerCase().trim();
    if (data.phone !== undefined) updateData.phone = data.phone ? sanitizeInput(data.phone) : null;
    if (data.linkedIn !== undefined) updateData.linkedIn = data.linkedIn;
    if (data.resumeText) updateData.resumeText = data.resumeText;
    if (data.stage) {
      updateData.stage = data.stage;
      updateData.stageUpdatedAt = new Date();
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: updateData,
      include: {
        job: { select: { id: true, title: true } },
        aiAnalysis: true,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "UPDATE",
      entity: "CANDIDATE",
      entityId: id,
      details: {
        changes: Object.keys(updateData),
        ...(data.stage && {
          stageChange: { from: existing.stage, to: data.stage },
        }),
      },
    });

    return NextResponse.json(candidate);
  } catch (error) {
    console.error("PATCH /api/candidates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/candidates/[id] — Remove a candidate
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role as "ADMIN" | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER", "delete:candidate")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.candidate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    await prisma.candidate.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      action: "DELETE",
      entity: "CANDIDATE",
      entityId: id,
      details: { name: existing.name },
    });

    return NextResponse.json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/candidates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete candidate" },
      { status: 500 }
    );
  }
}
