"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, users } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  resetPasswordByOtpSchema,
} from "@/app/types/auth";
import { getLocale } from "next-intl/server";
import { AuthError } from "next-auth";

// Types for action state
export interface ActionState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  values?: Record<string, string>;
}

// Helper to get translated validation messages
async function getValidationMessages() {
  const locale = await getLocale();
  const messages = (await import(`@/messages/${locale}.json`)).default;
  return messages.validation;
}

async function getAuthMessages() {
  const locale = await getLocale();
  const messages = (await import(`@/messages/${locale}.json`)).default;
  return messages.auth;
}

async function getErrorMessages() {
  const locale = await getLocale();
  const messages = (await import(`@/messages/${locale}.json`)).default;
  return messages.errors;
}

// Helper to translate Zod errors
function translateErrors(
  errors: Record<string, string[]>,
  validationMessages: Record<string, string>
): Record<string, string[]> {
  const translated: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(errors)) {
    translated[field] = messages.map(
      (msg) => validationMessages[msg] || msg
    );
  }
  return translated;
}

// ==================== REGISTER ====================
export async function register(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validationMessages = await getValidationMessages();
  const authMessages = await getAuthMessages();
  const errorMessages = await getErrorMessages();

  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // Values to preserve on error (exclude passwords for security)
  const preserveValues = {
    name: rawData.name || "",
    email: rawData.email || "",
  };

  const result = registerSchema.safeParse(rawData);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors as Record<string, string[]>;
    return {
      success: false,
      message: authMessages.registerFailed,
      errors: translateErrors(errors, validationMessages),
      values: preserveValues,
    };
  }

  try {
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, result.data.email))
      .limit(1);

    if (existingUser) {
      return {
        success: false,
        message: authMessages.registerFailed,
        errors: {
          email: [validationMessages.emailExists],
        },
        values: preserveValues,
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(result.data.password, 12);

    // Create user
    await db.insert(users).values({
      name: result.data.name,
      email: result.data.email,
      password: hashedPassword,
    });

    return {
      success: true,
      message: authMessages.registerSuccess,
    };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      message: errorMessages.serverError,
    };
  }
}

// ==================== LOGIN ====================
export async function login(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validationMessages = await getValidationMessages();
  const authMessages = await getAuthMessages();
  const errorMessages = await getErrorMessages();

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Preserve email on error
  const preserveValues = {
    email: rawData.email || "",
  };

  const result = loginSchema.safeParse(rawData);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors as Record<string, string[]>;
    return {
      success: false,
      message: authMessages.loginFailed,
      errors: translateErrors(errors, validationMessages),
      values: preserveValues,
    };
  }

  try {
    await signIn("credentials", {
      email: result.data.email,
      password: result.data.password,
      redirect: false,
    });

    return {
      success: true,
      message: authMessages.loginSuccess,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: validationMessages.invalidCredentials,
        values: preserveValues,
      };
    }
    return {
      success: false,
      message: errorMessages.serverError,
      values: preserveValues,
    };
  }
}

// ==================== GOOGLE SIGN IN ====================
export async function googleSignIn() {
  await signIn("google", { redirectTo: "/onboarding/business-info" });
}

// ==================== LOGOUT ====================
export async function logout(): Promise<ActionState> {
  const authMessages = await getAuthMessages();

  await signOut({ redirect: false });

  return {
    success: true,
    message: authMessages.logoutSuccess,
  };
}

// ==================== FORGOT PASSWORD ====================
export async function forgotPassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validationMessages = await getValidationMessages();
  const authMessages = await getAuthMessages();
  const errorMessages = await getErrorMessages();

  const rawData = {
    email: formData.get("email") as string,
  };

  const result = forgotPasswordSchema.safeParse(rawData);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors as Record<string, string[]>;
    return {
      success: false,
      message: authMessages.loginFailed,
      errors: translateErrors(errors, validationMessages),
    };
  }

  try {
    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, result.data.email))
      .limit(1);

    if (!user) {
      return {
        success: false,
        message: authMessages.loginFailed,
        errors: {
          email: [validationMessages.emailNotFound],
        },
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save reset token to user
    await db
      .update(users)
      .set({
        resetToken: resetToken,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // TODO: Send email with reset link
    // For now, we'll just return success
    // In production, you would send an email with:
    // `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

    console.log("Reset token for", result.data.email, ":", resetToken);

    return {
      success: true,
      message: authMessages.passwordResetSent,
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      message: errorMessages.serverError,
    };
  }
}

// ==================== RESET PASSWORD ====================
export async function resetPassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validationMessages = await getValidationMessages();
  const authMessages = await getAuthMessages();
  const errorMessages = await getErrorMessages();

  const rawData = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = resetPasswordSchema.safeParse(rawData);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors as Record<string, string[]>;
    return {
      success: false,
      message: authMessages.loginFailed,
      errors: translateErrors(errors, validationMessages),
    };
  }

  try {
    // Find user by reset token
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, result.data.token))
      .limit(1);

    if (!user) {
      return {
        success: false,
        message: authMessages.loginFailed,
        errors: {
          token: [validationMessages.tokenInvalid],
        },
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(result.data.password, 12);

    // Update password and clear reset token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return {
      success: true,
      message: authMessages.passwordResetSuccess,
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message: errorMessages.serverError,
    };
  }
}

// ==================== SEND OTP ====================
export async function sendOtp(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validationMessages = await getValidationMessages();
  const authMessages = await getAuthMessages();
  const errorMessages = await getErrorMessages();

  const email = formData.get("email") as string;

  if (!email) {
    return {
      success: false,
      message: authMessages.loginFailed,
      errors: {
        email: [validationMessages.emailRequired],
      },
    };
  }

  try {
    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return {
        success: false,
        message: authMessages.loginFailed,
        errors: {
          email: [validationMessages.emailNotFound],
        },
      };
    }

    // Generate OTP - using 123456 for testing
    const otpCode = "123456";
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    await db
      .update(users)
      .set({
        otpCode: otpCode,
        otpExpiresAt: otpExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // TODO: Send OTP via email/SMS
    // For now, we're using 123456 for testing
    console.log("OTP for", email, ":", otpCode);

    return {
      success: true,
      message: authMessages.otpSent,
    };
  } catch (error) {
    console.error("Send OTP error:", error);
    return {
      success: false,
      message: errorMessages.serverError,
    };
  }
}

// ==================== VERIFY OTP ====================
export async function verifyOtp(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validationMessages = await getValidationMessages();
  const authMessages = await getAuthMessages();
  const errorMessages = await getErrorMessages();

  const rawData = {
    email: formData.get("email") as string,
    otp: formData.get("otp") as string,
  };

  const result = verifyOtpSchema.safeParse(rawData);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors as Record<string, string[]>;
    return {
      success: false,
      message: authMessages.loginFailed,
      errors: translateErrors(errors, validationMessages),
    };
  }

  try {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, result.data.email))
      .limit(1);

    if (!user) {
      return {
        success: false,
        message: authMessages.loginFailed,
        errors: {
          email: [validationMessages.emailNotFound],
        },
      };
    }

    // Check OTP
    if (user.otpCode !== result.data.otp) {
      return {
        success: false,
        message: authMessages.loginFailed,
        errors: {
          otp: [validationMessages.otpInvalid],
        },
      };
    }

    // Check OTP expiration
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return {
        success: false,
        message: authMessages.loginFailed,
        errors: {
          otp: [validationMessages.otpExpired],
        },
      };
    }

    // Clear OTP
    await db
      .update(users)
      .set({
        otpCode: null,
        otpExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return {
      success: true,
      message: authMessages.otpVerified,
    };
  } catch (error) {
    console.error("Verify OTP error:", error);
    return {
      success: false,
      message: errorMessages.serverError,
    };
  }
}

// ==================== RESET PASSWORD BY OTP ====================
export async function resetPasswordByOtp(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validationMessages = await getValidationMessages();
  const authMessages = await getAuthMessages();
  const errorMessages = await getErrorMessages();

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = resetPasswordByOtpSchema.safeParse(rawData);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors as Record<string, string[]>;
    return {
      success: false,
      message: authMessages.loginFailed,
      errors: translateErrors(errors, validationMessages),
    };
  }

  try {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, result.data.email))
      .limit(1);

    if (!user) {
      return {
        success: false,
        message: authMessages.loginFailed,
        errors: {
          email: [validationMessages.emailNotFound],
        },
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(result.data.password, 12);

    // Update password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return {
      success: true,
      message: authMessages.passwordResetSuccess,
    };
  } catch (error) {
    console.error("Reset password by OTP error:", error);
    return {
      success: false,
      message: errorMessages.serverError,
    };
  }
}
