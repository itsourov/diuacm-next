export type UserRole = 'ALL' | 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface UsersSearchParams {
    query?: string | null;
    role?: UserRole | null;
    department?: string | null;
    page?: number;
}

export interface UserListItem {
    id: string;
    name: string;
    email: string;
    username: string;
    image: string | null;
    department: string | null;
    studentId: string | null;
    maxCfRating: number | null;
    codeforcesHandle: string | null;
}
