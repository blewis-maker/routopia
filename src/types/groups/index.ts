import { UserProfile } from '../user';

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  preferences?: {
    notifications: boolean;
    shareLocation: boolean;
  };
}

export interface GroupTrip {
  id: string;
  groupId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  route?: {
    routeId: string;
    version: number;
  };
  members: GroupMember[];
  preferences: {
    visibility: 'public' | 'private' | 'members';
    joinPolicy: 'open' | 'approval' | 'invite';
    maxMembers?: number;
    requireLocation: boolean;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    lastActivity?: Date;
  };
} 