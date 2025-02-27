type Constants = {
    LITERALS: object;
    ARRAY: {
        EMPTY: <T>() => Array<T>;
    };
    OBJECT: {
        EMPTY: <T>() => T;
    };
};

export default Constants;
