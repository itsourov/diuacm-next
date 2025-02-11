"use server"

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/schemas/register";
import crypto from 'crypto';

export type FieldErrors = {
    email?: string;
    username?: string;
};

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

export async function registerUser(formData: z.infer<typeof registerSchema>) {
    try {
        // Validate form data
        const validatedData = registerSchema.parse(formData);

        const errors: FieldErrors = {};

        // Check if email already exists
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (existingUserByEmail) {
            errors.email = "Email already registered";
        }

        // Check if username already exists
        const existingUserByUsername = await prisma.user.findUnique({
            where: { username: validatedData.username }
        });

        if (existingUserByUsername) {
            errors.username = "Username already taken";
        }

        // If there are any errors, return them
        if (Object.keys(errors).length > 0) {
            return {
                errors,
                success: false
            };
        }

        // Generate Laravel compatible hash
        const hashedPassword = await generateLaravelCompatibleHash(validatedData.password);

        // For debugging (remove in production)
        console.log('Generated hash:', hashedPassword);

        // Create user
        const user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                username: validatedData.username.toLowerCase(),
                password: hashedPassword,
            },
        });

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username
            }
        };

    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.errors[0].message
            };
        }

        console.error('Registration error:', error);
        return {
            success: false,
            error: "An unexpected error occurred"
        };
    }
}