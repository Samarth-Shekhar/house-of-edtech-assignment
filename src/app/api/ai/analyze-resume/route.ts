import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/authorization";
import { analyzeResumeSchema } from "@/lib/validators";
import { logAudit } from "@/lib/audit";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * POST /api/ai/analyze-resume — AI-powered resume analysis against job requirements
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role as "ADMIN" | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER", "use:ai")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Stricter rate limit for AI calls
    const rateCheck = checkRateLimit(`ai-analyze:${session.user.id}`, {
      maxRequests: 10,
      windowSeconds: 60,
    });
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetIn);
    }

    const body = await request.json();
    const parsed = analyzeResumeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { resumeText, jobRequirements, jobTitle, jobDescription } = parsed.data;

    const prompt = `You are an expert technical recruiter AI. Analyze the following resume against the job requirements and provide a detailed assessment.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION: ${jobDescription}

JOB REQUIREMENTS:
- Required Skills: ${jobRequirements.skills.join(", ")}
- Experience: ${jobRequirements.experience}
- Education: ${jobRequirements.education}
- Certifications: ${jobRequirements.certifications.join(", ") || "None specified"}

RESUME:
${resumeText}

Respond ONLY with a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "skillMatch": {
    "matched": ["skills from requirements found in resume"],
    "missing": ["required skills NOT found in resume"],
    "extra": ["additional valuable skills found in resume not in requirements"]
  },
  "skillScore": <number 0-100>,
  "experienceScore": <number 0-100>,
  "educationScore": <number 0-100>,
  "overallScore": <number 0-100, weighted: skills 50%, experience 35%, education 15%>,
  "strengths": ["top 3-5 candidate strengths"],
  "gaps": ["top 3-5 concerns or gaps"],
  "summary": "A 2-3 sentence executive summary of the candidate's fit for this role"
}

Be objective, fair, and focus on skills and qualifications. Do not consider names, gender, age, or any demographic information.`;

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
    });

    // Parse AI response
    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(cleanedText);

    // Store analysis if candidateId provided
    if (body.candidateId) {
      await prisma.aIAnalysis.upsert({
        where: { candidateId: body.candidateId },
        create: {
          candidateId: body.candidateId,
          skillMatch: analysis.skillMatch,
          skillScore: analysis.skillScore,
          experienceScore: analysis.experienceScore,
          educationScore: analysis.educationScore,
          overallScore: analysis.overallScore,
          strengths: analysis.strengths,
          gaps: analysis.gaps,
          summary: analysis.summary,
          rawResponse: analysis,
        },
        update: {
          skillMatch: analysis.skillMatch,
          skillScore: analysis.skillScore,
          experienceScore: analysis.experienceScore,
          educationScore: analysis.educationScore,
          overallScore: analysis.overallScore,
          strengths: analysis.strengths,
          gaps: analysis.gaps,
          summary: analysis.summary,
          rawResponse: analysis,
        },
      });

      // Update candidate's overall score
      await prisma.candidate.update({
        where: { id: body.candidateId },
        data: { overallScore: analysis.overallScore },
      });

      await logAudit({
        userId: session.user.id,
        action: "AI_ANALYSIS",
        entity: "CANDIDATE",
        entityId: body.candidateId,
        details: { overallScore: analysis.overallScore },
      });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI analyze-resume error:", error);
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
