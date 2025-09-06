import {  hash } from "bcrypt";
export async function Hash(plaintext: string) {
  return hash(plaintext, Number(process.env.SALT_ROUNDS as unknown as number));
}