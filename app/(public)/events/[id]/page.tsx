import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DateTime } from "@/lib/utils/datetime";
import EventDetailsHeader from "./components/EventDetailsHeader";
import EventCountdown from "./components/EventCountdown";
import EventTabs from "./components/EventTabs";
import StatusBar from "./components/StatusBar";
import { Metadata } from "next";

interface EventPageProps {
  params: { id: string };
}

async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id: BigInt(id) },
    include: {
      eventUsers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },
      solveStats: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!event) notFound();
  return event;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const event = await getEvent(params.id);

  return {
    title: event.title,
    description: event.description || `Event details for ${event.title}`,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const [event, session] = await Promise.all([
    getEvent(params.id),
    auth(),
  ]);

  // Get attendance status
  const hasAttendance = session?.user
    ? event.eventUsers.some((eu) => eu.userId === session.user.id)
    : false;

  // Get user's solve stats
  const userSolveStat = session?.user
    ? event.solveStats.find((ss) => ss.userId === session.user.id)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Status Bar */}
          <StatusBar username={session?.user?.name || 'Guest'} />

          {/* Event Details */}
          <div className="grid gap-6">
            <EventDetailsHeader event={event} />
            
            {/* Only show countdown if event hasn't ended */}
            {new Date() < new Date(event.endingAt) && (
              <EventCountdown
                startTime={event.startingAt}
                endTime={event.endingAt}
              />
            )}

            {/* Tabs for Attendance and Solve Stats */}
            <EventTabs
              event={event}
              hasAttendance={hasAttendance}
              currentUser={session?.user}
              currentUserName={session?.user?.name}
              userSolveStat={userSolveStat}
              defaultTab={event.openForAttendance ? "attendance" : "solve-stats"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}