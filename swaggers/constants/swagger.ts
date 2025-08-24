import SchemaRefHelper from "@/swaggers/helpers/schemaRef";
import SwaggerConstants from "@/swaggers/types/constants/swagger";
import ResponseSchemaRef from "@/swaggers/types/defaultSchemas/schemaRef";

const swaggerConstants: SwaggerConstants = {
    getSwaggerDescribeWithRequestBody: (request: {
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
    }): string => {
        const {
            apiUrl,
            group,
            method,
            parameters,
            schemaName,
            successStatusCode,
            contentType,
            responseSchemaRef,
            responseSchemaRefs,
            description,
            summary
        } = request;
        return `/**
* @swagger
* ${apiUrl.replace(/:(\w+)/g, "{$1}")}:
*   ${method}:
*     summary: ${summary}
*     description: ${description}
*     tags:
*       - ${group}
${parameters}
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/${schemaName}'
${SchemaRefHelper.getResponses(responseSchemaRefs ?? [{ contentType, statusCode: successStatusCode, responseSchemaRef, description: "Success Message" }])}
*/`;
    },
    getSwaggerWithoutRequestBody: (request: {
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
    }): string => {
        const {
            apiUrl,
            method,
            parameters,
            successStatusCode,
            group,
            contentType,
            responseSchemaRef,
            responseSchemaRefs,
            description,
            summary,
        } = request;
        return `/**
* @swagger
* ${apiUrl.replace(/:(\w+)/g, "{$1}")}:
*   ${method}:
*     summary: ${summary}
*     description: ${description}
*     tags:
*       - ${group}
${parameters}
${SchemaRefHelper.getResponses(responseSchemaRefs ?? [{ contentType, statusCode: successStatusCode, responseSchemaRef, description: "Success Message" }])}
*/`;
    },
    getDefaultSwaggerDescribe: (request: {
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
    }): string => {
        const {
            apiUrl,
            method,
            parameters,
            successStatusCode,
            group,
            contentType,
            responseSchemaRef,
            responseSchemaRefs,
            summary,
            description,
        } = request;
        return `/**
* @swagger
* ${apiUrl.replace(/:(\w+)/g, "{$1}")}:
*   ${method}:
*     summary: ${summary}
*     description: ${description}
*     tags:
*       - ${group}
${parameters}
${SchemaRefHelper.getResponses(responseSchemaRefs ?? [{ contentType, statusCode: successStatusCode, responseSchemaRef, description: "Success Message" }])}
*/`;
    },
};

export default swaggerConstants;
