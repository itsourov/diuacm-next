import { z } from "zod"

export const passwordSchema = z.object({
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[a-zA-Z]/, "Password must contain at least one letter"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

export type PasswordFormData = z.infer<typeof passwordSchema>