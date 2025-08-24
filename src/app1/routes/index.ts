import { validationV2 } from "@/swaggers/index";
import JoiRequestSchema from "@/swaggers/types/requestSchema";
import { Request, Response, Router } from "express";
import Joi from "joi";

const app1Router: Router = Router();

app1Router.get(
    "/route1",
    validationV2(<JoiRequestSchema>{
        params: Joi.object({}).unknown(true),
        query: Joi.object({}).unknown(true),
        body: Joi.object({}).unknown(true),
    }),
    (_req: Request, res: Response): void => {
        res.send("Router app 1");
    },
);

export default app1Router;
