// app/(public)/events/actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { EventType, Prisma } from '@prisma/client';
import { EventsSearchParams } from './types';
import { unstable_cache } from 'next/cache';

export const getEvents = unstable_cache(
    async (params: EventsSearchParams) => {
        const page = params.page || 1;
        const perPage = 10;

        const where: Prisma.EventWhereInput = {
            AND: [
                params.query ? {
                    OR: [
                        {
                            title: {
                                contains: params.query.toLowerCase()
                            }
                        },
                        {
                            description: {
                                contains: params.query.toLowerCase()
                            }
                        }
                    ]
                } : {},
                params.type && params.type !== 'ALL' ? {
                    type: params.type.toLowerCase() as EventType
                } : {},
                params.startDate && params.endDate ? {
                    startingAt: {
                        gte: new Date(params.startDate),
                        lte: new Date(params.endDate)
                    }
                } : {}
            ]
        };

        const [events, totalCount] = await Promise.all([
            prisma.event.findMany({
                where,
                orderBy: {
                    startingAt: 'desc'
                },
                skip: (page - 1) * perPage,
                take: perPage,
            }),
            prisma.event.count({ where })
        ]);

        // Convert BigInt to number in the events array
        const serializedEvents = events.map(event => ({
            ...event,
            id: Number(event.id)
        }));

        return {
            events: serializedEvents,
            totalPages: Math.ceil(totalCount / perPage),
            currentPage: page
        };
    },
    [],
    {
        revalidate: 60, // Cache for 60 seconds
        tags: ['events']
    }
);