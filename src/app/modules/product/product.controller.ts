import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";


import type { IRequestUser } from "../auth/auth.interface";
import { createProductValidationSchema, updateProductValidationSchema } from "./product.validation";
import type { ICreateProduct, IUpdateProduct } from "./product.interface";
import { ProductService } from "./product.service";


const productCreate = catchAsync(async (req: Request, res: Response) => {
    // if (!req.file) {
    // 	throw new AppError(httpStatus.BAD_REQUEST, "No File Provided.");
    // }
// 	const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
// 	const cateogoryImage = files?.["cateogoryImage"] ? files["cateogoryImage"][0] : null;
// 	const bannerImage = files?.["bannerImage"] ? files["bannerImage"][0] : null;
    

// 	const zodValidationResult = createCategorySchema.safeParse(
// 		JSON.parse(req.body.data),
// 	);

// 	if (!zodValidationResult.success) {
// 		throw new AppError(httpStatus.BAD_REQUEST, zodValidationResult.error.issues[0].message);
// 	}

// 	const payload = zodValidationResult.data;
// 	// const payload = JSON.parse(req.body.data);
// 	//   const payload: ICreateCategory=
//     //   typeof req.body.data === "string"
//     //     ? JSON.parse(req.body.data)
//     //     : req.body.data;

//     const userId = req.user?.userId;
// console.log(req.user)
//     if (!userId) {
//       throw new AppError(
//         httpStatus.UNAUTHORIZED,
//         "Please log in first.",
//       );
//     }
// console.log(payload as ICreateCategory,
// 		cateogoryImage,
// 		bannerImage,
// 		userId as string)
// console.log(req.files, req.body.data)
	const files = req.files as { [fieldname: string]: Express.Multer.File[] };
const productImage = files?.["productImage"] || [];
	const zodValidationResult = createProductValidationSchema.safeParse(
		JSON.parse(req.body.data),
	);

	if (!zodValidationResult.success) {
		throw new AppError(httpStatus.BAD_REQUEST, zodValidationResult.error.issues[0].message);
	}

	const payload = zodValidationResult.data;

const userId = req.user?.userId;

if (!userId) {
  throw new AppError(
    httpStatus.UNAUTHORIZED,
    "Please log in first."
  );
}

    const result = await ProductService.productCreate(
        payload  as ICreateProduct,
       productImage,
        userId as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Product Create successfully!",
        data: result,
    });
});
const getAllOwnProduct = catchAsync(async (req: Request, res: Response) => {
    const user = req.user

    const result = await ProductService.getAllOwnProduct(req.query,user as IRequestUser);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product Retrieved Successfully",
        data:result.data,
        meta:result.meta
    });
});
const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ProductService.getSingleOwnProduct(id as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product Retrieved Successfully",
        data: result,
    });
});
const productUpdated = catchAsync(async (req: Request, res: Response) => {

const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    const productImage = files?.["productImage"] ? files["cateogoryImage"][0] : null;
  
    

    const zodValidationResult = updateProductValidationSchema.safeParse(
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

    const {id:productId} = req.params
//  const payload =
//     typeof req.body.data === "string"
//       ? JSON.parse(req.body.data)
//       : req.body.data ?? req.body;
//     const files = req.file ?? null ;
    const { id: CategoryId } = req.params;
    // const userId = req.user?.userId;
    const result = await ProductService.productUpdated(
        payload as IUpdateProduct,
        productImage,
        userId as string,
        productId as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "product updated successfully!",
        data: result,
    });
});
const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await ProductService.deleteProduct(
        id as string,
        userId as string,
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product deleted  Successfully",
        data: result,
    });
});
export const ProductController = {
 productCreate,
 productUpdated,
 getAllOwnProduct,
 getSingleProduct,
 deleteProduct
};
