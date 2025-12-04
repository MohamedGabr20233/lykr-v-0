import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  password: z.string().min(1, "passwordRequired"),
});

// Register Schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "nameRequired")
      .min(2, "nameMinLength")
      .max(120, "nameMaxLength"),
    email: z
      .string()
      .min(1, "emailRequired")
      .email("emailInvalid")
      .max(150, "emailMaxLength"),
    password: z
      .string()
      .min(1, "passwordRequired")
      .min(8, "passwordMinLength")
      .max(255, "passwordMaxLength")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "passwordWeak"
      ),
    confirmPassword: z.string().min(1, "passwordRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
});

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "tokenRequired"),
    password: z
      .string()
      .min(1, "passwordRequired")
      .min(8, "passwordMinLength")
      .max(255, "passwordMaxLength")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "passwordWeak"
      ),
    confirmPassword: z.string().min(1, "passwordRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

// Verify OTP Schema
export const verifyOtpSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  otp: z
    .string()
    .min(1, "otpRequired")
    .length(6, "otpLength")
    .regex(/^\d+$/, "otpInvalid"),
});

// Reset Password By OTP Schema (after OTP verification)
export const resetPasswordByOtpSchema = z
  .object({
    email: z.string().min(1, "emailRequired").email("emailInvalid"),
    password: z
      .string()
      .min(1, "passwordRequired")
      .min(8, "passwordMinLength")
      .max(255, "passwordMaxLength")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "passwordWeak"),
    confirmPassword: z.string().min(1, "passwordRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordByOtpInput = z.infer<typeof resetPasswordByOtpSchema>;
