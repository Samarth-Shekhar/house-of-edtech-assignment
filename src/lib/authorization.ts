import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

type Role = "ADMIN" | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER";

/**
 * Role-based permission matrix.
 * Each role has a set of allowed actions.
 */
const PERMISSIONS: Record<Role, Set<string>> = {
  ADMIN: new Set([
    "manage:users",
    "create:job",
    "read:job",
    "update:job",
    "delete:job",
    "create:candidate",
    "read:candidate",
    "update:candidate",
    "delete:candidate",
    "create:evaluation",
    "read:evaluation",
    "update:evaluation",
    "manage:pipeline",
    "use:ai",
    "view:analytics",
    "view:audit",
  ]),
  RECRUITER: new Set([
    "create:job",
    "read:job",
    "update:job",
    "delete:job",
    "create:candidate",
    "read:candidate",
    "update:candidate",
    "delete:candidate",
    "create:evaluation",
    "read:evaluation",
    "manage:pipeline",
    "use:ai",
    "view:analytics",
  ]),
  HIRING_MANAGER: new Set([
    "read:job",
    "read:candidate",
    "update:candidate",
    "create:evaluation",
    "read:evaluation",
    "manage:pipeline",
    "use:ai",
    "view:analytics",
  ]),
  INTERVIEWER: new Set([
    "read:job",
    "read:candidate",
    "create:evaluation",
    "read:evaluation",
  ]),
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: Role, permission: string): boolean {
  return PERMISSIONS[role]?.has(permission) ?? false;
}

/**
 * Server-side: Get the current authenticated session or redirect.
 * Use in Server Components and Server Actions.
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Server-side: Require a specific role or redirect.
 */
export async function requireRole(...roles: Role[]) {
  const session = await requireAuth();

  if (!roles.includes(session.user.role as Role)) {
    redirect("/dashboard?error=unauthorized");
  }

  return session;
}

/**
 * Server-side: Require a specific permission or throw.
 */
export async function requirePermission(permission: string) {
  const session = await requireAuth();

  if (!hasPermission(session.user.role as Role, permission)) {
    throw new Error(`Forbidden: Missing permission '${permission}'`);
  }

  return session;
}

/**
 * API route helper: Check auth and return session or 401 response.
 */
export async function getAuthOrThrow() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session;
}
