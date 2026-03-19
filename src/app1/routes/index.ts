import { createTrackedRouter, TrackedRouter, validationV2 } from "@/swaggers/index";
import { Request, Response } from "express";
import Joi from "joi";

const app1Router: TrackedRouter = createTrackedRouter();

app1Router.get(
    "/route1",
    validationV2({
        params: Joi.object({}).unknown(true),
        query: Joi.object({}).unknown(true),
        body: Joi.object({}).unknown(true),
    }),
    (_req: Request, res: Response): void => {
        res.send("Router app 1");
    },
);

export default app1Router;
