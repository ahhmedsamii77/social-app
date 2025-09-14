import mongoose from "mongoose";

export async function checkConnectionDb() {
  mongoose.connect(process.env.MONGO_URL!)
    .then(() => console.log("Connected to DB..............."))
    .catch((error) => console.log("failed to connect to DB", error));
}