import { prisma } from "@/lib/prisma";

/**
 * Log an action to the audit trail.
 * Used for security compliance and tracking all data mutations.
 */
export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  details,
  ipAddress,
}: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details as any,
        ipAddress,
      },
    });
  } catch (error) {
    // Don't let audit logging failures break the main flow
    console.error("Audit log error:", error);
  }
}
