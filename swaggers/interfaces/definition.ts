interface ISwaggerDefinition {
    [key: string]: unknown;
    title: string;
    version: string;
    description: string;
    license: {
        name: string;
    };
}

export default ISwaggerDefinition;
