import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.models";
import generateVerificationToken from "../utils/generateVerificationToken";
import { daysFromNow } from "../utils/dateTime.utils";
import { generateAuthTokenAndCookie } from "../utils/generateAuthTokenAndCookie";
import { sendVerificationEmail } from "../mailtrap/emails";

export const register = async (req: Request, res: Response) => {
  const { email, name, password, accountType } = req.body;

  try {
    if (!email || !name || !password) {
      throw new Error("Please fill out required fields");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error("Account already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = generateVerificationToken();
    const verificationTokenExpiresAt = daysFromNow(1);

    const user = new User({
      email,
      name,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt,
      accountType,
    });

    await user.save();

    generateAuthTokenAndCookie(user._id, res);
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      user: { ...user._doc, password: undefined },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const verifyEmail = async (req: Request, res: Response) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) throw new Error("Invalid or expired verification code");

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    res
      .status(200)
      .json({ success: true, message: "Email verification successful" });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    console.log("Finding user...");
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Could not find a user with the given email");
    }

    console.log("Comparing password...");
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      throw new Error("Incorrect Password");
    }

    generateAuthTokenAndCookie(user._id, res);
    user.lastLogin = new Date();
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Authentication successful!" });
  } catch (error: any) {
    console.error("Error during login:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("auth-token");
    res
      .status(200)
      .json({ success: true, message: "Account has been logged out!" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Account does not exist");

    user.resetPasswordToken = generateVerificationToken("mix");
    user.resetPasswordExpiresAt = daysFromNow(1);

    await user.save();
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() },
    });
    if (!user) throw new Error("Invalid password reset token");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: "Could not reset password" });
  }
};
