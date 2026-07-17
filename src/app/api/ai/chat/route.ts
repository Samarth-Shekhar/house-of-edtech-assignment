import { NextRequest } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * POST /api/ai/chat — Streaming AI assistant for recruiter insights
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const rateCheck = checkRateLimit(`ai-chat:${session.user.id}`, {
      maxRequests: 20,
      windowSeconds: 60,
    });
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetIn);
    }

    const { message, jobId } = await request.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
      });
    }

    // Build context from database
    let context = "";

    if (jobId) {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          candidates: {
            include: { aiAnalysis: true },
            orderBy: { overallScore: { sort: "desc", nulls: "last" } },
            take: 20,
          },
        },
      });

      if (job) {
        context = `
CURRENT JOB CONTEXT:
Title: ${job.title}
Department: ${job.department}
Location: ${job.location}
Status: ${job.status}
Requirements: ${JSON.stringify(job.requirements)}
Total Candidates: ${job.candidates.length}

TOP CANDIDATES:
${job.candidates
  .slice(0, 10)
  .map(
    (c: { name: string; overallScore: number | null; stage: string }, i) =>
      `${i + 1}. ${c.name} (Score: ${c.overallScore ?? "Not analyzed"}, Stage: ${c.stage})`
  )
  .join("\n")}
`;
      }
    } else {
      // General stats
      const [jobCount, candidateCount, avgScore] = await Promise.all([
        prisma.job.count({ where: { status: "OPEN" } }),
        prisma.candidate.count(),
        prisma.candidate.aggregate({
          _avg: { overallScore: true },
        }),
      ]);

      context = `
PLATFORM OVERVIEW:
Open Jobs: ${jobCount}
Total Candidates: ${candidateCount}
Average AI Score: ${avgScore._avg.overallScore?.toFixed(1) ?? "N/A"}
`;
    }

    const systemPrompt = `You are IntelliHire AI, an intelligent recruiting assistant. You help recruiters make data-driven hiring decisions.

${context}

Guidelines:
- Be concise and actionable
- Reference specific candidates and data when possible
- Provide insights, not just answers
- If asked to compare candidates, be objective and data-driven
- Format responses with markdown for readability
- Never discriminate based on demographic information`;

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      prompt: message,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ error: "AI assistant unavailable" }),
      { status: 500 }
    );
  }
}
