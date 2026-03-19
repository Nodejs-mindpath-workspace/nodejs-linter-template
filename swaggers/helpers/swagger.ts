import { Router } from "express";

import { existsSync, rmSync, writeFileSync } from "fs";
import { globSync } from "glob";
import HttpStatus from "http-status-codes";
import Joi, { Schema } from "joi";
import j2s from "joi-to-swagger";
import { join } from "path";
import SwaggerJSDoc from "swagger-jsdoc";

import constants from "@/swaggers/constants/constant";
import swaggerConstants from "@/swaggers/constants/swagger";
import commonJoiResponseSchema from "@/swaggers/defaultSchemas/response/common";
import logger from "@/swaggers/helpers/logger";
import { getRegisteredRoutes, isTrackedRouter, TrackedRouter } from "@/swaggers/helpers/routeRegistry";
import ISwaggerRoutePath from "@/swaggers/interfaces/routePath";
import IServeSwaggerOptions from "@/swaggers/interfaces/swaggerOptions";
import JoiRequestSchema from "@/swaggers/types/requestSchema";

export default class SwaggerHelper {
    private _requestSchemas: { [key: string]: unknown } = <{ [key: string]: unknown }>{};
    private _traversedTags: Array<string> = constants.ARRAY.EMPTY<string>();

    private async traverseFilesAndGetRouters(
        pathPattern: string,
        swaggerOptions: IServeSwaggerOptions,
        urlBasePath: string,
    ): Promise<void> {
        const paths: Array<string> = globSync(join(`${pathPattern}/**/*.js`).replace(/\\/g, "/"), {
            ignore: swaggerOptions.ignorePaths.map((p: string): string => p.replace(/\\/g, "/")),
        });
        const traversedRouters: Set<Router> = new Set<Router>();

        for (const path of paths) {
            const mod = await import(path);
            const router: Router =
                mod.default || mod.apiRoutes || mod.router || mod.assetsRoutes;

            if (!router) continue;
            if (traversedRouters.has(router)) continue;
            traversedRouters.add(router);

            // Prefer the registry-based approach (no Express `router.stack` introspection).
            // Fall back to stack traversal only for routers not created with createTrackedRouter.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let routes: Array<any>;
            if (isTrackedRouter(router)) {
                routes = this.traverseRoutesFromRegistry(
                    router,
                    swaggerOptions.saveSwaggerDocumentFilePath,
                    urlBasePath,
                );
            } else if ((router as any).stack) {
                routes = this.traverseAllRoutesWithSwaggerDoc(
                    router,
                    swaggerOptions.saveSwaggerDocumentFilePath,
                    urlBasePath,
                    traversedRouters,
                );
            } else {
                continue;
            }

            for (const route of routes)
                logger.info({
                    message: `traversed route  method =>> ${Object.keys(route.methods)[0]} route =>> ${route.path}`,
                });
        }
    }

    public getSwaggerSpecOptionDefinitions(
        swaggerOptions: IServeSwaggerOptions,
        pathPattern?: ISwaggerRoutePath,
    ): SwaggerJSDoc.Options {
        return {
            definition: {
                ...swaggerOptions.definition,
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
                components: swaggerOptions.definition?.components ?? {
                    schemas: <{ [key: string]: unknown }>{},
                },
                tags: [],
            },
            apis: [swaggerOptions.saveSwaggerDocumentFilePath],
        };
    }

    public async serveSwagger(swaggerOptions: IServeSwaggerOptions): Promise<void> {
        try {
            this._requestSchemas = constants.OBJECT.EMPTY();
            this._traversedTags = constants.ARRAY.EMPTY();

            // Remove any previously generated swagger doc file to prevent accumulation across restarts.
            if (existsSync(swaggerOptions.saveSwaggerDocumentFilePath)) {
                rmSync(swaggerOptions.saveSwaggerDocumentFilePath);
            }

            if (swaggerOptions.routePaths) {
                for (const pathPattern of swaggerOptions.routePaths) {
                    await this.traverseFilesAndGetRouters(
                        pathPattern.filePath,
                        swaggerOptions,
                        pathPattern.urlBasePath,
                    );
                }
            } else {
                await this.traverseFilesAndGetRouters(
                    swaggerOptions.apiRoutePath,
                    swaggerOptions,
                    swaggerOptions.apiBashPath,
                );
            }

            // eslint-disable-next-line @typescript-eslint/typedef
            const swaggerJSDoc = await import("swagger-jsdoc");

            const swaggerSpecDefinition: SwaggerJSDoc.Options = this.getSwaggerSpecOptionDefinitions(swaggerOptions);
            const { swagger: responseJoiSchema } = j2s(commonJoiResponseSchema.ALL);
            swaggerSpecDefinition.definition!.components.schemas = this._requestSchemas;
            swaggerSpecDefinition.definition!.components.schemas.ApiResponse = responseJoiSchema;

            const swaggerSpec: object = swaggerJSDoc.default(swaggerSpecDefinition);

            // SwaggerUI dynamic import
            // eslint-disable-next-line @typescript-eslint/typedef
            const swaggerUi = await import("swagger-ui-express");

            // Create new swagger UI instance for this app
            // eslint-disable-next-line @typescript-eslint/typedef
            const swaggerUiInstance = swaggerUi.setup(swaggerSpec, {
                explorer: true,
                customSiteTitle: `${swaggerOptions?.definition?.title} API Documentation`,
            });

            // Create unique swagger UI instance for this app
            swaggerOptions.app.use(swaggerOptions.swaggerDocPath, swaggerUi.serveFiles(swaggerSpec), swaggerUiInstance);
            logger.info({
                message: `Docs available on =>> ${swaggerOptions.serverOrigin}${swaggerOptions.swaggerDocPath}`,
            });
        } catch (error) {
            const convertedError: Error = <Error>error;
            logger.error({
                error,
                errorStack: convertedError.stack,
                message: convertedError.message,
            });
        }
    }

    public traverseAllRoutesWithSwaggerDoc(
        router: Router,
        saveSwaggerDocumentFilePath: string,
        basePath: string = "",
        traversedRouters: Set<Router> = new Set(),
    ): Array<unknown> {
        const routes: Array<unknown> = [];
        traversedRouters.add(router);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (<any>router).stack.forEach((middleware: any): void => {
            if (middleware.route) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                middleware.route.stack.forEach((layer: any): void => {
                    // Check if the middleware has the `schema` property
                    if (layer.handle.schema) {
                        const schema: JoiRequestSchema = layer.handle.schema;
                        const describe: string = this.defaultDescribe(
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
                    basePath + this.getPathFromRegex(<RegExp>(<unknown>middleware.regexp.source), middleware.keys);
                const tempRoutes: Array<unknown> = this.traverseAllRoutesWithSwaggerDoc(
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

    /**
     * Registry-based alternative to `traverseAllRoutesWithSwaggerDoc`.
     *
     * Reads the explicit route list recorded by `createTrackedRouter` so that route
     * discovery no longer depends on the internal Express `router.stack` property or
     * the brittle regex-to-path conversion in `getPathFromRegex`.
     *
     * Returns the same `{ path, methods }` shape as `traverseAllRoutesWithSwaggerDoc`
     * so callers are interchangeable.
     */
    public traverseRoutesFromRegistry(
        router: TrackedRouter,
        saveSwaggerDocumentFilePath: string,
        basePath: string = "",
    ): Array<{ path: string; methods: Record<string, boolean> }> {
        const routes: Array<{ path: string; methods: Record<string, boolean> }> = [];

        for (const entry of getRegisteredRoutes(router)) {
            const fullPath: string = basePath + entry.path;

            if (entry.schema) {
                const describe: string = this.defaultDescribe(entry.schema, fullPath, entry.method);

                if (!existsSync(join(saveSwaggerDocumentFilePath))) {
                    writeFileSync(join(saveSwaggerDocumentFilePath), describe);
                } else {
                    writeFileSync(join(saveSwaggerDocumentFilePath), `\n\n${describe}`, { flag: "a+" });
                }
            }

            routes.push({
                path: fullPath,
                methods: { [entry.method]: true },
            });
        }

        return routes;
    }

    public defaultDescribe(
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
        const pathParams: string = this.addPathOrQueryParam(schema.params, "path").trim();
        const queryParams: string = this.addPathOrQueryParam(schema.query, "query").trim();
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
        const group: string = this.getGroupFromPath(apiUrl);

        if (!this._traversedTags.includes(group)) {
            this._traversedTags.push(group);
        }

        if (haveRequestBody) {
            const { swagger: bodyParams } = j2s(schema.body);
            if (Object.keys(bodyParams).length) this._requestSchemas[schemaName] = bodyParams;
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
            if (Object.keys(bodyParams).length) this._requestSchemas[responseSchemaName] = bodyParams;
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

    public addPathOrQueryParam(schema: Schema, queryIn: string): string {
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
    public getPathFromRegex(regex: RegExp, keys: Array<any> = []): string {
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

    public getGroupFromPath(path: string): string {
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
