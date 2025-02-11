// app/(public)/events/[id]/contest-result-updater/types/vjudge.ts

export type ParticipantInfo = [string, string, string?]; // [username, nickname (can be empty), avatarUrl (optional)]
export type Submission = [number, number, number, number]; // [participantId, problemIndex, isAccepted, timestamp]

export interface VjudgeContestData {
    id?: number;
    title?: string;
    begin?: number;
    length: number;
    isReplay?: boolean;
    participants: Record<string, ParticipantInfo>;
    submissions?: Submission[];
}

export interface UserStats {
    solveCount: number;
    upSolveCount: number;
    absent: boolean;
    solved: Record<number, number>;
}

export interface ProcessedContestData {
    [username: string]: UserStats;
}

export interface UpdateResultsResponse {
    success: boolean;
    error?: string;
    data?: ProcessedContestData;
}

export interface ValidateSessionResponse {
    success: boolean;
    username?: string;
    error?: string;
}

export interface UpdateVjudgeResultsParams {
    eventId: bigint;
    contestId: string;
    sessionId?: string;
}