"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { passwordSchema } from "../validations/password-schema"
import { hash } from "bcryptjs"
import { z } from "zod"
import { revalidatePath } from "next/cache"

export type PasswordUpdateResponse = {
    success: boolean
    error?: string
}

export async function updatePassword(
    data: z.infer<typeof passwordSchema>
): Promise<PasswordUpdateResponse> {
    try {
        const session = await auth()
        if (!session?.user) {
            return {
                success: false,
                error: "Unauthorized"
            }
        }

        const hashedPassword = await hash(data.newPassword, 12)

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                password: hashedPassword,
                updatedAt: new Date()
            }
        })

        revalidatePath('/manage-account')
        return { success: true }
    } catch (error) {
        console.error('Password update error:', error)
        return {
            success: false,
            error: "An unexpected error occurred"
        }
    }
}