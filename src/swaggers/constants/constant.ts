import Constants from "../types/constants/constant";

const constants: Constants = {
    LITERALS: {},
    ARRAY: {
        EMPTY: <T>(): Array<T> => new Array<T>(),
    },
    OBJECT: {
        EMPTY: <T>(): T => <T>{},
    },
};

export default constants;
