import { query, type Request, type Response } from "express";
import { fireDB } from "../config/firebase.config";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase-admin/firestore";
import { verifyAuthToken } from "../utils/verifyAuthToken";

const db = fireDB;

export const startChat = async (req: Request, res: Response) => {
  const { sender, receiver, message } = req.body;

  try {
    // check if chat already exist
    const existingInboxRef = db
      .collection("inbox")
      .where("participants", "array-contains", [sender, receiver])
      .get();

    if (await existingInboxRef) throw new Error("Chat aready initiated");

    // create new inbox instance
    const inboxRef = await db.collection("inbox").add({
      participants: [sender, receiver],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // // verify inbox is created
    // if (inboxRef) throw new Error("Error initiating chat");

    // create chat instance
    const chatRef = await db.collection("messages").add({
      inboxId: inboxRef.id,
      sender,
      receiver,
      message,
      isRead: false,
      createdAt: Timestamp.now(),
    });

    // verify chat is created
    if (!chatRef.id) throw new Error("Error sending message");
    res
      .status(400)
      .json({ success: false, message: "Message sent successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const activeChats = async (req: Request, res: Response) => {
  try {
    const { authToken } = req.body;
    const response = await verifyAuthToken(authToken);
    if (!response.success) throw new Error(response.message);
    const user = response.message?.id;

    const chats = await db
      .collection("inbox")
      .where("participants", "array-contains", user);

    if (!chats) throw new Error("No previous chat found");

    res.status(200).json({ success: true, chats });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  const { message, sender, receiver, inboxId } = req.body;
  try {
    const verifyDuplicates = db
      .collection("messages")
      .where({ sender, message, receiver });

    if (verifyDuplicates) throw new Error("Oops! You already said that");

    const messageRef = await db.collection("messages").add({
      inboxId,
      sender,
      receiver,
      message,
      isRead: false,
      createdAt: Timestamp.now(),
    });

    if (!messageRef.id) throw new Error("Could not send message");

    res.status(200).json({ success: false, message: "Message sent" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const loadChats = async (req: Request, res: Response) => {
  const { inboxId } = req.body;
  try {
    const chats = db.collection("messages").where({ inboxId });

    if (!chats)
      res.status(404).json({ success: true, message: "No previous message" });

    res.status(200).json({ success: true, message: chats });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
