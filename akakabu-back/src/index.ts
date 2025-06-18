import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createRequire } from "module";
import usersRouter from "./routes/users.js";
import loginRouter from "./routes/login.js";
import signupRouter from "./routes/signup.js";
import checkRouter from "./routes/check.js";
import jquantsRouter from "./routes/jquants_search.js";
import JRegisterRouter from "./routes/jquants_register.js";
import favoritesRouter from "./routes/favorit.js";

dotenv.config();
const app = express();
console.log("Loaded PORT:", process.env.PORT);
// const PORT = process.env.PORT || 3003;
const require = createRequire(import.meta.url);
const cookieParser = require("cookie-parser");

app.use(cors({
    origin: "https://akakabu.vercel.app",
    credentials: true,
}));

app.options("*", cors({
    origin: "https://akakabu.vercel.app",
    credentials: true,
  }));
  
// JSON を解析するミドルウェア
app.use(express.json());
app.use(cookieParser());

app.use("/",loginRouter)
app.use("/",usersRouter)
app.use("/",signupRouter)
app.use("/",checkRouter)
app.use("/jquants",jquantsRouter)
app.use("/jquants",JRegisterRouter)
app.use("/",favoritesRouter)

// サーバー起動
// app.listen(3003, '0.0.0.0', () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
export default app;