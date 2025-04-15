import mongoose, { mongo } from "mongoose";

const connectToDatabase = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ MongoDB connected");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
    }
    
}

export default connectToDatabase