import { hash, compare } from "bcrypt"
import CryptoJS from "crypto-js";
export async function Hash({ plainText, salt = Number(process.env.SALT) }: { plainText: string, salt?: number }) {
  return hash(plainText, salt);
}

export async function Compare({ plainText, cipherText }: { plainText: string, cipherText: string }) {
  return compare(plainText, cipherText);
}



export async function Encrypt({ plainText , secretKey}: { plainText: string , secretKey: string }) {
  return CryptoJS.AES.encrypt(plainText, secretKey).toString();
}

export async function Decrypt({ cipherText , secretKey}: { cipherText: string , secretKey: string }) {
  return CryptoJS.AES.decrypt(cipherText, secretKey).toString(CryptoJS.enc.Utf8);
}