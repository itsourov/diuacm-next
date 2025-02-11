// app/(public)/events/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import EventHeroSection from "./components/EventHeroSection";
import EventCountdown from "./components/EventCountdown";
import EventTabs from "./components/EventTabs";
import { Metadata } from "next";
import { DateTime } from "@/lib/utils/datetime";
import { Event, SolveStat } from "@prisma/client";
import { VjudgeResultsDialog } from "./contest-result-updater/vjudge";

interface EventPageProps {
  params: Promise<{ id: string }>;  // Changed to Promise
}

interface User {
  id: string;
  name: string;
  username: string;
  image: string | null;
}

interface EventUser {
  user: User;
}

interface SolveStatWithUser extends SolveStat {
  user: User;
}

interface EventWithRelations extends Event {
  eventUsers: EventUser[];
  solveStats: SolveStatWithUser[];
}

interface CurrentUser {
  id: string;
  name: string;
}

async function getEvent(id: string): Promise<EventWithRelations> {
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

function calculateInitialTimeLeft(startTime: Date, endTime: Date) {
  const now = DateTime.getCurrentUTCTime();
  let targetDate: Date;
  let status: "upcoming" | "running" | "ended";

  if (now < startTime) {
    targetDate = startTime;
    status = "upcoming";
  } else if (now < endTime) {
    targetDate = endTime;
    status = "running";
  } else {
    return { timeLeft: null, status: "ended" as const };
  }

  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return { timeLeft: null, status };
  }

  return {
    timeLeft: {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    },
    status
  };
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const resolvedParams = await params;  // Await params here
  const event = await getEvent(resolvedParams.id);

  return {
    title: event.title,
    description: event.description || `Event details for ${event.title}`,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const resolvedParams = await params;  // Await params here
  const [event, session] = await Promise.all([
    getEvent(resolvedParams.id),
    auth(),
  ]);

  const currentUser: CurrentUser | null =
    session?.user?.id && session.user.name
      ? {
        id: session.user.id,
        name: session.user.name,
      }
      : null;

  const hasAttendance = currentUser
    ? event.eventUsers.some((eu) => eu.user.id === currentUser.id)
    : false;

  const userSolveStat = currentUser
    ? event.solveStats.find((ss) => ss.user.id === currentUser.id) || null
    : null;

  const { timeLeft: initialTimeLeft, status: initialStatus } = calculateInitialTimeLeft(
    new Date(event.startingAt),
    new Date(event.endingAt)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <EventHeroSection
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          type: event.type,
          startingAt: new Date(event.startingAt),
          endingAt: new Date(event.endingAt),
        }}
        attendeeCount={event.eventUsers.length}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Added: Action buttons section */}
          <div className="flex justify-end gap-4">
            {event.type === 'contest' && event.eventLink?.includes('vjudge.net') && (
              <VjudgeResultsDialog
                eventId={event.id}
                contestId={getVjudgeContestId(event.eventLink)}
                currentUser={session?.user?.name}
              />
            )}
          </div>

          {/* Countdown Section - Only show if event hasn't ended */}
          {DateTime.getCurrentUTCTime() < new Date(event.endingAt) && (
            <EventCountdown
              startTime={event.startingAt.toISOString()}
              endTime={event.endingAt.toISOString()}
              initialTimeLeft={initialTimeLeft}
              initialStatus={initialStatus}
            />
          )}

          {/* Tabs Section */}
          <EventTabs
            event={event}
            hasAttendance={hasAttendance}
            currentUser={currentUser}
            currentUserName={currentUser?.name}
            userSolveStat={userSolveStat}
            defaultTab={event.openForAttendance ? "attendance" : "solve-stats"}
          />
        </div>
      </div>
    </div>
  );
}

function getVjudgeContestId(url: string): string {
  const match = url.match(/contest\/(\d+)/);
  return match ? match[1] : "";
}