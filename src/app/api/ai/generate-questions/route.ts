import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/authorization";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * POST /api/ai/generate-questions — Generate tailored interview questions
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

    const rateCheck = checkRateLimit(`ai-questions:${session.user.id}`, {
      maxRequests: 10,
      windowSeconds: 60,
    });
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetIn);
    }

    const body = await request.json();
    const { candidateId, resumeText, jobTitle, jobRequirements, focusAreas } = body;

    if (!resumeText || !jobTitle || !jobRequirements) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert interviewer. Generate tailored interview questions for a candidate applying for a ${jobTitle} position.

REQUIRED SKILLS: ${jobRequirements.skills?.join(", ") || "N/A"}
EXPERIENCE REQUIREMENT: ${jobRequirements.experience || "N/A"}
${focusAreas?.length ? `FOCUS AREAS: ${focusAreas.join(", ")}` : ""}

CANDIDATE RESUME:
${resumeText}

Generate exactly 8 interview questions. Mix of categories:
- 3 TECHNICAL questions (test hard skills and technical knowledge)
- 3 BEHAVIORAL questions (test soft skills, teamwork, problem-solving)
- 2 SITUATIONAL questions (hypothetical scenarios relevant to the role)

Respond ONLY with a valid JSON array (no markdown, no code blocks):
[
  {
    "question": "The interview question text",
    "category": "TECHNICAL" | "BEHAVIORAL" | "SITUATIONAL",
    "targetSkill": "The specific skill or trait this question evaluates",
    "difficulty": "EASY" | "MEDIUM" | "HARD"
  }
]

Make questions specific to the candidate's background — reference their resume where relevant. Avoid generic questions.`;

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
    });

    const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const questions = JSON.parse(cleanedText);

    // Store questions if candidateId provided
    if (candidateId) {
      // Delete old questions
      await prisma.interviewQuestion.deleteMany({
        where: { candidateId },
      });

      // Create new questions
      await prisma.interviewQuestion.createMany({
        data: questions.map((q: { question: string; category: string; targetSkill?: string; difficulty: string }) => ({
          candidateId,
          question: q.question,
          category: q.category,
          targetSkill: q.targetSkill || null,
          difficulty: q.difficulty,
        })),
      });
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("AI generate-questions error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 }
    );
  }
}
