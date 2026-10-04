import { z } from "zod";
import { AFRICAN_COUNTRIES, BUSINESS_SECTORS } from "@/lib/constants";

export const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "First name is required.").max(80),
    lastName: z.string().min(1, "Last name is required.").max(80),
    company: z.string().min(1, "Company is required.").max(120),
    position: z.string().min(1, "Position is required.").max(120),
    country: z.string().min(1, "Country is required."),
    city: z.string().min(1, "City is required.").max(80),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  company: z.string().max(120).optional().nullable(),
  position: z.string().max(120).optional().nullable(),
  country: z.string().optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  biography: z.string().max(2000).optional().nullable(),
  sector: z.string().optional().nullable(),
  website: z
    .string()
    .url("Enter a valid website URL.")
    .optional()
    .or(z.literal(""))
    .nullable(),
  linkedin: z
    .string()
    .url("Enter a valid LinkedIn URL.")
    .optional()
    .or(z.literal(""))
    .nullable(),
});

export const postSchema = z.object({
  content: z.string().min(1, "Post content is required.").max(3000),
});

export const commentSchema = z.object({
  content: z.string().min(1, "Comment is required.").max(1000),
});

export const messageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1, "Message cannot be empty.").max(4000),
});

export const connectionCreateSchema = z.object({
  receiverId: z.string().min(1),
});

export const connectionActionSchema = z.object({
  action: z.enum(["accept", "refuse"]),
});

export const searchQuerySchema = z.object({
  q: z.string().optional().default(""),
  company: z.string().optional(),
  country: z.string().optional(),
  sector: z.string().optional(),
});

export const countryValues = AFRICAN_COUNTRIES as unknown as string[];
export const sectorValues = BUSINESS_SECTORS as unknown as string[];
