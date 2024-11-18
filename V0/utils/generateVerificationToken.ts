import crypto from "crypto";

export default function generateVerificationToken(mix?: string) {
  const token: number | string = mix
    ? crypto.randomBytes(20).toString("hex")
    : Math.floor(Math.random() * 999999);
  return token;
}
