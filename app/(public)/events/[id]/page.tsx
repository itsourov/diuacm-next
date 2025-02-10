import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import EventHeroSection from "./components/EventHeroSection";
import EventCountdown from "./components/EventCountdown";
import EventTabs from "./components/EventTabs";
import { Metadata } from "next";
import { DateTime } from "@/lib/utils/datetime";
import { Event, SolveStat } from "@prisma/client";

interface EventPageProps {
  params: { id: string };
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

// Define a type for our current user
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

  // Create a properly typed current user object, ensuring both id and name exist
  const currentUser: CurrentUser | null =
    session?.user?.id && session.user.name
      ? {
        id: session.user.id,
        name: session.user.name,
      }
      : null;

  // Get attendance status
  const hasAttendance = currentUser
    ? event.eventUsers.some((eu) => eu.user.id === currentUser.id)
    : false;

  // Get user's solve stats with proper typing
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