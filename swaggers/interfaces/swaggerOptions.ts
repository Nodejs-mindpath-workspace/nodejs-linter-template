import ISwaggerDefinition from "@/swaggers/interfaces/definition";
import ISwaggerRoutePath from "@/swaggers/interfaces/routePath";

interface IServeSwaggerOptions {
    apiRoutePath: string;
    ignorePaths: Array<string>;
    saveSwaggerDocumentFilePath: string;
    apiBashPath: string;
    serverOrigin: string;
    routePaths?: Array<ISwaggerRoutePath>;
    definition?: ISwaggerDefinition;
}

export default IServeSwaggerOptions;
