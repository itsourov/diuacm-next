"use server"

import { z } from "zod"
import { profileSchema } from './validations'
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { s3Service, getKeyFromUrl, MAX_FILE_SIZE_MB } from "@/lib/s3"

export type FieldErrors = {
    name?: string;
    email?: string;
    username?: string;
    phone?: string;
    gender?: string;
    image?: string;
    codeforcesHandle?: string;
    atcoderHandle?: string;
    vjudgeHandle?: string;
    startingSemester?: string;
    department?: string;
    studentId?: string;
};

export type ActionResponse<T> = {
    success: boolean;
    user?: T;
    error?: string;
    errors?: FieldErrors;
};

export async function updateProfileImage(
    imageData: string
): Promise<ActionResponse<{ imageUrl: string }>> {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return {
                success: false,
                error: "Unauthorized"
            };
        }

        const buffer = Buffer.from(
            imageData.replace(/^data:image\/\w+;base64,/, ''),
            'base64'
        );

        // Check file size
        const fileSizeInMB = buffer.length / (1024 * 1024);
        if (fileSizeInMB > MAX_FILE_SIZE_MB) {
            return {
                success: false,
                error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`
            };
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { image: true }
        });

        // Delete old image if exists
        if (currentUser?.image) {
            try {
                const key = getKeyFromUrl(currentUser.image);
                if (key) {
                    // Check if file exists before attempting to delete
                    const fileExists = await s3Service.fileExists(key);
                    if (fileExists) {
                        await s3Service.deleteFile(key);
                        console.log('Successfully deleted old image:', key);
                    } else {
                        console.log('Old image not found:', key);
                    }
                }
            } catch (error) {
                // Log error but continue with upload
                console.error('Error deleting old image:', error);
            }
        }

        // Update the folder path to include user ID
        const userProfileFolder = `profile-images/${userId}`;

        // Upload new image
        const { url } = await s3Service.uploadFile(
            buffer,
            `profile.jpg`, // Simplified filename since it's in a user-specific directory
            'image/jpeg',
            {
                folder: userProfileFolder,
                maxSizeMB: MAX_FILE_SIZE_MB,
                generateUniqueFilename: true,
                allowedFileTypes: ['image/jpeg', 'image/png'],
                metadata: {
                    uploadedBy: userId,
                    uploadedAt: new Date().toISOString(),
                }
            }
        );

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                image: url,
                updatedAt: new Date(),
            },
        });

        revalidatePath('/manage-account');

        return {
            success: true,
            user: {
                imageUrl: user.image || '' // Handle potential undefined with fallback
            }
        };

    } catch (error) {
        console.error('Image upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to upload image"
        };
    }
}

export async function updateProfile(formData: z.infer<typeof profileSchema>) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return {
                success: false,
                error: "Unauthorized"
            };
        }

        const validatedData = profileSchema.parse(formData);

        const errors: FieldErrors = {};

        const existingUserByEmail = await prisma.user.findFirst({
            where: {
                email: validatedData.email,
                NOT: {
                    id: userId
                }
            }
        });

        if (existingUserByEmail) {
            errors.email = "Email already taken";
        }

        const existingUserByUsername = await prisma.user.findFirst({
            where: {
                username: validatedData.username,
                NOT: {
                    id: userId
                }
            }
        });

        if (existingUserByUsername) {
            errors.username = "Username already taken";
        }

        if (Object.keys(errors).length > 0) {
            return {
                errors,
                success: false
            };
        }

        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                name: validatedData.name,
                email: validatedData.email,
                username: validatedData.username.toLowerCase(),
                phone: validatedData.phone ?? null, // Handle potential undefined
                gender: validatedData.gender ?? null, // Handle potential undefined
                codeforcesHandle: validatedData.codeforcesHandle ?? null,
                atcoderHandle: validatedData.atcoderHandle ?? null,
                vjudgeHandle: validatedData.vjudgeHandle ?? null,
                startingSemester: validatedData.startingSemester ?? null,
                department: validatedData.department ?? null,
                studentId: validatedData.studentId ?? null,
                updatedAt: new Date(),
            },
        });

        revalidatePath('/manage-account');

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name || '',
                email: user.email || '',
                username: user.username || '',
                phone: user.phone || '',
                gender: user.gender || '',
                codeforcesHandle: user.codeforcesHandle || '',
                atcoderHandle: user.atcoderHandle || '',
                vjudgeHandle: user.vjudgeHandle || '',
                startingSemester: user.startingSemester || '',
                department: user.department || '',
                studentId: user.studentId || ''
            }
        };

    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.errors[0].message
            };
        }

        return {
            success: false,
            error: "An unexpected error occurred"
        };
    }
}