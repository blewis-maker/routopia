import { PackingList, PackingItem, PackingCategory } from '@/types/packing';

export function validatePackingList(data: any): data is PackingList {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.name === 'string' &&
    typeof data.userId === 'string' &&
    (!data.description || typeof data.description === 'string') &&
    typeof data.version === 'number' &&
    typeof data.isTemplate === 'boolean' &&
    Array.isArray(data.categories)
  );
}

export function validatePackingItem(data: any): data is PackingItem {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.name === 'string' &&
    typeof data.quantity === 'number' &&
    typeof data.isRequired === 'boolean' &&
    typeof data.isPacked === 'boolean' &&
    (!data.notes || typeof data.notes === 'string')
  );
}

export function validateCategory(data: any): data is PackingCategory {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.name === 'string' &&
    typeof data.order === 'number' &&
    (!data.description || typeof data.description === 'string')
  );
} 