import mongoose from "mongoose";
import "dotenv/config" 


// also this console log executes when we run nodemon src/index.js as
//  Code placed at the top level of any imported file 
// will always run as a side effect when that file is imported 



// console.log(process.env.PORT)  // .env problem as this searches for .env insdie db     
                                // but it shows when u run "node src/index.js"
                                //  because .env  does not care where the JS file lives—it only cares 
                                // where you are standing in the terminal when you type node ....

export const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("mongo connected lol")
    }
    catch(error){
        console.log("error in mongo connection uff:", error)
        throw error //this is to throw the error to the catch() in src/index 
                    // if it wasnt thrown the catch() there wont be executed as 
                    // it would count as resolved if we didnt rethrow error here
    }
}
  