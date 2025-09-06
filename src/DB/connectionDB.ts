import mongoose from "mongoose";

export async function connectDB() {
  mongoose.connect(process.env.MONGO_URL as unknown as string)
    .then(() => console.log("db connected......"))
    .catch(error => console.log("error to connect db", error));
}