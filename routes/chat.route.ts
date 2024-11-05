import express from "express";
import {
  activeChats,
  sendMessage,
  startChat,
} from "../controllers/chat.controller";

const router = express.Router();

router.post("/new", startChat);
router.post("/messages", activeChats);
router.post("/message/send", sendMessage);

export default router;
