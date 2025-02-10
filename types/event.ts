import { Event, EventUser, SolveStat, User } from "@prisma/client";

export type EventWithRelations = Event & {
  eventUsers: Array<EventUser & {
    user: Pick<User, "id" | "name" | "username" | "image">;
  }>;
  solveStats: Array<
    SolveStat & {
      user: Pick<User, "id" | "name" | "username" | "image">;
    }
  >;
};

export type EventStatus = "upcoming" | "running" | "ended";

export type AttendanceStatus = {
  canGiveAttendance: boolean;
  hasAttendance: boolean;
  message?: string;
};