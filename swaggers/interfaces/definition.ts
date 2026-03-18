export interface ISwaggerSecurityScheme {
    type: string;
    scheme?: string;
    bearerFormat?: string;
    flows?: { [key: string]: unknown };
    openIdConnectUrl?: string;
    in?: string;
    name?: string;
}

interface ISwaggerDefinition {
    [key: string]: unknown;
    title: string;
    version: string;
    description: string;
    license: {
        name: string;
    };
    components?: {
        securitySchemes?: { [schemeName: string]: ISwaggerSecurityScheme };
        schemas?: { [schemaName: string]: unknown };
        [key: string]: unknown;
    };
    security?: Array<{ [schemeName: string]: Array<string> }>;
}

export default ISwaggerDefinition;
