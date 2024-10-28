type Constants = {
    LITERALS: {};
    ARRAY: {
        EMPTY: <T>() => Array<T>;
    };
    OBJECT: {

        EMPTY: <T>() => T;
    }
}

export default Constants;
