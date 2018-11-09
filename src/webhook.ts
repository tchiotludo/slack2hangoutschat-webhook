"use strict";

import * as url from "url";
import { Request, Response, NextFunction } from "express";
import * as superagent from "superagent";
import { Converter } from "./converter";
import { IncomingWebhookSendArguments } from "@slack/client";

export class WebhookResponse {
    public status: number;
    public headers: any;
    public body: string;

    constructor(status: number, headers: any, body: string) {
        this.status = status;
        this.headers = headers;
        this.body = body;
    }
}

export class WebhookError {
    public status: number;
    public headers: any;
    public body: string;
    public error: string;


    constructor(status: number, headers: any, body: string, error: string) {
        this.status = status;
        this.headers = headers;
        this.body = body;
        this.error = error;
    }
}

export class Webhook {
    public static send(req: Request): Promise<any> {
        return new Promise((resolve, reject) => {
            const parsed = url.parse(req.url, true);
            const webhookUrl: string = "https://chat.googleapis.com/v1/spaces/" + req.params["space"]  + "/messages" + parsed.search;

            superagent.post(webhookUrl)
                .set("Content-Type", "application/json; charset=UTF-8")
                .send(Converter.convert(req.body as IncomingWebhookSendArguments))
                .then((response: superagent.Response) => {
                    resolve(new WebhookResponse(
                        response.status,
                        response.header,
                        response.body
                    ));
                })
                .catch((err: any) => {
                    reject(new WebhookError(
                        err.status,
                        err.header,
                        err.body,
                        err.response && err.response.text ? JSON.parse(err.response.text) : "Request failed",
                    ));
                });
        });
    }

    public static express(req: Request, res: Response, next: NextFunction): void {
        Webhook.send(req)
            .then(value => res
                .status(value.status)
                .json(value)
            )
            .catch(reason => {
                if (!(reason instanceof WebhookError)) {
                    return next(reason);
                }

                return res
                    .status(reason.status)
                    .json(reason);
            });
    }
}
