import { firestore, credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";

const credentialPath = "./firebase-key.json";

export const app = initializeApp({
  credential: credential.cert(credentialPath),
});

export const fireDB = new Firestore();
