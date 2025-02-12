export interface ContestProblem {
    contestId: number;
    index: string;
    name: string;
    type: string;
    points: number;
    tags: string[];
}

export interface ContestMember {
    handle: string;
}

export interface ContestParty {
    contestId: number;
    members: ContestMember[];
    participantType: "CONTESTANT" | "PRACTICE";
    ghost: boolean;
    startTimeSeconds: number;
}

export interface ProblemResult {
    points: number;
    rejectedAttemptCount: number;
    type: "FINAL";
    bestSubmissionTimeSeconds?: number;
}

export interface ContestRow {
    party: ContestParty;
    rank: number;
    points: number;
    penalty: number;
    successfulHackCount: number;
    unsuccessfulHackCount: number;
    problemResults: ProblemResult[];
}

export interface CodeforcesContest {
    id: number;
    name: string;
    type: string;
    phase: string;
    frozen: boolean;
    durationSeconds: number;
    startTimeSeconds: number;
    relativeTimeSeconds: number;
}

export interface CodeforcesStandingsResponse {
    status: "OK" | "FAILED";
    result?: {
        contest: CodeforcesContest;
        problems: ContestProblem[];
        rows: ContestRow[];
    };
    comment?: string;
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
