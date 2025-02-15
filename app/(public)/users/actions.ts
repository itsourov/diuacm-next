'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { UsersSearchParams } from './types';
import { unstable_cache } from 'next/cache';

export const getUsers = unstable_cache(
    async (params: UsersSearchParams) => {
        const page = params.page || 1;
        const perPage = 12;

        const where: Prisma.UserWhereInput = {
            AND: [
                params.query ? {
                    OR: [
                        { name: { contains: params.query.toLowerCase() } },
                        { email: { contains: params.query.toLowerCase() } },
                        { username: { contains: params.query.toLowerCase() } },
                        { codeforcesHandle: { contains: params.query.toLowerCase() } }
                    ]
                } : {},
                params.department ? {
                    department: params.department
                } : {}
            ]
        };

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: [
                    { maxCfRating: 'desc' },
                    { name: 'asc' }
                ],
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    image: true,
                    department: true,
                    studentId: true,
                    maxCfRating: true,
                    codeforcesHandle: true
                },
                skip: (page - 1) * perPage,
                take: perPage,
            }),
            prisma.user.count({ where })
        ]);

        return {
            users,
            totalPages: Math.ceil(totalCount / perPage),
            currentPage: page
        };
    },
    [],
    {
        revalidate: 60,
        tags: ['users']
    }
);
