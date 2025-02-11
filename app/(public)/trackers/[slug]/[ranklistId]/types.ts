import { Event, RankList, RankListUser, SolveStat, Tracker, User } from "@prisma/client";

export interface UserWithProfile extends User {
  maxCfRating: number | null;
  codeforcesHandle: string | null;
}

export interface RankListUserWithProfile extends RankListUser {
  user: UserWithProfile;
}

export interface EventWithSolveStats extends Event {
  solveStats: SolveStat[];
}

export interface RankListWithUsers extends RankList {
  rankListUsers: RankListUserWithProfile[];
  eventRankLists: {
    event: Event;
    weight: number;
  }[];
}

export interface TrackerWithRankLists extends Tracker {
  rankLists: RankList[];
}

export interface SolveStatWithEvent extends SolveStat {
  event: Event;
}