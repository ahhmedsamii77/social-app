import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { StoreType } from "../types";
import { createReadStream } from "node:fs"
import { AppError } from "../classError";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export function s3Client() {
  return new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY!,
      secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    }
  });
}


export async function uplaodFile({ Bucket = process.env.BUCKET_NAME, ACL = "private", path = "general", file, storeType = StoreType.CLOUD }: { Bucket?: string, ACL?: ObjectCannedACL, path?: string, file: Express.Multer.File, storeType?: StoreType }) {
  const command = new PutObjectCommand({
    Bucket,
    Key: `${process.env.AWS_FOLDER}/${path}/${uuid()}-${file.originalname}`,
    ACL,
    Body: storeType == StoreType.CLOUD ? file.buffer : createReadStream(file.path),
    ContentType: file.mimetype
  });
  await s3Client().send(command);
  const key = command.input.Key!;
  if (!key) throw new AppError("failed to upload file", 500);
  return key
}

export async function uploadLargeFile({ Bucket = process.env.BUCKET_NAME, ACL = "private", path = "general", file, storeType = StoreType.CLOUD }: { Bucket?: string, ACL?: ObjectCannedACL, path?: string, file: Express.Multer.File, storeType?: StoreType }) {
  const upload = new Upload({
    client: s3Client(),
    params: {
      Bucket,
      Key: `${process.env.AWS_FOLDER}/${path}/${uuid()}-${file.originalname}`,
      ACL,
      Body: storeType == StoreType.CLOUD ? file.buffer : createReadStream(file.path),
      ContentType: file.mimetype
    }
  });
  const { Key } = await upload.done();
  if (!Key) throw new AppError("failed to upload file", 500);
  return Key;
}

export async function uploadFiles({ path = "general", files, storeType = StoreType.CLOUD, isLarge = false }: { Bucket?: string, ACL?: ObjectCannedACL, path?: string, files: Express.Multer.File[], storeType?: StoreType, isLarge?: boolean }) {
  let urls = [];
  if (isLarge) {
    urls = await Promise.all(files.map((file) => uploadLargeFile({ path, file, storeType })));
  } else {
    urls = await Promise.all(files.map((file) => uplaodFile({ path, file, storeType })));
  }
  return urls;
}

export async function putPresignedFile({ Bucket = process.env.BUCKET_NAME, ACL = "private", path = "general", originalname, ContentType }: { Bucket?: string, ACL?: ObjectCannedACL, path?: string, ContentType: string, originalname: string }) {
  const Key = `${process.env.AWS_FOLDER}/${path}/${uuid()}-${originalname}`
  const command = new PutObjectCommand({
    Bucket,
    Key,
    ACL,
    ContentType
  });

  const url = await getSignedUrl(s3Client(), command, { expiresIn: 60 });
  return {url , Key};
}


export async function getFile({ Bucket = process.env.BUCKET_NAME, Key }: { Bucket?: string, Key: string }) {
  const command = new GetObjectCommand({
    Bucket,
    Key
  });
  return await s3Client().send(command);
}

export async function getPresignedFile({ Bucket = process.env.BUCKET_NAME, Key, downloadName , expiresIn = Number(process.env.EXPIRES_IN )}: { Bucket?: string, Key: string, downloadName?: string   , expiresIn?: number }) {
  const command = new GetObjectCommand({
    Bucket,
    Key,
    ResponseContentDisposition: downloadName ? `attachment; filename="${downloadName}"` : undefined
  });
  return await getSignedUrl(s3Client(), command, { expiresIn });
}


export async function deleteFile({ Bucket = process.env.BUCKET_NAME, Key }: { Bucket?: string, Key: string }) {
  const command = new DeleteObjectCommand({
    Bucket,
    Key
  });
  return await s3Client().send(command);
}


export async function deleteFiles({ Bucket = process.env.BUCKET_NAME, Keys }: { Bucket?: string, Keys: string[] }) {
  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: { Objects: Keys.map((key) => ({ Key: key })) }
  })
  return await s3Client().send(command);
}


export async function listFiles({ Bucket = process.env.BUCKET_NAME, path }: { Bucket?: string, path: string }) {
  const command = new ListObjectsV2Command({
    Bucket,
    Prefix: `${process.env.AWS_FOLDER}/${path}`,
  });
  return await s3Client().send(command);
  
}