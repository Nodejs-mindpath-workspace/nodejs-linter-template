import SwaggerConstants from "@/swaggers/types/constants/swagger";

const swaggerConstants: SwaggerConstants = {
    getSwaggerDescribeWithRequestBody: (
        apiUrl: string,
        method: string,
        parameters: string,
        schemaName: string,
        successStatusCode: number,
        group: string,
        contentType: string,
        responseSchemaRef: string,
    ): string => {
        return `/**
* @swagger
* ${apiUrl.replace(/:(\w+)/g, "{$1}")}:
*   ${method}:
*     summary: ${group}
*     description: ${group}
*     tags:
*       - ${group}
${parameters}
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/${schemaName}'
*     responses:
*       '${successStatusCode}':
*         description: Success response
*         content:
*           ${contentType}:
*             schema:
*               $ref: '${responseSchemaRef}'
*       '400':
*         description: Bad request
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ApiResponse'
*             example:
*               status: 400
*               success: "fail"
*               data: null
*/`;
    },
    getSwaggerWithoutRequestBody: (
        apiUrl: string,
        method: string,
        parameters: string,
        successStatusCode: number,
        group: string,
        contentType: string,
        responseSchemaRef: string,
    ): string => {
        return `/**
* @swagger
* ${apiUrl.replace(/:(\w+)/g, "{$1}")}:
*   ${method}:
*     summary: ${group}
*     description: ${group}
*     tags:
*       - ${group}
${parameters}
*     responses:
*       '${successStatusCode}':
*         description: Success response
*         content:
*           ${contentType}:
*             schema:
*               $ref: '${responseSchemaRef}'
*       '400':
*         description: Bad request
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ApiResponse'
*             example:
*               status: 400
*               success: "fail"
*               data: null
*/`;
    },
    getDefaultSwaggerDescribe: (
        apiUrl: string,
        method: string,
        parameters: string,
        successStatusCode: number,
        group: string,
        contentType: string,
        responseSchemaRef: string,
    ): string => {
        return `/**
* @swagger
* ${apiUrl.replace(/:(\w+)/g, "{$1}")}:
*   ${method}:
*     summary: ${group}
*     description: ${group}
*     tags:
*       - ${group}
${parameters}
*     responses:
*       '${successStatusCode}':
*         description: Success response
*         content:
*           ${contentType}:
*             schema:
*               $ref: '${responseSchemaRef}'
*       '400':
*         description: Bad request
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ApiResponse'
*             example:
*               status: 400
*               success: "fail"
*               data: null
*/`;
    },
};

export default swaggerConstants;
