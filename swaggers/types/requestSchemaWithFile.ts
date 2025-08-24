import { ObjectSchema } from "joi";

import JoiRequestSchema from "@/swaggers/types/requestSchema";

type JoiRequestSchemaWithFile = JoiRequestSchema & {
    file: ObjectSchema;
};

export default JoiRequestSchemaWithFile;
