import { ObjectSchema, Schema } from "joi";

type JoiRequestSchema = {
    params: ObjectSchema;
    body: ObjectSchema;
    query: ObjectSchema;
    responseBody?: {
        contentType: string;
        body: Schema;
    };
};

export default JoiRequestSchema;
