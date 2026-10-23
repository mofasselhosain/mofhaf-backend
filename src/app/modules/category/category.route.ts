import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { validateRequest } from "../../middleware/validateRequest";
import { createCategorySchema, updateCategorySchema } from "./category.validation";
import { CategoryController } from "./category.controller";


const router = Router();

router.post(
	"/create",
	// validateRequest(UserValidation.UserRegistrationZodSchema),
	auth(Role.ADMIN, Role.PROVIDER, Role.SUPER_ADMIN),
	upload.fields([
		{
			name: "categoryImage",
			maxCount:1
		},
		{
			name: "bannerImage",
			maxCount: 1
		}
	]),

	CategoryController.CategoryCreate,
);

router.get(
	"/",
	// auth(Role.ADMIN, Role.PROVIDER, Role.SUPER_ADMIN),
	// validateRequest
	CategoryController.getAllOwnCategory,
);
router.get(
	"/:id",
	auth(Role.ADMIN, Role.PROVIDER, Role.SUPER_ADMIN),
	// validateRequest
	CategoryController.getSingleCategory,
);
router.patch(
	"/:id",
	auth(Role.ADMIN, Role.PROVIDER, Role.SUPER_ADMIN),
		upload.fields([
		{
			name: "categoryImage",
			maxCount:1
		},
		{
			name: "bannerImage",
			maxCount: 1
		}
	]),
	validateRequest(updateCategorySchema),
	CategoryController.CategoryUpdated,
);
router.delete(
	"/:id",
	auth(Role.ADMIN, Role.PROVIDER, Role.SUPER_ADMIN),
	// validateRequest
	CategoryController.deletedCategory,
);

export const CategoryRoutes = router;
