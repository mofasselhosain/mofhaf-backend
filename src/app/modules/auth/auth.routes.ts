import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { UserValidation } from "./auth.validation";
import { AuthController } from "./auth.controller";

const router = Router();

router.post(
	"/register",
	validateRequest(UserValidation.UserRegistrationZodSchema),
	AuthController.registerUser,
);
router.post(
	"/verify-email",
	validateRequest(UserValidation.UserEmailVerifyZodSchema),
	AuthController.verifyUserEmail,
);
router.post(
	"/login",
	validateRequest(UserValidation.LoginZodSchema),
	AuthController.loginUser,
);
router.get(
	"/me",
	auth(Role.ADMIN, Role.PROVIDER, Role.CUSTOMER, Role.SUPER_ADMIN),
	// validateRequest
	AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/google", AuthController.googleLogin);
router.post(
	"/forgot-password",
	validateRequest(UserValidation.ForgotPasswordZodSchema),
	AuthController.forgotPassword,
);
router.post(
	"/reset-password",
	validateRequest(UserValidation.ResetPasswordZodSchema),
	AuthController.resetPassword,
);
router.post(
	"/logout",
	AuthController.logout,
);
export const AuthRoutes = router;
