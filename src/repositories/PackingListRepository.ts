import { prisma } from '@/lib/prisma';
import { PackingListCache } from '@/services/cache/PackingListCache';
import { PackingList, PackingCategory, PackingItem } from '@/types/packing';
import { 
  PackingListError, 
  PackingListNotFoundError,
  PackingListValidationError,
  PackingListPermissionError 
} from '@/lib/utils/errors/packingListErrors';
import { validatePackingList, validatePackingItem } from '@/lib/utils/validation/packingList';

export class PackingListRepository {
  private cache: PackingListCache;

  constructor() {
    this.cache = new PackingListCache();
  }

  async createPackingList(data: {
    name: string;
    description?: string;
    userId: string;
    isTemplate?: boolean;
    categories: Array<{
      name: string;
      description?: string;
      items: Array<{
        name: string;
        quantity?: number;
        isRequired?: boolean;
        notes?: string;
      }>;
    }>;
  }): Promise<PackingList> {
    try {
      // Validate input
      if (!data.name?.trim()) {
        throw new PackingListValidationError('Name is required');
      }

      if (!data.categories?.length) {
        throw new PackingListValidationError('At least one category is required');
      }

      const list = await prisma.packingList.create({
        data: {
          name: data.name,
          description: data.description,
          userId: data.userId,
          isTemplate: data.isTemplate || false,
          categories: {
            create: data.categories.map((cat, idx) => {
              if (!cat.name?.trim()) {
                throw new PackingListValidationError(`Category name is required at index ${idx}`);
              }
              return {
                name: cat.name,
                description: cat.description,
                order: idx,
                items: {
                  create: cat.items.map((item, itemIdx) => {
                    if (!item.name?.trim()) {
                      throw new PackingListValidationError(
                        `Item name is required in category ${cat.name} at index ${itemIdx}`
                      );
                    }
                    return {
                      name: item.name,
                      quantity: item.quantity || 1,
                      isRequired: item.isRequired || false,
                      notes: item.notes
                    };
                  })
                }
              };
            })
          }
        },
        include: {
          categories: {
            include: {
              items: true
            }
          }
        }
      });

      await this.cache.set(list.id, list);
      return list;
    } catch (error) {
      if (error instanceof PackingListError) throw error;
      throw new PackingListError(`Failed to create packing list: ${error.message}`);
    }
  }

  async getPackingList(id: string): Promise<PackingList | null> {
    const cached = await this.cache.get(id);
    if (cached) return cached;

    const list = await prisma.packingList.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            items: true
          }
        }
      }
    });

    if (list) {
      await this.cache.set(list.id, list);
    }

    return list;
  }

  async updatePackingList(id: string, data: Partial<PackingList>): Promise<PackingList> {
    const updated = await prisma.packingList.update({
      where: { id },
      data: {
        ...data,
        version: { increment: 1 }
      },
      include: {
        categories: {
          include: {
            items: true
          }
        }
      }
    });

    await this.cache.set(updated.id, updated);
    return updated;
  }

  async createFromTemplate(templateId: string, userId: string, name?: string): Promise<PackingList> {
    const template = await this.getPackingList(templateId);
    if (!template || !template.isTemplate) {
      throw new Error('Template not found');
    }

    const list = await prisma.packingList.create({
      data: {
        name: name || `${template.name} Copy`,
        description: template.description,
        userId,
        isTemplate: false,
        categories: {
          create: template.categories.map(cat => ({
            name: cat.name,
            description: cat.description,
            order: cat.order,
            items: {
              create: cat.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                isRequired: item.isRequired,
                notes: item.notes
              }))
            }
          }))
        }
      },
      include: {
        categories: {
          include: {
            items: true
          }
        }
      }
    });

    await this.cache.set(list.id, list);
    return list;
  }

  async getTemplates(): Promise<PackingList[]> {
    const templates = await prisma.packingList.findMany({
      where: {
        isTemplate: true
      },
      include: {
        categories: {
          include: {
            items: true
          }
        }
      }
    });

    return templates;
  }

  async shareList(listId: string, targetUserId: string, currentUserId: string): Promise<PackingList> {
    try {
      const list = await this.getPackingList(listId);
      if (!list) {
        throw new PackingListNotFoundError(listId);
      }

      // Check permissions
      if (list.userId !== currentUserId) {
        throw new PackingListPermissionError('Only the owner can share this list');
      }

      const sharedList = await prisma.packingList.create({
        data: {
          name: `${list.name} (Shared)`,
          description: list.description,
          userId: targetUserId,
          isTemplate: false,
          categories: {
            create: list.categories.map(cat => ({
              name: cat.name,
              description: cat.description,
              order: cat.order,
              items: {
                create: cat.items.map(item => ({
                  name: item.name,
                  quantity: item.quantity,
                  isRequired: item.isRequired,
                  notes: item.notes
                }))
              }
            }))
          }
        },
        include: {
          categories: {
            include: {
              items: true
            }
          }
        }
      });

      await this.cache.set(sharedList.id, sharedList);
      return sharedList;
    } catch (error) {
      if (error instanceof PackingListError) throw error;
      throw new PackingListError(`Failed to share packing list: ${error.message}`);
    }
  }

  async getSharedLists(userId: string): Promise<PackingList[]> {
    const lists = await prisma.packingList.findMany({
      where: {
        userId,
        isTemplate: false
      },
      include: {
        categories: {
          include: {
            items: true
          }
        }
      }
    });

    return lists;
  }

  async batchUpdateItems(
    listId: string, 
    updates: Array<{ id: string; isPacked: boolean }>,
    userId: string
  ): Promise<void> {
    try {
      const list = await this.getPackingList(listId);
      if (!list) {
        throw new PackingListNotFoundError(listId);
      }

      if (list.userId !== userId) {
        throw new PackingListPermissionError('Only the owner can update items');
      }

      await prisma.$transaction(
        updates.map(update => 
          prisma.packingItem.update({
            where: { 
              id: update.id,
              packingListId: listId // Ensure item belongs to this list
            },
            data: { isPacked: update.isPacked }
          })
        )
      );

      await this.cache.delete(listId);
    } catch (error) {
      if (error instanceof PackingListError) throw error;
      throw new PackingListError(`Failed to update items: ${error.message}`);
    }
  }

  async batchDeleteLists(listIds: string[]): Promise<void> {
    await prisma.packingList.deleteMany({
      where: {
        id: {
          in: listIds
        }
      }
    });

    // Clear cache for all deleted lists
    await Promise.all(listIds.map(id => this.cache.delete(id)));
  }
} 