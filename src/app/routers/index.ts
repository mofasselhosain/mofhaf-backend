import { Router } from "express";
import { UserRoutes } from "../modules/users/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { CategoryRoutes } from "../modules/category/category.route";


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
	{
		path: "/category",
		route: CategoryRoutes,
	},
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
