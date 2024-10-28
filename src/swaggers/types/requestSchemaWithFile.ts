import { ObjectSchema } from "joi";

import JoiRequestSchema from "./requestSchema";

type JoiRequestSchemaWithFile = JoiRequestSchema & {
    file: ObjectSchema;
};

export default JoiRequestSchemaWithFile;
