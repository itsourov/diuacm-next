import { Tracker, RankList } from "@prisma/client";

export interface TrackerWithRankLists extends Tracker {
  rankLists: RankList[];
}