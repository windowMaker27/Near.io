export type UserRole = 'user' | 'admin';

export type UserProfile = {
  id: string;
  username: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
};

export type PlaceLog = {
  id: string;
  placeId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
};
