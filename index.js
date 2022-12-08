import express from "express";
import * as dotenv from "dotenv";
import connect from "./config/db.config.js";
import cors from "cors";
import userRoute from "./routes/user.routes.js";
import uploadRoute from "./routes/uploadImage.routes.js";
import taskRoute from "./routes/task.routes.js";
import logRoute from "./routes/log.routes.js";

dotenv.config();

//conectar com o banco de dados
connect();

const app = express();
app.use(express.json());

app.use(cors());

//rotas
app.use("/user", userRoute);
app.use("/uploadImage", uploadRoute);
app.use("/task", taskRoute);
app.use("/log", logRoute);

app.listen(process.env.PORT, () => {
  console.log(
    `Server up and running on port: http://localhost:${process.env.PORT}`
  );
});
