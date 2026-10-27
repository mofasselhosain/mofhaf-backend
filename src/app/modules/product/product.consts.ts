import { CategoryType, Prisma, ProductStatus } from "../../../generated/prisma/client";
import type { IProductQueryPro } from "./product.interface";



const allowedSortFields = [
  "name",
  "price",
  "stock",
  "status",
  "createdAt",
  "updatedAt",
  "brand",
] as const;

type ProductSortField = (typeof allowedSortFields)[number];

export const buildProductQuery = (query: IProductQueryPro) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(query.limit) || 10)
  );

  const skip = (page - 1) * limit;

  const sortBy: ProductSortField =
    allowedSortFields.includes(query.sortBy as ProductSortField)
      ? (query.sortBy as ProductSortField)
      : "createdAt";

  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const andConditions: Prisma.ProductWhereInput[] = [];

  // Search across multiple product fields
  if (query.searchTerm?.trim()) {
    const searchTerm = query.searchTerm.trim();

    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        {
          description: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          shortDescription: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        { slug: { contains: searchTerm, mode: "insensitive" } },
        { sku: { contains: searchTerm, mode: "insensitive" } },
        { brand: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  // Exact or partial string filters
  if (query.name?.trim()) {
    andConditions.push({
      name: { contains: query.name.trim(), mode: "insensitive" },
    });
  }

  if (query.slug?.trim()) {
    andConditions.push({
      slug: { contains: query.slug.trim(), mode: "insensitive" },
    });
  }

  if (query.description?.trim()) {
    andConditions.push({
      description: {
        contains: query.description.trim(),
        mode: "insensitive",
      },
    });
  }

  if (query.sku?.trim()) {
    andConditions.push({
      sku: { contains: query.sku.trim(), mode: "insensitive" },
    });
  }

  if (query.brand?.trim()) {
    andConditions.push({
      brand: { contains: query.brand.trim(), mode: "insensitive" },
    });
  }

  // Enum filter
  if (query.status) {
    if (
      !Object.values(ProductStatus).includes(
        query.status as ProductStatus
      )
    ) {
      throw new Error("Invalid product status");
    }

    andConditions.push({
      status: query.status as ProductStatus,
    });
  }

  // Category and seller/provider filters
  if (query.categoryId) {
    andConditions.push({ categoryId: query.categoryId });
  }

  if (query.userId) {
    andConditions.push({ userId: query.userId });
  }

  if (query.categoryType) {
    if (
      !Object.values(CategoryType).includes(
        query.categoryType as CategoryType
      )
    ) {
      throw new Error("Invalid category type");
    }

    andConditions.push({
      category: {
        is: {
          categoryType: query.categoryType as CategoryType,
        },
      },
    });
  }

  // Boolean filters
  if (query.isFeatured !== undefined) {
    if (!["true", "false"].includes(query.isFeatured)) {
      throw new Error("isFeatured must be true or false");
    }

    andConditions.push({
      isFeatured: query.isFeatured === "true",
    });
  }

  if (query.isPublished !== undefined) {
    if (!["true", "false"].includes(query.isPublished)) {
      throw new Error("isPublished must be true or false");
    }

    andConditions.push({
      isPublished: query.isPublished === "true",
    });
  }

  // Price range
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const minPrice =
      query.minPrice !== undefined
        ? Number(query.minPrice)
        : undefined;

    const maxPrice =
      query.maxPrice !== undefined
        ? Number(query.maxPrice)
        : undefined;

    if (
      (minPrice !== undefined &&
        (!Number.isFinite(minPrice) || minPrice < 0)) ||
      (maxPrice !== undefined &&
        (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
      (minPrice !== undefined &&
        maxPrice !== undefined &&
        minPrice > maxPrice)
    ) {
      throw new Error("Invalid price range");
    }

    andConditions.push({
      price: {
        ...(minPrice !== undefined
          ? { gte: new Prisma.Decimal(minPrice) }
          : {}),
        ...(maxPrice !== undefined
          ? { lte: new Prisma.Decimal(maxPrice) }
          : {}),
      },
    });
  }

  // Stock range
  if (query.minStock !== undefined || query.maxStock !== undefined) {
    const minStock =
      query.minStock !== undefined ? Number(query.minStock) : undefined;

    const maxStock =
      query.maxStock !== undefined ? Number(query.maxStock) : undefined;

    if (
      (minStock !== undefined &&
        (!Number.isInteger(minStock) || minStock < 0)) ||
      (maxStock !== undefined &&
        (!Number.isInteger(maxStock) || maxStock < 0)) ||
      (minStock !== undefined &&
        maxStock !== undefined &&
        minStock > maxStock)
    ) {
      throw new Error("Invalid stock range");
    }

    andConditions.push({
      stock: {
        ...(minStock !== undefined ? { gte: minStock } : {}),
        ...(maxStock !== undefined ? { lte: maxStock } : {}),
      },
    });
  }

  const where: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const orderBy: Prisma.ProductOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  return {
    page,
    limit,
    skip,
    where,
    orderBy,
  };
};
