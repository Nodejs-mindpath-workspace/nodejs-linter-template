import constants from "@/swaggers/constants/constant";

export default class BooleanHelper {
    public static parse(value: string | boolean): boolean {
        if (typeof value === "boolean") return value;
        if (typeof value !== "string" || !value) value = constants.LITERALS.STRINGS.EMPTY();

        switch (value.toLowerCase()) {
            case "true":
            case "yes":
            case "1":
            case "y":
                return true;

            case "false":
            case "no":
            case "0":
            case "n":
            default:
                return false;
        }
    }

    public static parseToNumericBoolean(value: string | boolean): 0 | 1 {
        if (typeof value === "boolean") value = `${value}`;
        else if (typeof value !== "string" || !value) value = constants.LITERALS.STRINGS.EMPTY();

        switch (value.toLowerCase()) {
            case "true":
            case "yes":
            case "y":
            case "1":
                return 1;

            case "false":
            case "no":
            case "n":
            case "0":
            default:
                return 0;
        }
    }
}