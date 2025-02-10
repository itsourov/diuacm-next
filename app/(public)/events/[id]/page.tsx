import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import EventHeroSection from "./components/EventHeroSection";
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

function calculateInitialTimeLeft(startTime: Date, endTime: Date) {
  const now = new Date();
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

  // Get attendance status
  const hasAttendance = session?.user
      ? event.eventUsers.some((eu) => eu.user.id === session?.user?.id)
      : false;

  // Get user's solve stats
  const userSolveStat = session?.user
      ? event.solveStats.find((ss) => ss.user.id === session?.user?.id)
      : null;

  // Calculate initial time values for hydration
  const initialTime = "2025-02-10 20:56:20"; // Exact format as specified

  const { timeLeft: initialTimeLeft, status: initialStatus } = calculateInitialTimeLeft(
      new Date(event.startingAt),
      new Date(event.endingAt)
  );

  // Format event dates
  const formattedStartDate = new Date(event.startingAt)
      .toISOString()
      .replace('T', ' ')
      .split('.')[0];

  const formattedEndDate = new Date(event.endingAt)
      .toISOString()
      .replace('T', ' ')
      .split('.')[0];

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Status Bar */}
        <StatusBar
            initialTime={initialTime}
            username={session?.user?.name || 'itsourov'}
        />

        {/* Hero Section */}
        <EventHeroSection
            event={{
              ...event,
              startingAt: formattedStartDate,
              endingAt: formattedEndDate,
            }}
            attendeeCount={event.eventUsers.length}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Countdown Section - Only show if event hasn't ended */}
            {new Date() < new Date(event.endingAt) && (
                <EventCountdown
                    startTime={formattedStartDate}
                    endTime={formattedEndDate}
                    initialTimeLeft={initialTimeLeft}
                    initialStatus={initialStatus}
                />
            )}

            {/* Tabs Section */}
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
  );
}