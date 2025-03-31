import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import userModel from "../database/models/user";
import dotenv from "dotenv"

dotenv.config();

const signUpSchema = z.object({
    name: z.string().min(3, "Name must be 3 characters long"),
    email: z.string().email("Invalid email format"),
    mobileNo: z.string().min(10, "Mobile number must be at least 10 digits"),
    isAdmin: z.boolean().optional().default(false),
    password: z.string().min(6, "Password must be atleast 6 character long")
});

const signInSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6)
});


export async function signUp(req: Request, res: Response) {
    try {
        const validatedData = signUpSchema.parse(req.body);
        const user = await userModel.findOne({ "email": validatedData.email });

        if (user) {
            res.status(400).json({
                "message": "User with same email address already exists !"
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        const newUser = new userModel({
            ...validatedData,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            "message": "User registered successfully !",
            "User": newUser
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error.errors);
            res.status(400).json({
                error: error.errors
            });
            return;
        }

        res.status(500).json({
            error: "Internal Server Error"
        })
        return;
    }
}

export async function signIn(req: Request, res: Response) {
    try {
        const validatedData = signInSchema.parse(req.body);

        const user = await userModel.findOne({ "email": validatedData.email });

        if (!user) {
            res.status(404).json({
                message: "No such user exists"
            })
            return;
        }

        if (!user.password) {
            res.status(401).json({
                message: "User password is not set"
            })
            return;
        }

        const isMatch = await bcrypt.compare(validatedData.password, user.password);

        if (!isMatch) {
            res.status(401).json({
                message: "Invalid email or password"
            })
            return;
        }
        const token = await jwt.sign(
            { userId: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET as string,
            { expiresIn: "1d" });

        res.status(200).json({
            message: "Login successful",
            token
        });

    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: error.errors
            })
            return;
        }

        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}