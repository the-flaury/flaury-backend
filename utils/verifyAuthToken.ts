import jwt from "jsonwebtoken";
import User from "../models/user.models";

export const verifyAuthToken = async (token: string) => {
  const secret = process.env.JWT_SECRET!;

  try {
    const userId = jwt.verify(token, secret);
    const user = await User.findById(userId);
    if (!user) throw new Error("User not exist");
    return { success: true, message: {id: userId, user} };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
