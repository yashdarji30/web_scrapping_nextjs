import mongoose from "mongoose";

let isConnected = false; // variable to track the connection status

export const connectToDB = async () =>{
    mongoose.set("strictQuery", true);

    if(!process.env.MONGOOSE_URI) return console.log("MONGOOSE_URI is not deffined");

    if(isConnected) return console.log("=> using existing database connection");

    try{
        await mongoose.connect(process.env.MONGOOSE_URI);
        isConnected = true;

        console.log('MongoDB connected');

    }catch(error){
        console.log(error);

    }
}