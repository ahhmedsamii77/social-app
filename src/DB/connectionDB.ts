import mongoose from "mongoose";

export function checkConnectionDb() {
  mongoose.connect(process.env.MONGO_URI!)
  .then(()=> console.log("db connected..................."))
  .catch((error => console.log("db not connected................", error)));
}