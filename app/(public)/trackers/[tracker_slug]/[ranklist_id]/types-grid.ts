import { Event, RankListUser } from "@prisma/client";
import { User } from "./types";

export interface GridData {
  events: Array<Event & { weight: number }>;
  users: Array<RankListUser & {
    user: User;
    solveStats: Array<{
      eventId: bigint;
      solveCount: bigint;
      upsolveCount: bigint;
      isPresent: boolean;
    }>;
  }>;
}

export interface UserSolveData {
  solveCount: number;
  upsolveCount: number;
  points: number;
}

export interface GridViewData extends GridData {
  weightOfUpsolve: number;
}

export interface SolveStat {
  userId: string;
  eventId: bigint;
  solveCount: bigint;
  upsolveCount: bigint;
  isPresent: boolean;
}
