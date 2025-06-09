import { z } from "zod";

// User profile validation schema (for regular users)
export const userProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters"),
  email: z
    .string()
    .email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be at most 64 characters")
    .optional()
    .or(z.literal("")), // allow blank if not changing password
  confirmPassword: z
    .string()
    .optional()
    .or(z.literal("")) // allow blank if not changing password
}).refine(
  (data) =>
    !data.password || data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  }
);

// Admin profile validation schema (can be the same as user, but separated for future extension)
export const adminProfileSchema = userProfileSchema;