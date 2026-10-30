import mongoose from "mongoose";
import "dotenv/config" 

export const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("mongo connected lol")
    }
    catch(error){
        console.log("error in mongo connection uff:", error)
        throw error }}
  