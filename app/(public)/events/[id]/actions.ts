// app/(public)/events/[id]/actions.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DateTime } from "@/lib/utils/datetime";
import { revalidatePath } from "next/cache";

interface AttendanceResponse {
  success: boolean;
  message?: string;
}

export async function giveAttendance(eventId: string, password: string): Promise<AttendanceResponse> {
  try {
    const session = await auth();

    // Early return if no session or user
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in"
      };
    }

    const userId = session.user.id;

    const event = await prisma.event.findUnique({
      where: { id: BigInt(eventId) },
    });

    if (!event) {
      return {
        success: false,
        message: "Event not found"
      };
    }

    // Verify event password
    if (event.eventPassword !== password) {
      return {
        success: false,
        message: "Invalid event password"
      };
    }

    // Check if attendance is open
    if (!event.openForAttendance) {
      return {
        success: false,
        message: "Attendance is not open for this event"
      };
    }

    // Check attendance time window
    const now = DateTime.getCurrentUTCTime();
    const attendanceStartTime = new Date(event.startingAt);
    const attendanceEndTime = new Date(event.endingAt);
    attendanceStartTime.setMinutes(attendanceStartTime.getMinutes() - 15);
    attendanceEndTime.setMinutes(attendanceEndTime.getMinutes() + 15);

    if (now < attendanceStartTime || now > attendanceEndTime) {
      return {
        success: false,
        message: `Attendance can only be given from ${DateTime.formatDisplay(attendanceStartTime)} to ${DateTime.formatDisplay(attendanceEndTime)}`,
      };
    }

    // Check if user has already given attendance
    const existingAttendance = await prisma.eventUser.findFirst({
      where: {
        eventId: BigInt(eventId),
        userId: userId,
      },
    });

    if (existingAttendance) {
      return {
        success: false,
        message: "You have already given attendance for this event",
      };
    }

    // Create attendance record with the guaranteed non-null userId
    await prisma.eventUser.create({
      data: {
        eventId: BigInt(eventId),
        userId: userId, // Now TypeScript knows this is a string
      },
    });



    // Revalidate the event page to show updated attendance
    revalidatePath(`/events/${eventId}`);

    return {
      success: true,
      message: "Attendance recorded successfully"
    };
  } catch (error) {
    console.error("Error giving attendance:", error);
    return {
      success: false,
      message: "An unexpected error occurred"
    };
  }
}