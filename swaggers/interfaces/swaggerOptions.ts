import { Express } from "express";

import ISwaggerDefinition from "@/swaggers/interfaces/definition";
import ISwaggerRoutePath from "@/swaggers/interfaces/routePath";

interface IServeSwaggerOptions {
    app: Express; // Add this new property
    swaggerDocPath: string;
    apiRoutePath: string;
    ignorePaths: Array<string>;
    saveSwaggerDocumentFilePath: string;
    apiBashPath: string;
    serverOrigin: string;
    routePaths?: Array<ISwaggerRoutePath>;
    definition?: ISwaggerDefinition;
}

export default IServeSwaggerOptions;
