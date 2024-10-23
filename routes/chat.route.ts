import express from "express";
import { startChat } from "../controllers/chat.controller";

const router = express.Router();

router.post("/new", startChat);

export default router;
