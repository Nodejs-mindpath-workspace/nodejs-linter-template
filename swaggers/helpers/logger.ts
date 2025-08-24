import winston from "winston";
import winstonDailyRotateFile from "winston-daily-rotate-file";

import constants from "@/swaggers/constants/constant";
import BooleanHelper from "@/swaggers/helpers/boolean";

const { colorize, combine, timestamp, printf, splat } = winston.format;
const format: winston.Logform.Format = printf(
    ({ level, message, timestamp, meta, stack, ...rest }: winston.Logform.TransformableInfo): string => {
        const restMessage: winston.Logform.TransformableInfo = <winston.Logform.TransformableInfo>(
            rest[Symbol.for("message")]
        );
        const restLevel: winston.Logform.TransformableInfo = <winston.Logform.TransformableInfo>(
            rest[Symbol.for("level")]
        );

        if (typeof restMessage === "string" && (<string>restMessage).includes("LEVEL:")) return restMessage;

        return `LEVEL: ${level ?? restLevel}\t|TIMESTAMP: ${timestamp}\t|MESSAGE: ${message ?? restMessage}  ${
            meta ? `\t META: ${JSON.stringify(meta)}` : ""
        }${stack ? "\t| STACK: " + stack : ""}\n`;
    },
);
const formatter: winston.Logform.Format = combine(colorize(), timestamp(), splat(), format);
const winstonConsole: winston.transports.ConsoleTransportInstance = new winston.transports.Console({
    level: "info",
    format: formatter,
});
const transports: Array<winstonDailyRotateFile | winston.transports.ConsoleTransportInstance> = [winstonConsole];

if (
    process.env.NODE_ENV === "development" &&
    BooleanHelper.parse(process.env.STORE_LOGS ?? constants.LITERALS.STRINGS.EMPTY())
) {
    const winstonDailyRotateFileError: winstonDailyRotateFile = new winstonDailyRotateFile({
        filename: "logs/error-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        level: "error",
        format: formatter,
    });
    transports.push(winstonDailyRotateFileError);
}

const options: winston.LoggerOptions = { level: "debug", transports, format: formatter };

export default winston.createLogger(options);
