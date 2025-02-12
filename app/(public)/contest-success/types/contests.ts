export interface TeamMember {
  name: string;
  studentId: string;
  image?: string;
}

export interface Team {
  name: string;
  rank: number;
  members: TeamMember[];
}

export interface Contest {
  title: string;
  date: string;
  ranklistLink: string;
  venue: string;
  teams: Team[];
  images: string[];
}

export interface Semester {
  name: string;
  period: string;
  contests: Contest[];
}

export interface ContestHistory {
  semesters: Semester[];
}