import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            default: null,
        },
        googleId: {
            type: String,
            default: null,
            sparse: true,
        },
        avatar: {
            type: String,
            default: null,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        refreshTokens: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true, }
);
    
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.refreshTokens;
    delete obj.__v;
    return obj;
};

const User = mongoose.model("User", userSchema);

export default User;