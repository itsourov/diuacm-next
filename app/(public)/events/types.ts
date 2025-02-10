// app/events/types.ts
export type EventType = 'ALL' | 'CONTEST' | 'CLASS' | 'OTHER';

export interface EventsSearchParams {
    query?: string | null;
    type?: EventType | null;
    startDate?: string | null;
    endDate?: string | null;
    page?: number;
}