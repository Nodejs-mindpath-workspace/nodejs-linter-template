import Constants from "@/swaggers/types/constants/constant";

const constants: Constants = {
    LITERALS: {
        STRINGS: {
            EMPTY: (): string => "",
        },
    },
    ARRAY: {
        EMPTY: <T>(): Array<T> => new Array<T>(),
    },
    OBJECT: {
        EMPTY: <T>(): T => <T>{},
    },
};

export default constants;
