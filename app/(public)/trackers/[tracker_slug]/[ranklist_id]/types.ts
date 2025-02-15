import { Event, RankList, Tracker, EventRankList, RankListUser, SolveStat } from "@prisma/client";

export interface User {
  id: string;
  name: string;
  username: string;
  image: string | null;
}

export interface CurrentUser {
  id: string;
  name: string;
}

export interface TrackerWithRelations extends Tracker {
  rankLists: Array<RankList & {
    eventRankLists: Array<EventRankList & {
      event: Event;
    }>;
  }>;
}

export interface RankListWithRelations extends RankList {
  eventRankLists: Array<EventRankList & {
    event: Event;
  }>;
}

export interface RankListUserWithRelations extends RankListUser {
  user: User;
  solveStats?: Array<SolveStat & {
    event: Event;
  }>;
}

export interface SolveStatWithEvent extends SolveStat {
  event: Event;
}

export interface SolveStatWithPoints extends SolveStat {
  event: Event;
  eventWeight: number;
  points: {
    contestPoints: number;
    upsolvePoints: number;
    totalPoints: number;
  };
}

export interface UserStatsWithPoints {
  solveStats: SolveStatWithPoints[];
  totalStats: {
    totalEvents: number;
    totalSolves: number;
    totalUpsolves: number;
    totalPoints: number;
  };
}

