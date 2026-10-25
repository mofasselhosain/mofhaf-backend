
import { z } from "zod";
import { ProductStatus } from "../../../generated/prisma/enums";

const imageSchema = z.object({
  url: z.string().url("Image URL must be valid"),
  publicId: z.string().trim().optional(),
  alt: z.string().trim().max(255).optional(),
  isPrimary: z.boolean().default(false),
  position: z.number().int().min(0).default(0),
});

const variantSchema = z.object({
  sku: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(150),
  attributes: z.record(z.string(), z.unknown()),
  price: z.number().finite().min(0),
  compareAtPrice: z.number().finite().min(0).nullable().optional(),
  stock: z.number().int().min(0).default(0),
});

const productFields = {
  name: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(10000).nullable().optional(),
  shortDescription: z.string().trim().max(500).nullable().optional(),

  price: z.number().finite().min(0),
  compareAtPrice: z.number().finite().min(0).nullable().optional(),
  oldPrice: z.number().finite().min(0).nullable().optional(),

  // Restrict these fields to authorized admin operations.
  costPrice: z.number().finite().min(0).nullable().optional(),
  adminPrice: z.number().finite().min(0).nullable().optional(),

  sku: z.string().trim().min(1).max(100).nullable().optional(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),

  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),

  brand: z.string().trim().max(150).nullable().optional(),
  warranty: z.string().trim().max(255).nullable().optional(),
  weight: z.number().finite().positive().nullable().optional(),

  seoTitle: z.string().trim().max(255).nullable().optional(),
  seoDescription: z.string().trim().max(500).nullable().optional(),

  categoryId: z.string().uuid(),
  images: z.array(imageSchema).max(20).default([]),
  variants: z.array(variantSchema).max(100).default([]),
};

export const createProductValidationSchema = z
  .object(productFields)
  .superRefine((data, ctx) => {
    const primaryImages = data.images.filter(
      (image) => image.isPrimary,
    );

    if (primaryImages.length > 1) {
      ctx.addIssue({
        code: "custom",
        path: ["images"],
        message: "Only one image can be primary",
      });
    }

    const variantSkus = data.variants.map((variant) =>
      variant.sku.toLowerCase(),
    );

    if (new Set(variantSkus).size !== variantSkus.length) {
      ctx.addIssue({
        code: "custom",
        path: ["variants"],
        message: "Variant SKUs must be unique",
      });
    }
  });

export const updateProductValidationSchema = z
  .object({
    name: productFields.name.optional(),
    slug: productFields.slug.optional(),
    description: productFields.description,
    shortDescription: productFields.shortDescription,

    price: productFields.price.optional(),
    compareAtPrice: productFields.compareAtPrice,
    oldPrice: productFields.oldPrice,
    costPrice: productFields.costPrice,
    adminPrice: productFields.adminPrice,

    sku: productFields.sku,
    stock: productFields.stock.optional(),
    lowStockThreshold: productFields.lowStockThreshold.optional(),

    status: z.nativeEnum(ProductStatus).optional(),
    isFeatured: z.boolean().optional(),
    isPublished: z.boolean().optional(),

    brand: productFields.brand,
    warranty: productFields.warranty,
    weight: productFields.weight,

    seoTitle: productFields.seoTitle,
    seoDescription: productFields.seoDescription,
    categoryId: productFields.categoryId.optional(),

    images: z.array(imageSchema).max(20).optional(),
    variants: z.array(variantSchema).max(100).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Provide at least one field to update",
      });
    }

    if (data.images) {
      const primaryCount = data.images.filter(
        (image) => image.isPrimary,
      ).length;

      if (primaryCount > 1) {
        ctx.addIssue({
          code: "custom",
          path: ["images"],
          message: "Only one image can be primary",
        });
      }
    }

    if (data.variants) {
      const skus = data.variants.map((variant) =>
        variant.sku.toLowerCase(),
      );

      if (new Set(skus).size !== skus.length) {
        ctx.addIssue({
          code: "custom",
          path: ["variants"],
          message: "Variant SKUs must be unique",
        });
      }
    }
  });

export const productIdValidationSchema = z.object({
  id: z.string().uuid(),
});

export type CreateProductInput = z.infer<
  typeof createProductValidationSchema
>;

export type UpdateProductInput = z.infer<
  typeof updateProductValidationSchema
>;
