const { createLogger, format, transports } = require("winston");
const config = require("../config/config");
const path = require("path");

const getLabel = function (callingModule) {
  const parts = callingModule.filename.split(path.sep);
  return path.join(parts.pop());
};

const logger = (callingModule) => {
  return createLogger({
    level: config.MODE === "production" ? "info" : "debug",
    format: format.combine(
      format.label({ label: getLabel(callingModule) }),
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
    ),
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(
            (info) =>
              `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
          )
        ),
      }),
    ],
  });
};

module.exports = logger;
