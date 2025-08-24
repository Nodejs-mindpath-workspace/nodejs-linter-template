import ResponseSchemaRef from "@/swaggers/types/defaultSchemas/schemaRef";

type SwaggerConstants = {
    getSwaggerDescribeWithRequestBody: (req: {
        apiUrl: string;
        method: string;
        parameters: string;
        schemaName: string;
        successStatusCode: number;
        group: string;
        contentType: string;
        responseSchemaRef: string;
        responseSchemaRefs?: Array<ResponseSchemaRef>;
        description: string;
        summary: string;
    }) => string;
    getSwaggerWithoutRequestBody: (req: {
        apiUrl: string;
        method: string;
        parameters: string;
        successStatusCode: number;
        group: string;
        contentType: string;
        responseSchemaRef: string;
        responseSchemaRefs?: Array<ResponseSchemaRef>;
        description: string;
        summary: string;
    }) => string;
    getDefaultSwaggerDescribe: (req: {
        apiUrl: string;
        method: string;
        parameters: string;
        successStatusCode: number;
        group: string;
        contentType: string;
        responseSchemaRef: string;
        responseSchemaRefs?: Array<ResponseSchemaRef>;
        description: string;
        summary: string;
    }) => string;
};

export default SwaggerConstants;
