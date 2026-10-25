import { Router } from "express";
import { UserRoutes } from "../modules/users/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { CategoryRoutes } from "../modules/category/category.route";
import { ProductRoutes } from "../modules/product/product.route";


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
	{
		path: "/product",
		route: ProductRoutes,
	},
	
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
