import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import express, { NextFunction, Request, Response } from "express";
import { AppError } from "./utils";
import dotenv from "dotenv";
import { checkConnectionDb } from "./DB/connectionDb";
import { userRouter } from "./modules/users/user.controller";
import { getFile } from "./utils/aws";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { postRouter } from "./modules/posts/post.controller";
const pipelineAsync = promisify(pipeline);
dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
  statusCode: 429,
  skipSuccessfulRequests: true,
});
export default function bootstrap() {
  // db connection
  checkConnectionDb();

  // cors
  app.use(cors());

  // helmet
  app.use(helmet());

  // rate limit
  app.use(limiter);

  // parseing data
  app.use(express.json());

  app.get("/upload/*path", async (req, res, next) => {
    const { path } = req.params as { path: string[] };
    const { downlaodName } = req.query;
    const Key = path.join("/");
    const result = await getFile({
      Key,
    });
    if (downlaodName) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${downlaodName}`
      );
    }
    res.setHeader("Content-Type", result.ContentType!);
    const stream = result.Body! as NodeJS.ReadableStream;
    await pipelineAsync(stream, res);
  });

  // main route
  app.get("/", (req, res, next) => {
    return res
      .status(200)
      .json({ message: "welcome to the api................" });
  });

  // user routes
  app.use("/users", userRouter);

  // post routes
  app.use("/posts", postRouter);

  // unhandled routes
  app.use((req, res, next) => {
    throw new AppError(`404 Not Found Url ${req.originalUrl}`, 404);
  });

  // error handler
  app.use(
    (error: AppError, req: Request, res: Response, next: NextFunction) => {
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message, stack: error.stack });
    }
  );

  // server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
