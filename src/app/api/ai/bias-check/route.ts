import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/lib/auth";
import { biasCheckSchema } from "@/lib/validators";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * POST /api/ai/bias-check — Analyze text for potential bias
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = checkRateLimit(`ai-bias:${session.user.id}`, {
      maxRequests: 15,
      windowSeconds: 60,
    });
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetIn);
    }

    const body = await request.json();
    const parsed = biasCheckSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { text, context } = parsed.data;

    const contextDescriptions: Record<string, string> = {
      JOB_DESCRIPTION: "a job description/posting",
      EVALUATION: "a candidate evaluation or review",
      GENERAL: "hiring-related text",
    };

    const prompt = `You are a diversity and inclusion expert. Analyze the following ${contextDescriptions[context]} for potential bias, exclusionary language, or problematic phrasing.

TEXT TO ANALYZE:
${text}

Respond ONLY with a valid JSON object (no markdown, no code blocks):
{
  "biasScore": <number 0-100, where 0 = no bias detected, 100 = highly biased>,
  "flags": [
    {
      "text": "the problematic phrase or word",
      "issue": "what the bias/problem is",
      "suggestion": "an inclusive alternative"
    }
  ],
  "overallAssessment": "A brief 1-2 sentence summary of the analysis",
  "isClean": <boolean, true if no significant bias detected>
}

Look for: gendered language, age bias, disability exclusion, racial/ethnic assumptions, education elitism, unnecessary requirements that reduce diversity. Be constructive, not punitive.`;

    const { text: responseText } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
    });

    const cleanedText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(cleanedText);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI bias-check error:", error);
    return NextResponse.json(
      { error: "Bias check failed. Please try again." },
      { status: 500 }
    );
  }
}
