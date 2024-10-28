import Joi from "joi";

import CommonJoiResponseSchema from "../../types/defaultSchemas/response/common";
import ApiResponse from "../../types/responses/apiResponse";

const commonJoiResponseSchema: CommonJoiResponseSchema = {
    ALL: Joi.object<ApiResponse>({
        status: Joi.number().required().description("API response status"),
        message: Joi.string().required().description("Success | fail"),
        data: Joi.alternatives(Joi.object({}), Joi.string()),
    }),
};

export default commonJoiResponseSchema;
