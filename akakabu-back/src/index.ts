import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createRequire } from "module";
import { searchRouter } from "./routes/jquants_search.js";
import { JRegisterRouter } from "./routes/jquants_register.js";
import { favoritesRouter } from "./routes/favorit.js";
import { usersRouter } from "./routes/users.js";


dotenv.config();
const app = express();
console.log("Loaded PORT:", process.env.PORT);
const PORT = Number(process.env.PORT) || 10000;
const require = createRequire(import.meta.url);
const cookieParser = require("cookie-parser");

app.use(cors({
    origin: "https://www.akakabu-project.com",
    credentials: true,
}));

app.options("*", cors({
    origin: "https://www.akakabu-project.com",
    credentials: true,
  }));

// JSON を解析するミドルウェア
app.use(express.json());
app.use(cookieParser());

app.use("/api/jquants", searchRouter);
app.use("/api/jquants", JRegisterRouter);
app.use("/api", favoritesRouter);
app.use("/api", usersRouter);

// サーバー起動
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});