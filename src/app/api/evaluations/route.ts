import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createEvaluationSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";

/**
 * POST /api/evaluations — Submit an evaluation for a candidate
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createEvaluationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: data.candidateId },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Check for existing evaluation by this reviewer
    const existing = await prisma.evaluation.findUnique({
      where: {
        candidateId_reviewerId: {
          candidateId: data.candidateId,
          reviewerId: session.user.id,
        },
      },
    });

    let evaluation;

    if (existing) {
      // Update existing evaluation
      evaluation = await prisma.evaluation.update({
        where: { id: existing.id },
        data: {
          rating: data.rating,
          technicalScore: data.technicalScore,
          communicationScore: data.communicationScore,
          cultureFitScore: data.cultureFitScore,
          experienceScore: data.experienceScore,
          notes: data.notes,
        },
        include: {
          reviewer: { select: { id: true, name: true } },
        },
      });
    } else {
      // Create new evaluation
      evaluation = await prisma.evaluation.create({
        data: {
          ...data,
          reviewerId: session.user.id,
        },
        include: {
          reviewer: { select: { id: true, name: true } },
        },
      });
    }

    await logAudit({
      userId: session.user.id,
      action: existing ? "UPDATE" : "CREATE",
      entity: "EVALUATION",
      entityId: evaluation.id,
      details: {
        candidateId: data.candidateId,
        rating: data.rating,
      },
    });

    return NextResponse.json(evaluation, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("POST /api/evaluations error:", error);
    return NextResponse.json(
      { error: "Failed to submit evaluation" },
      { status: 500 }
    );
  }
}
