
export enum CategoryType {
  PRODUCT = "PRODUCT",
  SERVICE = "SERVICE",
  BLOG = "BLOG",
  BRAND = "BRAND",
  COLLECTION = "COLLECTION",
  DIGITAL_PRODUCT = "DIGITAL_PRODUCT",
}

export enum CategoryStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  PUBLISH = "PUBLISH",
  UUPUBLISH = "UUPUBLISH",
  ARCHIVED = "ARCHIVED",
}

// Create category interface
export interface ICreateCategory {
  name: string;
  slug: string;
  categoryType?: CategoryType;
  description?: string;
  categoryImage?: File;
  bannerImage?: File;
  status?: CategoryStatus;
  isActive?: boolean;
  sortOrder?: number;
  isFeatured?: boolean;
  userId?: string;
}

// Update category interface
export interface IUpdateCategory {
  name?: string;
  slug?: string;
  categoryType?: CategoryType;
  description?: string;
  image?: File;
  banner?: File;
  status?: CategoryStatus;
  isActive?: boolean;
  sortOrder?: number;
  isFeatured?: boolean;
}

// API response interface
export interface ICategory {
  id?: string;
  name: string;
  slug: string;
  categoryType?: CategoryType;
  description: string | null;
  imageUrl?: string;
  imagePublicId?: string;
  bannarUrl?: string;
  bannarPublicId?: string;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  status?: CategoryStatus;
  isActive?: boolean;
  sortOrder?: number;
  isFeatured?: boolean;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
