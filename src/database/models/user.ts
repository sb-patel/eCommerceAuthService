import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String, require: true },
        email: { type: String, require: true, unique: true },
        mobileNo: { type: String, require: true },
        isAdmin: { type: Boolean, default: false },
        password: { type: String, require: true }
    },
    {
        timestamps: true
    }
);

const userModel = mongoose.model("User", UserSchema);

export default userModel;