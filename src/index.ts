import "dotenv/config";
import "module-alias/register";

import express from "express";

import helmet from "helmet";
import morgan from "morgan";
import { join } from "path";

import logger from "@/swaggers/helpers/logger";
import SwaggerHelper from "@/swaggers/helpers/swagger";
import IServeSwaggerOptions from "@/swaggers/interfaces/swaggerOptions";

const app: express.Express = express();
const port: number = 3000;

// middleware
app.use(helmet.hsts({ maxAge: 123456 }));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(morgan("dev"));

// NOTE: Swagger integration for the APIs.Ø
const swaggerOptions: IServeSwaggerOptions = {
    apiBashPath: "/api",
    apiRoutePath: join(__dirname, "routes"),
    ignorePaths: [join(__dirname, "routes/**/*.d.ts"), join(__dirname, "routes/**/*.d.ts.map")],
    saveSwaggerDocumentFilePath: join(__dirname, "swagger.js"),
    serverOrigin: `http://localhost:3000`,
    routePaths: [
        {
            filePath: join(__dirname, "routes"),
            urlBasePath: "/api",
        },
    ],
    definition: {
        title: "<Server name>",
        description: "",
        version: "1.0.0",
        license: {
            name: "<Organization name>",
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
};
SwaggerHelper.serveSwagger(swaggerOptions);

app.listen(port, (): void => {
    try {
        logger.info(`Server is listening, http://localhost:${port}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
});
