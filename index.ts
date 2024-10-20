import express from "express";
import authRouter from "./routes/auth.route";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);

app.listen(port, () => console.log("Listening on port", port));
