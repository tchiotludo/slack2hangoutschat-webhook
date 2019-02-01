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
    public static send(space: string, key: string, token: string, body: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const webhookUrl: string = "https://chat.googleapis.com/v1/spaces/" + space  + "/messages?key=" + key + "&token=" + token;

            superagent.post(webhookUrl)
                .set("Content-Type", "application/json; charset=UTF-8")
                .send(Converter.convert(body as IncomingWebhookSendArguments))
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
        const parsed: url.UrlWithParsedQuery = url.parse(req.url, true);

        Webhook.send(req.params["space"], <string>parsed.query.key, <string>parsed.query.token, req.body)
            .then((value: WebhookResponse) => res
                .status(value.status)
                .json(value)
            )
            .catch((reason: WebhookError) => {
                if (!(reason instanceof WebhookError)) {
                    return next(reason);
                }

                return res
                    .status(reason.status)
                    .json(reason);
            });
    }

    public static async azure(context: any, req: any) {
        const parsed = url.parse(req.url, true);

        req.url = "http://localhost/" + req.query.space + req.url.substring(req.url.indexOf("?"));
        req.params = req.query;

        parsed.pathname = "/" + parsed.query.space;
        delete parsed.query.space;
        delete parsed.query.code;
        delete parsed.search;
        delete parsed.href;
        delete parsed.path;

        try {
            const value: WebhookResponse = await Webhook.send(
                <string> parsed.query.space,
                <string> parsed.query.key,
                <string> parsed.query.token,
                req.body
            );

            context.res = {
                status: value.status,
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                },
                body: value
            };
        } catch (reason) {
            if (!(reason instanceof WebhookError)) {
                context.res = {
                    status: 500,
                    body: reason.message
                };
            } else {
                context.res = {
                    status: reason.status,
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8"
                    },
                    body: reason
                };
            }
        }
    };

}
