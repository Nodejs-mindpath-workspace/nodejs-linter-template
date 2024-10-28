import EmptyObject from "../emptyObject";

type ApiResponse<T = EmptyObject> = { status: number; data: T | string; message: string };

export default ApiResponse;
