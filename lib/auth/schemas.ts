import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const setupSchema = z
  .object({
    adminName: z
      .string()
      .trim()
      .min(2, "Please enter your full name (at least 2 characters)"),
    adminEmail: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    adminPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.adminPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SetupValues = z.infer<typeof setupSchema>;
