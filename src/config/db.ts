import mongoose, { ConnectOptions } from "mongoose";

export const connectDB = async (option: ConnectOptions = {}) => {
  try {
    await mongoose.connect(process.env.DB_URL!, option);
    console.log("DB Connection Established successful");
  } catch (error: any) {
    console.error(error.message);
  }
};
