import type { Response } from "express";
import jwt from "jsonwebtoken";
import { days } from "./dateTime.utils";

const secret = process.env.JWT_SECRET!;

export async function generateAuthTokenAndCookie(
  userId: string,
  res: Response
) {
  const token = jwt.sign(userId, secret, {
    expiresIn: "7d",
  });

  res.cookie("auth-token", token, {
    maxAge: days(7),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}
