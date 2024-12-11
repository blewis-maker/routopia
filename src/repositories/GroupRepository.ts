import { prisma } from '@/lib/prisma';
import { GroupTrip, GroupMember } from '@/types/groups';
import { GroupCache } from '@/services/cache/GroupCache';

export class GroupRepository {
  private cache: GroupCache;

  constructor() {
    this.cache = new GroupCache();
  }

  async createGroup(data: Omit<GroupTrip, 'id' | 'metadata'>): Promise<GroupTrip> {
    const group = await prisma.group.create({
      data: {
        ...data,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      include: {
        members: true
      }
    });

    await this.cache.set(group.id, group);
    return group;
  }

  async addMember(groupId: string, member: Omit<GroupMember, 'id' | 'groupId'>): Promise<GroupMember> {
    const newMember = await prisma.groupMember.create({
      data: {
        ...member,
        groupId
      }
    });

    await this.cache.invalidateGroup(groupId);
    return newMember;
  }

  async updateMemberRole(groupId: string, userId: string, role: GroupMember['role']): Promise<void> {
    await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      },
      data: { role }
    });

    await this.cache.invalidateGroup(groupId);
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    await this.cache.invalidateGroup(groupId);
  }

  async getGroupTrips(userId: string): Promise<GroupTrip[]> {
    const cached = await this.cache.getUserGroups(userId);
    if (cached) return cached;

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: true
      }
    });

    await Promise.all(
      groups.map(group => this.cache.set(group.id, group))
    );

    return groups;
  }
} 