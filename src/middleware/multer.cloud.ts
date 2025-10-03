import { Request } from "express";
import { AppError, StoreType } from "../utils";
import multer, { FileFilterCallback } from "multer";
import os from "os";
import { v4 as uuid } from "uuid"
export const allowedExtension = {
  image: ["image/png", "image/jpg", "image/jpeg", "image/webp" , "image/gif" , "image/svg+xml" , "image/tiff" , "image/tif" , "image/bmp"],
}
export function multerCloud({ fileTypes, storeType = StoreType.CLOUD, max = 5 }: { fileTypes: string[], storeType?: StoreType, max?: number }) {
  const storage = storeType === StoreType.CLOUD ? multer.memoryStorage() : multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, os.tmpdir());
    },
    filename: function (req, file, cb) {
      cb(null, `${uuid()}-${file.originalname}`);
    }
  });
  function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
    if (fileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("invalid file type", 400));
    }
  }
  const uploads = multer({ storage, limits: { fileSize: max * 1024 * 1024 }, fileFilter });
  return uploads;
}