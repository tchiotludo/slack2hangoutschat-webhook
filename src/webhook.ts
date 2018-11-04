"use strict";

import * as url from "url";
import { Request, Response } from "express";
import * as superagent from "superagent";
import { Converter } from "./converter";
import { IncomingWebhookSendArguments } from "@slack/client";

export class Webhook {
    public static send(req: Request): Promise<any> {
        return new Promise((resolve, reject) => {
            const parsed = url.parse(req.url, true);
            const webhookUrl: string = "https://chat.googleapis.com/v1/spaces/" + req.params["space"]  + "/messages" + parsed.search;

            superagent.post(webhookUrl)
                .set("Content-Type", "application/json; charset=UTF-8")
                .send(Converter.convert(req.body as IncomingWebhookSendArguments))
                .then((response: superagent.Response) => {
                    resolve({
                        status: response.status,
                        headers: response.header,
                        body: response.body
                    });
                })
                .catch((err: any) => {
                    reject({
                        status: err.status,
                        headers: err.header,
                        body: err.body,
                        error: err.response && err.response.text ? JSON.parse(err.response.text) : "Request failed",
                    });
                });
        });
    }

    public static express(req: Request, res: Response): void {
        Webhook.send(req)
            .then(value => res
                .status(value.status)
                .json(value)
            )
            .catch(reason => res
                .status(reason.status)
                .json(reason)
            );
    }
}
