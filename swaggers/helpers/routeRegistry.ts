import { Router } from "express";

import JoiRequestSchema from "@/swaggers/types/requestSchema";

export interface IRegisteredRoute {
    path: string;
    method: string;
    schema?: JoiRequestSchema;
}

/**
 * A TrackedRouter is a standard Express Router extended with a `_registeredRoutes` list
 * that is populated at route-definition time instead of being recovered at runtime from
 * the internal `router.stack` property.
 */
export type TrackedRouter = Router & {
    _registeredRoutes: IRegisteredRoute[];
};

const HTTP_METHODS = ["get", "post", "put", "delete", "patch", "options", "head"] as const;

/**
 * Creates an Express Router that explicitly records every route registered on it.
 *
 * **Why use this instead of `express.Router()`?**
 *
 * The standard `SwaggerHelper` route-discovery relies on the private `router.stack`
 * property that Express builds internally from compiled regular expressions.  Recovering
 * human-readable path strings from those regexes requires a fragile translation step
 * (`getPathFromRegex`) and is tightly coupled to Express internals that may change
 * across major versions.
 *
 * `createTrackedRouter` intercepts each `.get()` / `.post()` / … call and stores the
 * original path string and the Joi schema (if present) in a plain array
 * (`router._registeredRoutes`).  `SwaggerHelper` can then read from this array directly
 * without ever touching `router.stack`.
 *
 * @example
 * ```ts
 * import { createTrackedRouter } from "@/swaggers/helpers/routeRegistry";
 *
 * const myRouter = createTrackedRouter();
 *
 * myRouter.get("/users", validationV2({ … }), handler);
 * myRouter.post("/users", validationV2({ … }), handler);
 *
 * export default myRouter;
 * ```
 */
export function createTrackedRouter(): TrackedRouter {
    const router = Router() as TrackedRouter;
    router._registeredRoutes = [];

    for (const method of HTTP_METHODS) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const original = (router as any)[method].bind(router);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (router as any)[method] = (path: string, ...handlers: any[]) => {
            // Find the first handler that has a `schema` property attached by `validationV2`.
            const schemaHandler = handlers.find(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (h: any): boolean => typeof h === "function" && h.schema !== undefined,
            );

            const entry: IRegisteredRoute = { path, method };
            if (schemaHandler?.schema !== undefined) {
                entry.schema = schemaHandler.schema as JoiRequestSchema;
            }
            router._registeredRoutes.push(entry);

            return original(path, ...handlers);
        };
    }

    return router;
}

/**
 * Returns `true` when `router` was created with `createTrackedRouter` and therefore
 * carries an explicit `_registeredRoutes` list that can be consumed without inspecting
 * `router.stack`.
 */
export function isTrackedRouter(router: Router): router is TrackedRouter {
    return "_registeredRoutes" in router && Array.isArray((router as TrackedRouter)._registeredRoutes);
}

/**
 * Returns the routes that were explicitly recorded when the tracked router was built.
 * This is the Express-stack-free alternative to traversing `router.stack`.
 */
export function getRegisteredRoutes(router: TrackedRouter): IRegisteredRoute[] {
    return router._registeredRoutes;
}
