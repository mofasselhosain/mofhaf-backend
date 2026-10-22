import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import { IUserUpdatedPayload } from "../auth/auth.interface";

const uploadProfileImage = async (buffer: Buffer| null | undefined, userId: string,payload:IUserUpdatedPayload ) => {

	const currentUser = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			imagePublicId: true,
			imageUrl: true,
		},
	});
 if (!currentUser) { throw new Error("User not found"); }
let imageUrl = currentUser.imageUrl;
let imagePublicId = currentUser.imagePublicId;
   if (buffer && buffer.length > 0) { 
	const cloudinaryResult = await new Promise<UploadApiResponse>( (resolve, reject) => 
    { const uploadStream = cloudinary.uploader.upload_stream( { resource_type: "image", folder: "", }, (error, result) => 
        { if (error) { return reject(error); } 
   if (!result)
 { return reject( new Error("No result returned from Cloudinary"), ); }
   
   resolve(result); }, ); uploadStream.end(buffer); }, ); 
   imageUrl = cloudinaryResult.secure_url;
  imagePublicId = cloudinaryResult.public_id
}
	// 
	
	const updatedUser = await prisma.user.update({
		where: {
			id: userId,
		},

		data: {
			imageUrl: imageUrl,
			imagePublicId: imagePublicId,
			name: payload.name
			
   
      
    },
    omit: {
      password: true,
    },
	});

	if (currentUser?.imagePublicId && currentUser.imageUrl) {
		await cloudinary.uploader.destroy(currentUser.imagePublicId);
	}

	return updatedUser;
};

export const UserServices = {
	uploadProfileImage,
};
