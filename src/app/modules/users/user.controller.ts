import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const uploadProfileImage = catchAsync(async (req: Request, res: Response) => {
	
	 const data =
    typeof req.body.data === "string"
      ? JSON.parse(req.body.data)
      : req.body.data ?? req.body;
    const files = req.file ?? null;
	const {id} = req.params
    
console.log(data.name!,data,"amin controller")
	const result = await UserServices.uploadProfileImage(
		files?.buffer,
		id as string,
		data 
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "updated image  successfully",
		data: result,
	});
});

export const UserController = {
	uploadProfileImage,
};
