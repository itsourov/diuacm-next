'use server';

import { prisma } from "@/lib/prisma";

export async function getTrackers() {
  try {
    const trackers = await prisma.tracker.findMany({
      where: {
        status: 'published'
      },
      include: {
        rankLists: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { trackers };
  } catch (error) {
    console.error('Error fetching trackers:', error);
    return { error: 'Failed to load trackers' };
  }
}