"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validators";
import { sanitizeInput } from "@/lib/utils";

export interface AuthResult {
  success: boolean;
  error?: string;
}

export async function registerUser(formData: FormData): Promise<AuthResult> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      role: formData.get("role") as string,
    };

    // Validate
    const parsed = registerSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { name, email, password, role } = parsed.data;

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    await prisma.user.create({
      data: {
        name: sanitizeInput(name),
        email: email.toLowerCase().trim(),
        hashedPassword,
        role: role as "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER",
      },
    });

    // Auto sign in after registration
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function loginUser(formData: FormData): Promise<AuthResult> {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate
    const parsed = loginSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await signIn("credentials", {
      email: rawData.email.toLowerCase(),
      password: rawData.password,
      redirect: false,
    });

    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "type" in error) {
      const authError = error as { type: string };
      if (authError.type === "CredentialsSignin") {
        return { success: false, error: "Invalid email or password" };
      }
    }
    // Re-throw redirect errors from NextAuth
    throw error;
  }
}
