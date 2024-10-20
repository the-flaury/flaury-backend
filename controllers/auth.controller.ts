import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.models";
import generateVerificationToken from "../utils/generateVerificationToken";
import { connectMongoDB } from "../utils/mongodb";
import { daysFromNow } from "../utils/dateTime.utils";
import { generateAuthTokenAndCookie } from "../utils/generateAuthTokenAndCookie";
import { sendVerificationEmail } from "../mailtrap/emails";

export const register = async (req: Request, res: Response) => {
  const { email, name, password, accountType } = req.body;

  console.log({ req: req.body });

  connectMongoDB();
  try {
    if (!email || !name || !password)
      throw new Error("Please fill out required fields");

    const userExists = await User.findOne({ email });
    if (userExists) throw new Error("Account already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = generateVerificationToken();
    const verificationTokenExpiresAt = daysFromNow(1);
    console.log({ verificationTokenExpiresAt });

    const user = new User({
      email,
      name,
      password: hashedPassword,
      verificationToken,
      accountType,
    });

    user.save();

    generateAuthTokenAndCookie(user._id, res);
    await sendVerificationEmail(email, verificationToken);

    return res.json({
      success: true,
      message: "Account created successfully!",
      user: { ...user._doc, password: undefined },
    });
  } catch (error: any) {
    console.log({ error });
    return res.status(400).json({ success: false, message: error?.message });
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
    const user = await User.findOne({ email });
    if (!user) throw new Error("Could not finding a user with the given email");

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) throw new Error("Incorrect Password");
    generateAuthTokenAndCookie(user._id, res);
    user.lastLogin = new Date();

    user.save();

    res
      .status(200)
      .json({ success: true, message: "Authentication successful!" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {};
