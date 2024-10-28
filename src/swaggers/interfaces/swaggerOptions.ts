import ISwaggerDefinition from "./definition";
import ISwaggerRoutePath from "./routePath";

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
