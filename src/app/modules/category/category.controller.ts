import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ICreateCategory } from "./category.inferface";
import { CategoryService } from "./category.service";
import { IRequestUser } from "../auth/auth.interface";
import { createCategorySchema } from "./category.validation";

const CategoryCreate = catchAsync(async (req: Request, res: Response) => {
	if (!req.file) {
		throw new AppError(httpStatus.BAD_REQUEST, "No File Provided.");
	}
	const files = req.files as { [fieldname: string]: Express.Multer.File[] };
	
	const cateogoryImage = files?.["cateogoryImage"] ? files["cateogoryImage"][0] : null;
	const bannerImage = files?.["bannerImage"] ? files["bannerImage"][0] : null;
	

	const zodValidationResult = createCategorySchema.safeParse(
		JSON.parse(req.body.data),
	);

	if (!zodValidationResult.success) {
		throw new AppError(httpStatus.BAD_REQUEST, zodValidationResult.error.issues[0].message);
	}

	const payload = zodValidationResult.data;


	// const payload = JSON.parse(req.body.data);
	//   const payload: ICreateCategory=
    //   typeof req.body.data === "string"
    //     ? JSON.parse(req.body.data)
    //     : req.body.data;

    const userId = req.user?.userId;
console.log(req.user)
    if (!userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Please log in first.",
      );
    }

	const result = await CategoryService.CategoryCreate(
		payload as ICreateCategory,
		cateogoryImage,
		bannerImage,
		userId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Category Create successfully!",
		data: result,
	});
});
const getAllOwnCategory = catchAsync(async (req: Request, res: Response) => {
	const user = req.user

	const result = await CategoryService.getAllOwnCategory(req.query,user as IRequestUser);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Category Retrieved Successfully",
		data:result.data,
		meta:result.meta
	});
});
const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await CategoryService.getSingleOwnCategory(id as string);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Category Retrieved Successfully",
		data: result,
	});
});
const CategoryUpdated = catchAsync(async (req: Request, res: Response) => {
	
 const payload =
    typeof req.body.data === "string"
      ? JSON.parse(req.body.data)
      : req.body.data ?? req.body;
    const files = req.file ?? null ;
	const { id: CategoryId } = req.params;
	const userId = req.user?.userId;
	const result = await CategoryService.CategoryUpdated(
		payload,
		files?.buffer,
		userId as string,
		CategoryId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Category updated successfully!",
		data: result,
	});
});
const deletedCategory = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = req.user?.userId;

	const result = await CategoryService.deleteCategory(
		id as string,
		userId as string,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Category deleted  Successfully",
		data: result,
	});
});
export const CategoryController = {
	CategoryCreate,
	getAllOwnCategory,
	getSingleCategory,
	deletedCategory,
	CategoryUpdated,
};
