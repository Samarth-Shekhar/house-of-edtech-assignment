import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { JobDetailClient } from "@/components/jobs/job-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

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

  if (!job) notFound();

  // Serialize for client component
  const serializedJob = JSON.parse(JSON.stringify(job));
  if (serializedJob) {
    const { parseRequirements } = require("@/lib/utils");
    serializedJob.requirements = parseRequirements(serializedJob.requirements);
  }

  return <JobDetailClient job={serializedJob} />;
}
