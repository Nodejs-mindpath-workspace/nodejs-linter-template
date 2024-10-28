import { ObjectSchema } from "joi";

import ApiResponse from "../../responses/apiResponse";

type CommonJoiResponseSchema = {
    ALL: ObjectSchema<ApiResponse>;
};

export default CommonJoiResponseSchema;
