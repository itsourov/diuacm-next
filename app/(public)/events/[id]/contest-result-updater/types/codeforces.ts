interface CfProblem {
    contestId: number;
    index: string;
    name: string;
    type: string;
    points: number;
    rating: number;
    tags: string[];
}

interface CfContest {
    id: number;
    name: string;
    type: string;
    phase: string;
    frozen: boolean;
    durationSeconds: number;
    startTimeSeconds: number;
    relativeTimeSeconds: number;
}

interface CfPartyMember {
    handle: string;
}

interface CfParty {
    participantType: "CONTESTANT" | "PRACTICE" | string;
    members: CfPartyMember[];
}

interface CfProblemResult {
    points: number;
}

interface CfRanklistRow {
    party: CfParty;
    problemResults: CfProblemResult[];
}

export interface BaseCodeforcesResponse {
    status: "OK" | "FAILED";
    comment?: string;
}

export interface CodeforcesStandingsResponse extends BaseCodeforcesResponse {
    result?: {
        contest: CfContest;
        problems: CfProblem[];
        rows: CfRanklistRow[];
    };
}

export interface ProcessedResult {
    solveCount: number;
    upsolveCount: number;
    absent: boolean;
    error?: string;
}

export interface UpdateResultsResponse {
    success: boolean;
    error?: string;
    data?: Record<string, ProcessedResult>;
}
