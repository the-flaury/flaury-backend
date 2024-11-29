import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Sample route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Flaury!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
