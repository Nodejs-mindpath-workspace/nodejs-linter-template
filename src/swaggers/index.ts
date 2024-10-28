import { NextFunction, Response, Request } from "express";

import HttpStatus from "http-status-codes";
import { ObjectSchema, ValidationResult } from "joi";

import constants from "./constants/constant";
import expressConstants from "./constants/express";
import logger from "./helpers/logger";
import ExpressError from "./helpers/expressError";
import JoiRequestSchema from "./types/requestSchema";

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
        logger.info("====== validation middleware running v2 ======");
        const errors: Array<unknown> = constants.ARRAY.EMPTY();
        const requestParameters: Array<string> = expressConstants.REQUEST_PARAMETERS;

        for (const key of requestParameters) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const schema: ObjectSchema<any> = validateObject[<keyof JoiRequestSchema>key];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const schemaValue: any = (<Request>req)[<keyof Request>key];
            if (!schema || schema === undefined) continue;
            const result: ValidationResult<unknown> = (<ObjectSchema>schema).validate(schemaValue);
            if (result.error) errors.push(result.error);
        }

        if (!errors.length) return next();

        const error: ExpressError = new ExpressError(errors.toString(), HttpStatus.BAD_REQUEST);
        return next(error);
    };
    middleware.schema = validateObject;

    return middleware;
}
