/** biome-ignore-all lint/style/useConst: <explanation> */
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { UploadApiResponse } from "cloudinary";
import { cloudinary, cloudinaryTwo } from "../../lib/cloudinary";
import { IQuery } from "../../intrerface/query.interface";
import { IRequestUser } from "../auth/auth.interface";
import { calculateMeta, calculatePagination } from "../../utiles/prisma-pagination";
import { Prisma } from "../../../generated/prisma/client";
import { ICreateProduct, IUpdateProduct } from "./product.interface";
import { buildProductQuery } from "./product.consts";

const productCreate = async (
	payload: ICreateProduct,
	productImage: Express.Multer.File[],
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

  const productImageFilesUploadResults = await Promise.all(
		productImage.map((file) => {
			return new Promise<UploadApiResponse>((resolve, reject) => {
				cloudinaryTwo.uploader
					.upload_stream(
						{
							resource_type: "auto",
						},

						async (error, result) => {
							if (error) {
								return reject(error);
							}

							if (!result) {
								return reject(new Error("No result returned from Cloudinary"));
							}

							resolve(result);
						},
					)
					.end(file.buffer);
			});
		}),
	);
	

	const createProduct = await prisma.product.create({
		data: {
            categoryId:payload?.categoryId ,
			userId: userId,
			description: payload.description,
            slug: payload.slug,
			name: payload.name,
			
			price: payload.price,
			adminPrice: payload.adminPrice,
			compareAtPrice: payload.compareAtPrice,
			brand: payload.brand,
			costPrice:payload.costPrice,
			oldPrice:payload.oldPrice,
			isPublished:payload.isPublished,
			lowStockThreshold:payload.lowStockThreshold,
			seoDescription:payload.seoDescription,
			seoTitle:payload.seoTitle,
			shortDescription:payload.shortDescription,
			sku:payload.sku,
		    warranty: payload.warranty,
		    weight: payload.weight,
			 images: {
          create: (productImageFilesUploadResults.map((image) => ({
            url: image.secure_url,
            publicId: image.public_id,
            alt: image.alt ? image.alt:"",
            isPrimary: image.isPrimary ?? false,
            position: image.position ?? 0,
          }))),
        },
		variants: {
  create: (payload.variants ?? []).map((variant) => ({
    name: variant.name,
    sku: variant.sku,
    price: new Prisma.Decimal(variant.price),
    stock: variant.stock ?? 0,
    attributes: variant.attributes as Prisma.InputJsonValue,
  })),
},
		},
	});

	return createProduct;
};

const getAllOwnProduct = async (query:IQuery,user:IRequestUser) => {
  const { page, limit, skip, where, orderBy } =
    buildProductQuery(query);
 


  const [Product, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      take: limit,
      skip,
      orderBy,
	   include: {
        category: true,
        images: {
          orderBy: { position: "asc" },
        },
        variants: true,
      },
    
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: Product,
     meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
	
const getSingleOwnProduct = async (ProductId: string) => {
	const result = await prisma.product.findMany({
		where: { id: ProductId },
	});
	return result;
};

// Product update from db
const productUpdated = async (
	payload: IUpdateProduct,
	ProductImage:Express.Multer.File | null,
	userId: string,
	ProductID: string,
) => {
// 	const currentProduct = await prisma.product.findUnique({
// 		where: {
// 			id: ProductID,
// 		},
// 		select: {
// 			images:true,
// 			imageUrl: true,
// 			bannarPublicId:true,
// 			bannarUrl:true
// 		},
// 	});
// if (!currentProduct) { throw new Error("Product not found"); }
// let imageUrl = currentProduct.imageUrl;
// let imagePublicId = currentProduct.imagePublicId;
// let bannarPublicId = currentProduct.bannarPublicId;
// let bannarUrl    = currentProduct.bannarUrl

// if(ProductImage?.buffer && ProductImage?.buffer.length >0 ) {
//  const ProductImageUploadResult = await new Promise<UploadApiResponse>(
// 		(resolve, reject) => {
// 			cloudinary.uploader
// 				.upload_stream(
// 					{
// 						resource_type: "auto",
// 					},

// 					async (error, result) => {
// 						if (error) {
// 							return reject(error);
// 						}

// 						if (!result) {
// 							return reject(
// 								new AppError(
// 									httpStatus.INTERNAL_SERVER_ERROR,
// 									"No result returned from Cloudinary",
// 								),
// 							);
// 						}

// 						resolve(result);
// 					},
// 				)
// 				.end(ProductImage?.buffer);
// 		},
// 	);
// 	if (currentProduct?.imagePublicId && currentProduct.imageUrl) {
// 		await cloudinary.uploader.destroy(currentProduct.imagePublicId);
// 	}
// 	imagePublicId = ProductImageUploadResult.public_id,
// 	imageUrl = ProductImageUploadResult.secure_url
// }
    
// if(bannerImage?.buffer && bannerImage?.buffer.length >0 ) {
// const bannerImageUploadResult = await new Promise<UploadApiResponse>(
// 		(resolve, reject) => {
// 			cloudinary.uploader
// 				.upload_stream(
// 					{
// 						resource_type: "auto",
// 					},

// 					async (error, result) => {
// 						if (error) {
// 							return reject(error);
// 						}

// 						if (!result) {
// 							return reject(
// 								new AppError(
// 									httpStatus.INTERNAL_SERVER_ERROR,
// 									"No result returned from Cloudinary",
// 								),
// 							);
// 						}

// 						resolve(result);
// 					},
// 				)
// 				.end(bannerImage?.buffer);
// 		},
// 	);
// 	if (currentProduct?.bannarPublicId && currentProduct.bannarUrl) {
// 		await cloudinary.uploader.destroy(currentProduct.bannarPublicId);
// 	}
// 	bannarPublicId= bannerImageUploadResult.public_id,
// bannarUrl = bannerImageUploadResult.secure_url

// }
  
// 	// 


// 	// if (currentProduct?.imagePublicId && currentProduct.imageUrl) {
// 	// 	await cloudinary.uploader.destroy(currentProduct.imagePublicId);
// 	// }

// 	const updatedProduct = await prisma.Product.update({
// 		where: {
// 			id: ProductID,
// 		},
// 		data: {
// 			name: payload.name,
// 			description: payload.description,
// 		    ProductType: payload.ProductType,
// 			imageUrl: imageUrl,
// 			imagePublicId: imagePublicId,
// 			bannarPublicId: bannarPublicId,
// 			bannarUrl: bannarUrl,
// 			slug:payload.slug,
// 			sortOrder:payload.sortOrder,
// 			status: payload.status,
// 		},
// 	});
// 	// if (currentProduct?.imagePublicId && currentProduct.imageUrl) {
// 	// 	await cloudinary.uploader.destroy(currentProduct.imagePublicId);
// 	// }

// 	return updatedProduct;
};

const deleteProduct = async (ProductId: string, userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User Profile Not Found");
	}

	const getProduct = await prisma.product.findUnique({
		where: { id: ProductId },
		select: {
			imagePublicId:true,
			imageUrl: true,
			bannarPublicId:true,
			bannarUrl: true,
			isDeleted:true,
			id:true
		},
	});

	if (!getProduct || getProduct.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Product Not Found");
	}
	if (getProduct?.imagePublicId && getProduct.imageUrl || getProduct.bannarPublicId && getProduct.bannarUrl) {
		await cloudinary.uploader.destroy(getProduct.imagePublicId);
		await cloudinary.uploader.destroy(getProduct.bannarPublicId);
	}
	const deletedProduct= await prisma.product.delete({
		where: { id: getProduct.id },
	});

	return deletedProduct;
};

export const ProductService = {
	productCreate,
	getAllOwnProduct,
	getSingleOwnProduct,
	deleteProduct,
	productUpdated,
};
