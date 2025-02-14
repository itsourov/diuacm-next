"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { passwordSchema } from "../validations/password-schema"
import crypto from 'crypto';
import { z } from "zod"
import { revalidatePath } from "next/cache"

export type PasswordUpdateResponse = {
    success: boolean
    error?: string
}

// Function to generate Laravel compatible bcrypt hash
async function generateLaravelCompatibleHash(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // Generate a random salt (22 characters)
        const salt = crypto.randomBytes(16).toString('base64').slice(0, 22);

        // Format the salt with Laravel's preferred prefix ($2y$12$)
        const formattedSalt = `$2y$12$${salt}`;

        import('bcryptjs').then(async ({ hash }) => {
            try {
                // Use the formatted salt to generate the hash
                const hashedPassword = await hash(password, formattedSalt);
                resolve(hashedPassword);
            } catch (error) {
                reject(error);
            }
        });
    });
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

        const hashedPassword = await generateLaravelCompatibleHash(data.newPassword)

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