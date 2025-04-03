import { ObjectSchema } from "joi";

type JoiRequestSchema = {
    params: ObjectSchema;
    body: ObjectSchema;
    query: ObjectSchema;
};

export default JoiRequestSchema;
