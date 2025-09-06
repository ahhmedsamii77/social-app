import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { AppError } from "./utils/index";
import { globalErrorHandler } from "./middleware/index";
import dotenv from "dotenv";
import { userRouter } from "./modules/users/user.controller";
import { connectDB } from "./DB/connectionDB";
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests, please try again later.",
  statusCode: 429,
  skipSuccessfulRequests: true,
});
export default async function bootstrap() {
  // connect db
  await connectDB();

  // cors
  app.use(cors());

  // security
  app.use(helmet());

  // rate limit
  app.use(limiter);

  // parse
  app.use(express.json());

  // main route
  app.get("/", (req, res, next) => {
    return res.status(200).json({ message: "welcome to my app........" });
  });

  // user route
  app.use("/users", userRouter);

  // unhandled routes
  app.use((req, res, next) => {
    throw new AppError(`404 Not Found Url ${req.originalUrl}`, 404);
  });

  // error handler
  app.use(globalErrorHandler);

  // server run
  app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
}
