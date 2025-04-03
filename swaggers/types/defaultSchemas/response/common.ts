import { ObjectSchema } from "joi";

import ApiResponse from "@/swaggers/types/responses/apiResponse";

type CommonJoiResponseSchema = {
    ALL: ObjectSchema<ApiResponse>;
};

export default CommonJoiResponseSchema;
