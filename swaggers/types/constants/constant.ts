type Constants = {
    LITERALS: {
        STRINGS: {
            EMPTY: () => string;
        };
    };
    ARRAY: {
        EMPTY: <T>() => Array<T>;
    };
    OBJECT: {
        EMPTY: <T>() => T;
    };
};

export default Constants;
