export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  school: string;
  city: string;
  phoneNumber: string;
  imageUrl: string;
  personalDescription: string;
  portfolioLink: string;
  linkedin: string;
  goal: string;
  contractSought: string[];
  locationSought: string[];
  sector: string[];
  resume: string;
}

export interface ConnectedService {
  id: string;
  name: string;
}

export interface UserStats {
  id: string,
  username: string,
  email: string,
  firstName: string,
  lastName: string,
  avatar: string,
  totalApplications: number,
  acceptedApplications: number,
  pendingApplications: number,
  rejectedApplications: number,
}

export interface UserRankingInfo {
  rank: number;
  totalUsers: number;
}

export interface User {
  id: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  totalApplications: number;
  rank: number;
  page?: number;
}