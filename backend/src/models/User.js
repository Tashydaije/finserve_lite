import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 8
        },
        profilePhoto: {
            type: String,
            default: "" //store a url/path
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

//pre-save hook - hash password before saving
// using normal function here(not arrow) so that "this === the Mongoose document being saved"
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return; //checks if password was updated to avoid hashing the password when user updates other fields.

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//instance method added for password comparison
userSchema.methods.comparePassword = async (candidatePassword) => {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);