import { initializeApp, firestore, credential } from "firebase-admin";

const credentialPath = "./firebase-key.json";

export const app = initializeApp({
  credential: credential.cert(credentialPath),
});

export const fireDB = firestore();
