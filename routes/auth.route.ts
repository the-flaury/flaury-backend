import express from "express";
import { logout, signin, register } from "../controllers/auth.controller";

const router = express.Router();

router.post("/signup", register);
router.post("/signin", signin);
router.post("/logout", logout);

export default router;
