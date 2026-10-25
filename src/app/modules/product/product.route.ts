import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { validateRequest } from "../../middleware/validateRequest";
import { ProductController } from "./product.controller";



const router = Router();

router.post(
    "/create",
    // validateRequest(UserValidation.UserRegistrationZodSchema),
    auth(Role.ADMIN, Role.PROVIDER, Role.SUPER_ADMIN),
    upload.fields([ {
            name: "productImage",
            maxCount:5
        },]
    ),

    ProductController.productCreate,
);

router.get(
    "/",
    // auth(Role.ADMIN, Role.PROVIDER, Role.SUPER_ADMIN),
    // validateRequest
   ProductController.getAllOwnProduct,
);
router.get(
    "/:id",
    auth(Role.ADMIN, Role.PROVIDER, Role.SUPER_ADMIN),
    // validateRequest
   ProductController.getSingleProduct,
);
router.patch(
    "/:id",
    auth(Role.ADMIN, Role.PROVIDER, Role.SUPER_ADMIN),
        upload.fields([
        {
            name: "ProductImage",
            maxCount:4
        },
       
    ]),
    // validateRequest(),
   ProductController.productUpdated,
);
router.delete(
    "/:id",
    auth(Role.ADMIN, Role.PROVIDER, Role.SUPER_ADMIN),
    // validateRequest
   ProductController.deleteProduct,
);

export const ProductRoutes = router;
