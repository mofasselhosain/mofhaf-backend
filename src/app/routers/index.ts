import { Router } from "express";
import { UserRoutes } from "../modules/users/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";


const router = Router();

const moduleRoutes = [
	
	{
		path: "/auth",
		route: AuthRoutes,
	},
	{
		path: "/users",
		route:UserRoutes ,
	},
	// {
	// 	path: "/booking",
	// 	route: BookingRoutes,
	// },
	// {
	// 	path: "/payment",
	// 	route: PaymentRoutes,
	// },
	// {
	// 	path: "/admin",
	// 	route: AdminRoutes,
	// },
	// {
	// 	path: "/homeBanner",
	// 	route: HomeBannerRoutes,
	// },
	// {
	// 	path: "/provider",
	// 	route:  ProviderRoutes,
	// },
	// {
	// 	path: "/question",
	// 	route:  QuestionRoutes,
	// },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
