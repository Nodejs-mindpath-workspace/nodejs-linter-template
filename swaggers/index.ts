import "dotenv/config";
import "module-alias/register";

import { NextFunction, Request, Response } from "express";

import HttpStatus from "http-status-codes";
import Joi, { ObjectSchema, ValidationResult } from "joi";

import constants from "@/swaggers/constants/constant";
import expressConstants from "@/swaggers/constants/express";
import ExpressError from "@/swaggers/helpers/expressError";
import logger from "@/swaggers/helpers/logger";
import { createTrackedRouter } from "@/swaggers/helpers/routeRegistry";
import type { TrackedRouter } from "@/swaggers/helpers/routeRegistry";
import JoiRequestSchema from "@/swaggers/types/requestSchema";

export { createTrackedRouter };
export type { TrackedRouter };

export function validationV2<Path, ResBody, ReqBody, Query>(
    validateObject: JoiRequestSchema,
): {
    (req: Request<Path, ResBody, ReqBody, Query>, _res: Response, next: NextFunction): void;
    schema: JoiRequestSchema;
} {
    const middleware: {
        (req: Request<Path, ResBody, ReqBody, Query>, _res: Response, next: NextFunction): void;
        schema: JoiRequestSchema;
    } = (req: Request<Path, ResBody, ReqBody, Query>, _res: Response, next: NextFunction): void => {
        logger.info({
            message: `====== validation middleware running v2 ======`,
        });
        const errors: Array<unknown> = constants.ARRAY.EMPTY();
        const requestParameters: Array<string> = expressConstants.REQUEST_PARAMETERS;

        for (const key of requestParameters) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const schemaValue: any = (<Request>req)[<keyof Request>key];
            const rawSchema: JoiRequestSchema[keyof JoiRequestSchema] = validateObject[<keyof JoiRequestSchema>key];
            // Only validate against Joi ObjectSchema instances (skip responseBody and undefined values).
            if (!rawSchema || !Joi.isSchema(rawSchema)) continue;
            const schema: ObjectSchema = rawSchema as ObjectSchema;
            const result: ValidationResult<unknown> = schema.validate(schemaValue);
            if (result.error) errors.push(result.error);
        }

        if (!errors.length) return next();

        const error: ExpressError = new ExpressError(errors.toString(), HttpStatus.BAD_REQUEST);
        return next(error);
    };
    middleware.schema = validateObject;

    return middleware;
}
