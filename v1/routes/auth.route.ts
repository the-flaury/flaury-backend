import express from "express";
import {
  logout,
  signin,
  register,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/signup", register);
router.post("/login", signin);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", resetPassword);

export default router;
