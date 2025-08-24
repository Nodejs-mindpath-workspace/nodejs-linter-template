import { validationV2 } from "@/swaggers/index";
import JoiRequestSchema from "@/swaggers/types/requestSchema";
import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const app2Router: Router = Router();

app2Router.put(
    "/route",
    validationV2(<JoiRequestSchema>{
        params: Joi.object({}).unknown(true),
        query: Joi.object({}).unknown(true),
        group: "test",
        body: Joi.object({
            test: Joi.object({}).unknown(),
        }).unknown(true),
        successStatusCode: StatusCodes.OK,
        summary: "testing symmary",
        description: "APp of the v1 route 1",
        apiResponses: {
            200: {
                contentType: "application/json",
                body: Joi.object({
                    test: Joi.object({}),
                }).unknown(),
            },
            400: {
                contentType: "application/json",
                body: Joi.object({
                    test: Joi.object({}),
                }).unknown(),
            },
            500: {
                contentType: "application/json",
                body: Joi.object({
                    test: Joi.object({}),
                }).unknown(),
            },
        },
    }),
    (_req: Request, res: Response): void => {
        res.send("Router app 2");
    },
);

export default app2Router;
