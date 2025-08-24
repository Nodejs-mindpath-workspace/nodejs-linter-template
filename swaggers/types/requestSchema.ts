import { ObjectSchema, Schema } from "joi";

type JoiResponseBody = {
    contentType: string;
    body: Schema;
    description?: string;
};

type JoiRequestSchema = {
    params: ObjectSchema;
    body: ObjectSchema;
    query: ObjectSchema;
    apiResponses?: { [key: number]: JoiResponseBody };
    responseBody?: JoiResponseBody;
    group?: string;
    successStatusCode?: number;
    commonJoiResponseSchema?: Schema;
    description?: string;
    summary? : string;
};

export default JoiRequestSchema;
