import cors from "cors"
import helmet from "helmet"
import express from "express"
import { rateLimit } from "express-rate-limit"
import { AppError } from "./utils";
import { globalErrorHandler } from "./middleware";
import dotenv from "dotenv";
import { checkConnectionDb } from "./DB";
import { userRouter } from "./modules/users/user.controller";
dotenv.config();
const port = process.env.PORT || 5000;
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many requests from this IP, please try again after 5 minutes",
  statusCode: 429,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});
const app = express();
export default async function bootstrap() {
  // connect to db
  await checkConnectionDb();
  //  cors
  app.use(cors());

  // helmet
  app.use(helmet());

  // rate limit
  app.use(limiter);

  //  parsing data
  app.use(express.json());

  // main route
  app.get("/", (req, res, next) => {
    return res.status(200).json("welcome to social app...........");
  });

  // user route
  app.use("/users", userRouter);

  // unhandled routes
  app.use((req, res, next) => {
    throw new AppError(`404 Not Found Url ${req.originalUrl}`, 404);
  });

  // global error handler
  app.use(globalErrorHandler);

  //  start server
  app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
}