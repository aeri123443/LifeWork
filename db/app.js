import express from "express";
import "express-async-errors";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import scoreRouter from "./router/score.js";
import userRouter from "./router/user.js";
import { config } from "./config.js";
import { db } from "./db/database.js";

const app = express();

const corsOption = {
  credentials: true, // 서버에서 반응을 보낼 떄 해당 헤더가 있어야 JS로 반응을 전달
};

app.use(express.json());
//app.use(cookieParser);
app.use(helmet());
app.use(cors(corsOption));
app.use(morgan("tiny"));

app.use("/score", scoreRouter);
app.use("/user", userRouter);

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((error, req, res, next) => {
  console.error(error);
  res.sendStatus(500);
});

db.getConnection();
app.listen(config.host.port);
