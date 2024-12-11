export interface PackingList {
  id: string;
  name: string;
  description?: string;
  userId: string;
  version: number;
  isTemplate: boolean;
  categories: PackingCategory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PackingCategory {
  id: string;
  name: string;
  description?: string;
  packingListId: string;
  order: number;
  items: PackingItem[];
}

export interface PackingItem {
  id: string;
  name: string;
  quantity: number;
  isRequired: boolean;
  isPacked: boolean;
  notes?: string;
  categoryId: string;
  packingListId: string;
} 