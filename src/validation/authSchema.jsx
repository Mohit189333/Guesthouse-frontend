import { z } from "zod";

const passwordRequirements = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[@$!%*?&#^()_\-+={}[\]|\\:;"'<>,.?/~`]/, "Password must contain at least one special character");

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: passwordRequirements,
});

export const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"), // <-- Email format validation
  password: passwordRequirements,
  role: z.enum(["USER", "ADMIN"]),
});