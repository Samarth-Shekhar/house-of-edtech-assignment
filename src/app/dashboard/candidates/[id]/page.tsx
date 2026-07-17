import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { CandidateDetailClient } from "@/components/candidates/candidate-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidateDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

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

  if (!candidate) notFound();

  const serialized = JSON.parse(JSON.stringify(candidate));
  if (serialized && serialized.job) {
    const { parseRequirements } = require("@/lib/utils");
    serialized.job.requirements = parseRequirements(serialized.job.requirements);
  }

  return <CandidateDetailClient candidate={serialized} />;
}
