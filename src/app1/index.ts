import express, { Express } from "express";
import app1Router from "./routes";
import SwaggerHelper from "@/swaggers/helpers/swagger";
import IServeSwaggerOptions from "@/swaggers/interfaces/swaggerOptions";
import { join } from "path";

export const app1: Express = express();

app1.use("/api", app1Router);

// NOTE: Swagger integration for the APIs.
const swaggerOptions: IServeSwaggerOptions = {
    app: app1,
    swaggerDocPath: "/app1-docs",
    apiBashPath: "/app1/api",
    apiRoutePath: join(__dirname, "routes"),
    ignorePaths: [join(__dirname, "routes/**/*.d.ts"), join(__dirname, "routes/**/*.d.ts.map")],
    saveSwaggerDocumentFilePath: join(__dirname, "app1.swagger.js"),
    serverOrigin: `http://localhost:3000/app1`,
    routePaths: [
        {
            filePath: join(__dirname, "routes"),
            urlBasePath: "/api",
        },
    ],
    definition: {
        title: "app 1",
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
(async (): Promise<void> => {
    await new SwaggerHelper().serveSwagger(swaggerOptions);
})();
