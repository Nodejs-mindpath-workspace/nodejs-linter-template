import "dotenv/config";
import "module-alias/register";

import express from "express";

import helmet from "helmet";
import morgan from "morgan";

import logger from "@/swaggers/helpers/logger";
import { app1 } from "./app1";
import { app2 } from "./app2";

const app: express.Express = express();
const port: number = 3000;

// middleware
app.use(helmet.hsts({ maxAge: 123456 }));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(morgan("dev"));

app.use("/app1", app1);
app.use("/app2", app2);

app.listen(port, (): void => {
    try {
        logger.info(`Server is listening, http://localhost:${port}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
});
