import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import router from "./app/routers";
import config from "./app/config";

const app: Application = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://mofhaf.vercel.app",
];

if (config.frontend_url) {
  allowedOrigins.push(
    config.frontend_url.replace(/\/$/, ""),
  );
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as
      // some server-to-server requests.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`),
      );
    },
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  }),
);


// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1",router);



// app.get("/test", async (req: Request, res: Response, next: NextFunction) => {
// 	try {
// 		const grantIdTokenResult = await getBkashIdToken();

// 		console.log(grantIdTokenResult);

// 		res.status(httpStatus.OK).json({
// 			success: true,
// 			message: "Welcome to PH Healthcare System Backend",
// 			data: null,
// 		});
// 	} catch (error) {
// 		console.log(error);
// 		next(error);
// 	}
// });

// Basic route
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to MOFHAF Backend",
	});
});

// app.use(globalErrorHandler);
// app.use(notFound);

export default app;