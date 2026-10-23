
import { z } from "zod";
import { CategoryStatus, CategoryType } from "../../../generated/prisma/enums";

export const CategoryTypeEnum = z.nativeEnum(CategoryType);
export const CategoryStatusEnum = z.nativeEnum(CategoryStatus);

export type CategoryTypes = z.infer<typeof CategoryTypeEnum>;
export type CategoryStatu= z.infer<typeof CategoryStatusEnum>;
const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "File cannot be empty")
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Only JPG, PNG, and WebP images are allowed"
  )
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "Maximum image size is 5MB"
  );

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),

  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

  categoryType: CategoryTypeEnum.default("PRODUCT").optional(),
  description: z.string().trim().optional(),

  image: imageFileSchema.optional(),
  banner: imageFileSchema.optional(),

  status: CategoryStatusEnum.default("DRAFT").optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),

  userId: z.string().min(1),
});

export const updateCategorySchema = createCategorySchema
  .omit({ userId: true })
  .partial();

export type CreateCategoryInput = z.infer<
  typeof createCategorySchema
>;

export type UpdateCategoryInput = z.infer<
  typeof updateCategorySchema
>;