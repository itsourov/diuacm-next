"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function giveAttendance(eventId: string, password: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "You must be logged in" };
    }

    const event = await prisma.event.findUnique({
      where: { id: BigInt(eventId) },
    });

    if (!event) {
      return { success: false, message: "Event not found" };
    }

    // Verify event password
    if (event.eventPassword !== password) {
      return { success: false, message: "Invalid event password" };
    }

    // Check if attendance is open
    if (!event.openForAttendance) {
      return { success: false, message: "Attendance is not open for this event" };
    }

    // Check attendance time window
    const now = new Date();
    const attendanceStartTime = new Date(event.startingAt);
    const attendanceEndTime = new Date(event.endingAt);
    attendanceStartTime.setMinutes(attendanceStartTime.getMinutes() - 15);
    attendanceEndTime.setMinutes(attendanceEndTime.getMinutes() + 15);

    if (now < attendanceStartTime || now > attendanceEndTime) {
      return {
        success: false,
        message: "Attendance can only be given during the event time window",
      };
    }

    // Check if user has already given attendance
    const existingAttendance = await prisma.eventUser.findFirst({
      where: {
        eventId: BigInt(eventId),
        userId: session.user.id,
      },
    });

    if (existingAttendance) {
      return {
        success: false,
        message: "You have already given attendance for this event",
      };
    }

    // Create attendance record
    await prisma.eventUser.create({
      data: {
        eventId: BigInt(eventId),
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error giving attendance:", error);
    return { success: false, message: "Something went wrong" };
  }
}