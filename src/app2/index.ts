import SwaggerHelper from "@/swaggers/helpers/swagger";
import IServeSwaggerOptions from "@/swaggers/interfaces/swaggerOptions";
import express, { Express } from "express";
import { join } from "path";
import app2Router from "./routes";

export const app2: Express = express();

app2.use("/api", app2Router);

// NOTE: Swagger integration for the APIs.
const swaggerOptions: IServeSwaggerOptions = {
    app: app2,
    swaggerDocPath: "/app2-docs",
    apiBashPath: "/app2/api",
    apiRoutePath: join(__dirname, "routes"),
    ignorePaths: [join(__dirname, "routes/**/*.d.ts"), join(__dirname, "routes/**/*.d.ts.map")],
    saveSwaggerDocumentFilePath: join(__dirname, "app2.swagger.js"),
    serverOrigin: `http://localhost:3000/app2`,
    routePaths: [
        {
            filePath: join(__dirname, "routes"),
            urlBasePath: "/api",
        },
    ],
    definition: {
        title: "app 2",
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
