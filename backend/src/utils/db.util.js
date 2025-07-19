import mongoose from "mongoose";

export const connectDB = async () =>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log("Database connect successfully: "+ conn.connection.host);
    } catch (error) {
        console.log("Error in database controller", error.message);
    }
 
}