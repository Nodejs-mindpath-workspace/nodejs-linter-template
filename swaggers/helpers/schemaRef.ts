import ResponseSchemaRef from "../types/defaultSchemas/schemaRef";

export default class SchemaRefHelper {
    public static getResponses(responseSchemaRefs: Array<ResponseSchemaRef>) {
        const transformedRefs: string[] = responseSchemaRefs.map((responseSchemaRef) => {
            return `
*       '${responseSchemaRef.statusCode}':
*         description: ${responseSchemaRef.description ?? `Success Response`}
*         content:
*           ${responseSchemaRef.contentType}:
*             schema:
*               $ref: '${responseSchemaRef.responseSchemaRef}'
`;

            return `
*         description: ${responseSchemaRef.description}
*         content:
*           ${responseSchemaRef.contentType}:
*             schema:
*               $ref: '${responseSchemaRef.responseSchemaRef}'
            `;
        });

        if (!responseSchemaRefs.some((ref: ResponseSchemaRef) => ref.statusCode === 400)) {
            transformedRefs.push(`
*       '400':
*         description: Bad request
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ApiResponse'
*             example:
*               status: 400
*               success: "fail"
*               data: { error: "" }
                `);
        }

        if (responseSchemaRefs.some((ref: ResponseSchemaRef) => ref.statusCode >= 400 && ref.statusCode <= 599)) {
            transformedRefs.push(`
*       'error':
*         description: Error Message
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ApiResponse'
*             example:
*               status: 400-500
*               success: "fail"
*               data: { error: "" }
                `);          
        }
        return `
*     responses:
${transformedRefs.join("\n")}
`;
    }
}
