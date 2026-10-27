/** biome-ignore-all lint/style/useConst: <explanation> */
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../lib/cloudinary";
import type { ICreateCategory, IUpdateCategory } from "./category.inferface";
import type { IQuery } from "../../intrerface/query.interface";
import type { IRequestUser } from "../auth/auth.interface";
import { calculateMeta, calculatePagination } from "../../utiles/prisma-pagination";
import type { Prisma } from "../../../generated/prisma/client";

const CategoryCreate = async (
	payload: ICreateCategory,
	categoryImage: Express.Multer.File | null,
	bannerImage: Express.Multer.File | null,
	userId: string
) => {
	
	  // 1. Validate the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found. Please log in again.",
    );
  }
  const categoryImageUploadResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
					},

					async (error, result) => {
						if (error) {
							return reject(error);
						}

						if (!result) {
							return reject(
								new AppError(
									httpStatus.INTERNAL_SERVER_ERROR,
									"No result returned from Cloudinary",
								),
							);
						}

						resolve(result);
					},
				)
				.end(categoryImage?.buffer);
		},
	);
  const bannerImageUploadResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
					},

					async (error, result) => {
						if (error) {
							return reject(error);
						}

						if (!result) {
							return reject(
								new AppError(
									httpStatus.INTERNAL_SERVER_ERROR,
									"No result returned from Cloudinary",
								),
							);
						}

						resolve(result);
					},
				)
				.end(bannerImage?.buffer);
		},
	);

	const createCategory = await prisma.category.create({
		data: {
            userId:user?.id ,
			name: payload.name,
			description: payload.description,
            slug: payload.slug,
			categoryType: payload.categoryType,
			bannarUrl: bannerImageUploadResult.secure_url,
			bannarPublicId: bannerImageUploadResult.public_id,
			imageUrl: categoryImageUploadResult.secure_url,
			imagePublicId: categoryImageUploadResult.public_id,
			sortOrder : payload.sortOrder,
            isFeatured:payload.isFeatured,
            isActive:payload.isActive,
			status: payload.status,
		},
	});

	return createCategory;
};

const getAllOwnCategory = async (query:IQuery,user:IRequestUser) => {
     const { page, limit, skip, sortBy, sortOrder } =
    calculatePagination(query);
 const andConditions: Prisma.CategoryWhereInput[] =[]
  

  if (query.status) {
    andConditions.push({
      status: query.status as Prisma.EnumCategoryStatusFilter["equals"],
    });
  }

  if (query.categoryType) {
    andConditions.push({
      categoryType: query.status as Prisma.EnumCategoryTypeFilter["equals"],
    });
  }
  if (query.name) {
    andConditions.push({
      name: query.name ,
    });
  }
  if (query.slug) {
    andConditions.push({
      slug: query.slug ,
    });
  }
  if (query.description) {
    andConditions.push({
      description: query.description ,
    });
  }
const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "startDate",
    "endDate",
  ] as const;
    const safeSortBy = (
    allowedSortFields as readonly string[]
  ).includes(sortBy)
    ? sortBy
    : "createdAt";
	  const where: Prisma.CategoryWhereInput = {
    AND: andConditions,
  };


  const [category, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        [safeSortBy]: sortOrder,
      },
    
    }),
    prisma.category.count({ where }),
  ]);

  return {
    data: category,
    meta: calculateMeta(page, limit, total),
  };
};
	
const getSingleOwnCategory = async (CategoryId: string) => {
	const result = await prisma.category.findMany({
		where: { id: CategoryId },
	});
	return result;
};

// Category update from db
const CategoryUpdated = async (
	payload: IUpdateCategory,
	categoryImage:Express.Multer.File | null,
	bannerImage:Express.Multer.File | null,
	userId: string,
	CategoryID: string,
) => {
	const currentCategory = await prisma.category.findUnique({
		where: {
			id: CategoryID,
		},
		select: {
			imagePublicId: true,
			imageUrl: true,
			bannarPublicId:true,
			bannarUrl:true
		},
	});
if (!currentCategory) { throw new Error("Category not found"); }
let imageUrl = currentCategory.imageUrl;
let imagePublicId = currentCategory.imagePublicId;
let bannarPublicId = currentCategory.bannarPublicId;
let bannarUrl    = currentCategory.bannarUrl

if(categoryImage?.buffer && categoryImage?.buffer.length >0 ) {
 const categoryImageUploadResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
					},

					async (error, result) => {
						if (error) {
							return reject(error);
						}

						if (!result) {
							return reject(
								new AppError(
									httpStatus.INTERNAL_SERVER_ERROR,
									"No result returned from Cloudinary",
								),
							);
						}

						resolve(result);
					},
				)
				.end(categoryImage?.buffer);
		},
	);
	if (currentCategory?.imagePublicId && currentCategory.imageUrl) {
		await cloudinary.uploader.destroy(currentCategory.imagePublicId);
	}
	imagePublicId = categoryImageUploadResult.public_id,
	imageUrl = categoryImageUploadResult.secure_url
}
    
if(bannerImage?.buffer && bannerImage?.buffer.length >0 ) {
const bannerImageUploadResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "auto",
					},

					async (error, result) => {
						if (error) {
							return reject(error);
						}

						if (!result) {
							return reject(
								new AppError(
									httpStatus.INTERNAL_SERVER_ERROR,
									"No result returned from Cloudinary",
								),
							);
						}

						resolve(result);
					},
				)
				.end(bannerImage?.buffer);
		},
	);
	if (currentCategory?.bannarPublicId && currentCategory.bannarUrl) {
		await cloudinary.uploader.destroy(currentCategory.bannarPublicId);
	}
	bannarPublicId= bannerImageUploadResult.public_id,
bannarUrl = bannerImageUploadResult.secure_url

}
  
	// 


	// if (currentCategory?.imagePublicId && currentCategory.imageUrl) {
	// 	await cloudinary.uploader.destroy(currentCategory.imagePublicId);
	// }

	const updatedCategory = await prisma.category.update({
		where: {
			id: CategoryID,
		},
		data: {
			name: payload.name,
			description: payload.description,
		    categoryType: payload.categoryType,
			imageUrl: imageUrl,
			imagePublicId: imagePublicId,
			bannarPublicId: bannarPublicId,
			bannarUrl: bannarUrl,
			slug:payload.slug,
			sortOrder:payload.sortOrder,
			status: payload.status,
		},
	});
	// if (currentCategory?.imagePublicId && currentCategory.imageUrl) {
	// 	await cloudinary.uploader.destroy(currentCategory.imagePublicId);
	// }

	return updatedCategory;
};

const deleteCategory = async (CategoryId: string, userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User Profile Not Found");
	}

	const getCategory = await prisma.category.findUnique({
		where: { id: CategoryId },
		select: {
			imagePublicId:true,
			imageUrl: true,
			bannarPublicId:true,
			bannarUrl: true,
			isDeleted:true,
			id:true
		},
	});

	if (!getCategory || getCategory.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Category Not Found");
	}
	if (getCategory?.imagePublicId && getCategory.imageUrl || getCategory.bannarPublicId && getCategory.bannarUrl) {
		await cloudinary.uploader.destroy(getCategory.imagePublicId);
		await cloudinary.uploader.destroy(getCategory.bannarPublicId);
	}
	const deletedCategory= await prisma.category.delete({
		where: { id: getCategory.id },
	});

	return deletedCategory;
};

export const CategoryService = {
	CategoryCreate,
	getAllOwnCategory,
	getSingleOwnCategory,
	deleteCategory,
	CategoryUpdated,
};
