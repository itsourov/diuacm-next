'use server';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';

export const getUser = unstable_cache(
    async (username: string) => {
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                image: true,
                gender: true,
                department: true,
                studentId: true,
                codeforcesHandle: true,
                atcoderHandle: true,
                vjudgeHandle: true,
                maxCfRating: true,
                startingSemester: true,
                createdAt: true,
            }
        });

        if (!user) {
            notFound();
        }

        return user;
    },
    [],
    {
        revalidate: 60,
        tags: ['users']
    }
);
