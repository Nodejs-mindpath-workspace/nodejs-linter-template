import { ILayer, Router, RequestHandler } from "express-serve-static-core/index";

import { existsSync, writeFileSync } from "fs";
import { globSync } from "glob";
import HttpStatus from "http-status-codes";
import j2s from "joi-to-swagger";
import Joi, { Schema } from "joi";
import { join } from "path";
import swaggerUi from "swagger-ui-express";
import SwaggerJSDoc from "swagger-jsdoc";

import constants from "../constants/constant";
import swaggerConstants from "../constants/swagger";
import commonJoiResponseSchema from "../defaultSchemas/response/common";
import logger from "./logger";
import ISwaggerRoutePath from "../interfaces/routePath";
import IServeSwaggerOptions from "../interfaces/swaggerOptions";
import JoiRequestSchema from "../types/requestSchema";

const requestSchemas: { [key: string]: unknown } = <{ [key: string]: unknown }>{};
const traversedTags: Array<string> = constants.ARRAY.EMPTY<string>();

export default class SwaggerHelper {
    private static async traverseFilesAndGetRouters(
        pathPattern: string,
        swaggerOptions: IServeSwaggerOptions,
        urlBasePath: string,
    ): Promise<void> {
        const paths: Array<string> = globSync(join(`${pathPattern}/**/*.js`).replace(/\\/g, "/"), {
            ignore: swaggerOptions.ignorePaths.map((p: string): string => p.replace(/\\/g, "/")),
        });
        const traversedRouters: Set<Router> = new Set<Router>();
        const swaggerSpecDefinition: SwaggerJSDoc.Options =
            SwaggerHelper.getSwaggerSpecOptionDefinitions(swaggerOptions);

        for (const path of paths) {
            const router: Router =
                (await import(path)).default ||
                (await import(path)).apiRoutes ||
                (await import(path)).router ||
                (await import(path)).assetsRoutes;

            if (router?.stack) {
                if (traversedRouters.has(router)) continue;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const routes: Array<any> = SwaggerHelper.traverseAllRoutesWithSwaggerDoc(
                    router,
                    swaggerOptions.saveSwaggerDocumentFilePath,
                    urlBasePath,
                    traversedRouters,
                );

                for (const route of routes)
                    console.log(`traversed route  method =>> ${Object.keys(route.methods)[0]} route =>> ${route.path}`);
            }

            const { swagger: responseJoiSchema } = j2s(commonJoiResponseSchema.ALL);
            swaggerSpecDefinition.definition!.components.schemas = requestSchemas;
            swaggerSpecDefinition.definition!.components.schemas.ApiResponse = responseJoiSchema;
            const swaggerSpec: object = SwaggerJSDoc(swaggerSpecDefinition);
            router.use(
                "/docs",
                <Array<RequestHandler>>swaggerUi.serve,
                <RequestHandler>swaggerUi.setup(swaggerSpec, { explorer: true }),
            );
            logger.info(`Docs available on =>> ${swaggerOptions.serverOrigin}/api/docs`);
        }
    }

    public static getSwaggerSpecOptionDefinitions(
        swaggerOptions: IServeSwaggerOptions,
        pathPattern?: ISwaggerRoutePath,
    ): SwaggerJSDoc.Options {
        return {
            definition: {
                openapi: "3.0.0",
                info: {
                    title: swaggerOptions.definition?.title ?? "API Documentation",
                    version: swaggerOptions.definition?.version ?? "0.1.0",
                    description:
                        swaggerOptions.definition?.description ?? "This is API documentation for all the created API",
                    license: {
                        name: swaggerOptions.definition?.license?.name ?? "Organisation",
                    },
                },
                servers: [
                    {
                        url: pathPattern?.urlBasePath ?? swaggerOptions.serverOrigin,
                    },
                ],
                components: {
                    schemas: <{ [key: string]: unknown }>{},
                },
                tags: [],
            },
            apis: [swaggerOptions.saveSwaggerDocumentFilePath],
        };
    }

    public static async serveSwagger(swaggerOptions: IServeSwaggerOptions): Promise<void> {
        try {
            if (swaggerOptions.routePaths) {
                for (const pathPattern of swaggerOptions.routePaths) {
                    await SwaggerHelper.traverseFilesAndGetRouters(
                        pathPattern.filePath,
                        swaggerOptions,
                        pathPattern.urlBasePath,
                    );
                }
            } else {
                await SwaggerHelper.traverseFilesAndGetRouters(
                    swaggerOptions.apiRoutePath,
                    swaggerOptions,
                    swaggerOptions.apiBashPath,
                );
            }
        } catch (error) {
            logger.error(error);
        }
    }

    public static traverseAllRoutesWithSwaggerDoc(
        router: Router,
        saveSwaggerDocumentFilePath: string,
        basePath: string = "",
        traversedRouters: Set<Router> = new Set(),
    ): Array<unknown> {
        const routes: Array<unknown> = [];
        traversedRouters.add(router);
        router.stack.forEach((middleware: ILayer): void => {
            if (middleware.route) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                middleware.route.stack.forEach((layer: any): void => {
                    // Check if the middleware has the `schema` property
                    if (layer.handle.schema) {
                        const schema: JoiRequestSchema = layer.handle.schema;
                        const describe: string = SwaggerHelper.defaultDescribe(
                            schema,
                            basePath + middleware.route!.path,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            Object.keys((<any>middleware.route!).methods)[0],
                        );

                        if (!existsSync(join(saveSwaggerDocumentFilePath))) {
                            writeFileSync(join(saveSwaggerDocumentFilePath), describe);
                        } else {
                            writeFileSync(join(saveSwaggerDocumentFilePath), `\n\n${describe}`, { flag: "a+" });
                        }
                    }
                });

                routes.push({
                    path: basePath + middleware.route.path,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    methods: (<any>middleware.route).methods,
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } else if (middleware.name === "router" && (<any>middleware.handle).stack) {
                // If it's another router, recurse into it
                const path: string =
                    basePath +
                    SwaggerHelper.getPathFromRegex(<RegExp>(<unknown>middleware.regexp.source), middleware.keys);
                const tempRoutes: Array<unknown> = SwaggerHelper.traverseAllRoutesWithSwaggerDoc(
                    <Router>(<unknown>middleware.handle),
                    saveSwaggerDocumentFilePath,
                    path,
                    traversedRouters,
                );
                if (tempRoutes) routes.push(...tempRoutes);
            }
        });

        return routes;
    }

    public static defaultDescribe(
        schema: {
            params: Schema;
            body: Schema;
            query: Schema;
            responseBody?: {
                contentType: string;
                body: Schema;
            };
        },
        apiUrl: string,
        method: string,
    ): string {
        const pathParams: string = SwaggerHelper.addPathOrQueryParam(schema.params, "path").trim();
        const queryParams: string = SwaggerHelper.addPathOrQueryParam(schema.query, "query").trim();
        const schemaName: string = `${apiUrl.replace(/:|-/g, "").replace(/\//g, "").concat(method)}`;

        let successStatusCode: number;
        let contentType: string = "application/json";
        let responseSchemaRef: string = "#/components/schemas/ApiResponse";

        switch (method) {
            case "get":
                successStatusCode = HttpStatus.OK;
                break;

            case "post":
                successStatusCode = HttpStatus.CREATED;
                break;

            default:
                successStatusCode = HttpStatus.ACCEPTED;
                break;
        }

        let parameters: string = "";
        const haveRequestBody: boolean = schema.body && Object.keys(schema.body.describe().keys).length !== 0;
        const haveResponseBody: false | Joi.AnySchema<unknown> = schema.responseBody?.body ?? false;
        const group: string = SwaggerHelper.getGroupFromPath(apiUrl);

        if (!traversedTags.includes(group)) {
            traversedTags.push(group);
        }

        if (haveRequestBody) {
            const { swagger: bodyParams } = j2s(schema.body);
            if (Object.keys(bodyParams).length) requestSchemas[schemaName] = bodyParams;
        }

        if (pathParams && queryParams) {
            parameters = `*     parameters:
${pathParams}  
${queryParams}`;
        } else if (pathParams && !queryParams) {
            parameters = `*     parameters:
${pathParams}`;
        } else if (!pathParams && queryParams) {
            parameters = `*     parameters:
${queryParams}`;
        }

        if (haveResponseBody && schema.responseBody) {
            const { swagger: bodyParams } = j2s(schema.responseBody?.body);
            const responseSchemaName: string = schemaName.concat("response");
            if (Object.keys(bodyParams).length) requestSchemas[responseSchemaName] = bodyParams;
            contentType = schema.responseBody.contentType;
            responseSchemaRef = `#/components/schemas/${responseSchemaName}`;
        }

        if (method === "get" || !haveRequestBody) {
            return swaggerConstants.getSwaggerWithoutRequestBody(
                apiUrl,
                method,
                parameters,
                successStatusCode,
                group,
                contentType,
                responseSchemaRef,
            );
        } else if (haveRequestBody) {
            return swaggerConstants.getSwaggerDescribeWithRequestBody(
                apiUrl,
                method,
                parameters,
                schemaName,
                successStatusCode,
                group,
                contentType,
                responseSchemaRef,
            );
        } else {
            return swaggerConstants.getDefaultSwaggerDescribe(
                apiUrl,
                method,
                parameters,
                successStatusCode,
                group,
                contentType,
                responseSchemaRef,
            );
        }
    }

    public static addPathOrQueryParam(schema: Schema, queryIn: string): string {
        let describe: string = "";
        const { swagger: requestValidation } = j2s(schema);
        const required: boolean = queryIn === "path";

        if (requestValidation.properties) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const [key, value] of Object.entries(<{ [key: string]: any }>requestValidation.properties)) {
                const pathParam: string = `*       - in: ${queryIn}
*         name: ${key}
*         required: ${required}
*         schema:
*           type: ${value.type}`;
                describe += `\n${pathParam}`;
            }
        }

        return describe;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static getPathFromRegex(regex: RegExp, keys: Array<any> = []): string {
        let replaceWith: string = ":id";
        if (Array.isArray(keys) && keys.length) {
            if (keys[0].name && !keys[0].optional) replaceWith = `:${keys[0].name}`;
        }
        return regex
            .toString()
            .replace(/\^\\/g, "") // Remove start marker '/^'
            .replace(/\/\?/g, "")
            .replace(/\\\(\?=\\\/\|\$\)/g, "") // Replace \(?=\/|$) with empty string.
            .replace(/\?:\(\[\/\]\+\?\)\)/g, replaceWith) // Replace ?:([/]+?)) groups with placeholder.
            .replace(/\(/g, "") // Replace the opening ( mark.
            .replace(/\^\?:\\\/\[\^\/\]\+\?\)\)/g, `/${replaceWith}`); // Replace ^?:\/[^/]+?)) groups with placeholder.
    }

    public static getGroupFromPath(path: string): string {
        // Normalize the path by removing leading and trailing slashes
        const normalizedPath: string = path.replace(/^\/+|\/+$/g, "");

        // Split the path into segments
        const segments: Array<string> = normalizedPath.split("/");

        // Extract the group based on the first segment after optional prefixes
        // You can adjust the logic to handle different patterns or prefixes
        // For example, skip the first segment if it is 'v1' or api.
        const group: string | undefined = segments.find(
            (segment: string): boolean => !/api/.test(segment) && !/v\d+/.test(segment),
        );
        return group ?? "default";
    }
}
