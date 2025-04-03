import constants from "@/swaggers/constants/constant";

export default class BooleanHelper {
    public static parse(value: string): boolean {
        if (typeof value !== "string" || !value) value = constants.LITERALS.STRINGS.EMPTY();

        switch (value.toLowerCase()) {
            case "true":
            case "yes":
            case "1":
                return true;

            case "false":
            case "no":
            case "0":
            default:
                return false;
        }
    }
}
