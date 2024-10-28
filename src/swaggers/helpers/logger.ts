import winston from "winston";
import winstonDailyRotateFile from "winston-daily-rotate-file";

const { colorize, combine, timestamp, printf, splat } = winston.format;
const format: winston.Logform.Format = printf(
    ({ level, message, timestamp, meta, stack }: winston.Logform.TransformableInfo): string =>
        `LEVEL: ${level}\t|TIMESTAMP: ${timestamp}\t|MESSAGE: ${message}  ${
            meta ? `\t META: ${JSON.stringify(meta)}` : ""
        }${stack ? "\t| STACK: " + stack : ""} \n`,
);
const formatter: winston.Logform.Format = combine(colorize(), timestamp(), splat(), format);
const winstonDailyRotateFileError: winstonDailyRotateFile = new winstonDailyRotateFile({
    filename: "logs/error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    level: "error",
    format: formatter,
});
const winstonConsole: winston.transports.ConsoleTransportInstance = new winston.transports.Console({
    level: "info",
    format: formatter,
});
const transports: Array<winstonDailyRotateFile | winston.transports.ConsoleTransportInstance> = [winstonConsole];

if (process.env.NODE_ENV === "development") transports.push(winstonDailyRotateFileError);

const options: winston.LoggerOptions = { level: "debug", transports, format: formatter };

export default winston.createLogger(options);
