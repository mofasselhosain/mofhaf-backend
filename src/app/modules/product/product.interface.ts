

import type { Prisma, Product } from "../../../generated/prisma/client";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "./product.validation";

export type ICreateProduct = CreateProductInput;

export type IUpdateProduct = UpdateProductInput;

export interface IProductParams {
  id: string;
}


export interface IProductQueryPro {
  // Pagination
  page?: string;
  limit?: string;

  // Sorting
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  // Search
  searchTerm?: string;

  // Product filters
  status?: string;
  name?: string;
  slug?: string;
  description?: string;
  sku?: string;
  brand?: string;
  categoryId?: string;
  categoryType?: string;
  userId?: string;

  // Boolean filters
  isFeatured?: string;
  isPublished?: string;

  // Numeric filters
  minPrice?: string;
  maxPrice?: string;
  minStock?: string;
  maxStock?: string;
}


export type IProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    variants: true;
  };
}>;

export type IProductPublic = Omit<
  Product,
  "costPrice" | "adminPrice"
>;
