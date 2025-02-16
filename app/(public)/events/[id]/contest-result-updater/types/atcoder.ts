export interface AtcoderContest {
    id: string;
    start_epoch_second: number;
    duration_second: number;
    title: string;
    rate_change: string;
}

export interface AtcoderSubmission {
    id: number;
    epoch_second: number;
    problem_id: string;
    contest_id: string;
    user_id: string;
    result: "AC" | string;
}

export interface ProcessedUserResult {
    username: string;
    atcoderHandle: string | null;
    solveCount: number;
    upsolveCount: number;
    isPresent: boolean;
    error?: string;
}

export interface AtcoderUpdateProgress {
    type: 'progress';
    userResults: ProcessedUserResult[];
    currentUser?: string;
    totalUsers: number;
    processedUsers: number;
}

export interface AtcoderUpdateComplete {
    type: 'complete';
    totalStats: {
        totalUsers: number;
        presentUsers: number;
        totalSolved: number;
        totalUpsolved: number;
    };
}

export interface AtcoderUpdateError {
    type: 'error';
    error: string;
}

export type AtcoderUpdateEvent = 
    | AtcoderUpdateProgress 
    | AtcoderUpdateComplete 
    | AtcoderUpdateError;

export interface UpdateResultsResponse {
    success: boolean;
    error?: string;
}
