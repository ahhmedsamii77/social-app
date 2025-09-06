import crypto from "crypto-js";
export async function encrypt({ plaintext, key }: { plaintext: string, key: string }) {
  return crypto.AES.encrypt(plaintext, key).toString();
}