import { hash, compare } from "bcrypt";
import CryptoJS from "crypto-js";
export async function Hash(plainText: string, salt: number = Number(process.env.SALT)): Promise<string> {
  return hash(plainText, salt);
}

export async function Compare(plainText: string, cipherText: string): Promise<boolean> {
  return await compare(plainText, cipherText);
}

export async function Encrypt({ plainText, signature }: { plainText: string, signature: string }): Promise<string> {
  return CryptoJS.AES.encrypt(plainText, signature).toString();
}

export async function Decrypt({ cipherText, signature }: { cipherText: string, signature: string }): Promise<string> {
  return CryptoJS.AES.decrypt(cipherText, signature).toString(CryptoJS.enc.Utf8);
}