"use server";

import { revalidatePath } from "next/cache";
import User, { IUser } from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import bcrypt from "bcrypt";

declare type CreateUserParams = {
  email: string;
  fullName?: string;
  photo?: string;
  password: string;
  userType: "student" | "teacher";
};

declare type UpdateUserParams = {
  fullName?: string;
  username?: string;
  photo?: string;
};

export async function validateUserType(userType: string) {
  if (!["teacher", "student"].includes(userType)) {
    throw new Error("Invalid userType. Must be 'teacher' or 'student'");
  }
}

export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    const hashedPassword = await bcrypt.hash(user.password, 10);
    // Explicitly construct the user object to ensure userType is included
    const userData = {
      email: user.email,
      fullName: user.fullName,
      photo: user.photo,
      password: hashedPassword,
      userType: user.userType,
    };
    // Debug: Log user data before creation
    console.log("User data to create:", userData);
    const newUser = await User.create(userData);
    const userObject = newUser.toObject();
    // Debug: Log created user
    console.log("Created user:", userObject);
    return userObject;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getUserById(userId: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ userId }).lean<IUser>();
    if (!user) throw new Error("User not found");
    return user;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ email }).lean<IUser>();
    if (!user) throw new Error("User not found");
    return user;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function updateUser(userId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();
    const updatedUser = await User.findOneAndUpdate({ userId }, user, {
      new: true,
    }).lean<IUser>();
    if (!updatedUser) throw new Error("User update failed");
    return updatedUser;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    await connectToDatabase();
    const userToDelete = await User.findOne({ userId }).lean<IUser>();
    if (!userToDelete) {
      throw new Error("User not found");
    }
    const deletedUser = await User.findByIdAndDelete(
      userToDelete._id
    ).lean<IUser>();
    revalidatePath("/");
    return deletedUser;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();
    const updatedUserCredits = await User.findOneAndUpdate(
      { userId },
      { $inc: { creditBalance: creditFee } },
      { new: true }
    ).lean<IUser>();
    if (!updatedUserCredits) throw new Error("User credits update failed");
    return updatedUserCredits;
  } catch (error) {
    handleError(error);
    throw error;
  }
}
export async function getAllUsers() {
  try {
    await connectToDatabase();
    const users = await User.find({}).lean<IUser[]>();
    return users;
  } catch (error) {
    handleError(error);
    throw error;
  }
}
export async function getUsersByType(userType: "teacher" | "student") {
  try {
    await connectToDatabase();
    const users = await User.find({ userType }).lean<IUser[]>();
    return users;
  } catch (error) {
    handleError(error);
    throw error;
  }
}
export async function getUserByUsername(username: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ username }).lean<IUser>();
    if (!user) throw new Error("User not found");
    return user;
  } catch (error) {
    handleError(error);
    throw error;
  }
}
export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    await connectToDatabase();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { password: hashedPassword },
      { new: true }
    ).lean<IUser>();
    if (!updatedUser) throw new Error("User password update failed");
    return updatedUser;
  } catch (error) {
    handleError(error);
    throw error;
  }
}
