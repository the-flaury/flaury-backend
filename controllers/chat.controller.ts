import { query, type Request, type Response } from "express";
import { fireDB } from "../config/firebase.config";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase-admin/firestore";

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
