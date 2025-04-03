type SwaggerConstants = {
    getSwaggerDescribeWithRequestBody: (
        apiUrl: string,
        method: string,
        parameters: string,
        schemaName: string,
        successStatusCode: number,
        group: string,
        contentType: string,
        responseSchemaRef: string,
    ) => string;
    getSwaggerWithoutRequestBody: (
        apiUrl: string,
        method: string,
        parameters: string,
        successStatusCode: number,
        group: string,
        contentType: string,
        responseSchemaRef: string,
    ) => string;
    getDefaultSwaggerDescribe: (
        apiUrl: string,
        method: string,
        parameters: string,
        successStatusCode: number,
        group: string,
        contentType: string,
        responseSchemaRef: string,
    ) => string;
};

export default SwaggerConstants;
