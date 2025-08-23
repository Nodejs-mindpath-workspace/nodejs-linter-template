import { validationV2 } from "@/swaggers/index";
import { Request, Response, Router } from "express";
import Joi from "joi";

const app2Router: Router = Router();

app2Router.get(
    "/route",
    validationV2({
        params: Joi.object({}).unknown(true),
        query: Joi.object({}).unknown(true),
        body: Joi.object({}).unknown(true),
    }),
    (_req: Request, res: Response): void => {
        res.send("Router app 2");
    },
);

export default app2Router;
