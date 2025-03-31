import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/user";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
// const password = encodeURIComponent("password_with_special_characters");
const MONGO_URL = process.env.MONGO_URL as string;


app.use('/api/v1/user', userRouter);


async function main(){
    try{
        await mongoose.connect(MONGO_URL);

        app.listen(PORT, () => {
            console.log(`Application running on PORT : ${PORT}`);
        });
    }
    catch(error){
        console.log(error instanceof Error ? error.message : "Unknown error");
    }
}

main();