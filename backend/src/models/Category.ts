export interface Category {
  id: number;
  name: string;
  description?: string;
  code: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  code: string;
  is_active?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  code?: string;
  is_active?: boolean;
}
