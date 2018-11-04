"use strict";

import url from "url";
import express, { Request, Response } from "express";
import compression from "compression";
import bodyParser from "body-parser";
import winston from "winston";
import expressWinston from "express-winston";
import errorHandler from "errorhandler";
import { Webhook } from "./webhook";

export const app = express();

app.set("port", process.env.PORT || 3000);

// request
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// logger
app.use((req, res, next) => {
    Object.assign(res.locals, {
        logUrl: url.parse(req.url).pathname
    });
    next();
});

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({})
    ],
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.colorize({}),
        winston.format.timestamp(),
        winston.format.printf(info => {
            let meta: string = "";
            if (info.meta && app.get("env") == "development") {
                meta = JSON.stringify(info.meta || {}, undefined, 4);
            }

            return `${info.timestamp} ${info.level}: ${info.message} ${meta}`;
        })
    ),
});

app.use(expressWinston.logger({
    winstonInstance: logger,
    msg: "{{req.method}} {{res.locals.logUrl}} {{res.statusCode}} {{res.responseTime}}ms",
    colorize: true,
}));

// router
app.use(express.static("public"));
app.post("/:space", Webhook.express);

// errors
app.use(expressWinston.errorLogger({
    winstonInstance: logger,
    msg: "{{req.method}} {{res.locals.logUrl}} {{res.statusCode}} {{err.message}}"
}));

app.use(errorHandler({log: false}));

// docker exit
process.on("SIGINT", function() {
    process.exit();
});

// listen
app.listen(app.get("port"), () => {
    logger.info(
        "App is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
    );
});

