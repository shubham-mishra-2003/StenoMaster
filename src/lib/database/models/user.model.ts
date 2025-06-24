import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";

const UserSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(),
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  photo: {
    type: String,
  },
  fullName: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = models?.User || model("User", UserSchema);

export default User;
