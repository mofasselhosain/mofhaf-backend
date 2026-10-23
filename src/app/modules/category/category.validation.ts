
import { z } from "zod";
import {
  CategoryStatus,
  CategoryType,
} from "../../../generated/prisma/enums";

export const CategoryTypeEnum = z.nativeEnum(CategoryType);
export const CategoryStatusEnum = z.nativeEnum(CategoryStatus);

export type CategoryTypes = z.infer<typeof CategoryTypeEnum>;
export type CategoryStatusType = z.infer<typeof CategoryStatusEnum>;

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),

  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Slug must contain lowercase letters, numbers, and hyphens only",
    }),

  categoryType: CategoryTypeEnum.default("PRODUCT").optional(),
  description: z.string().trim(),

  status: CategoryStatusEnum.default("DRAFT").optional(),
  isActive: z.boolean().default(true).optional(),
  sortOrder: z.number().int().min(0).default(0).optional(),
  isFeatured: z.boolean().default(false).optional(),
});
export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<
  typeof createCategorySchema
>;

export type UpdateCategoryInput = z.infer<
  typeof updateCategorySchema
>;
