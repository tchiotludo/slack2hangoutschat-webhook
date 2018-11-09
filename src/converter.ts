"use strict";

import { IncomingWebhookSendArguments, MessageAttachment } from "@slack/client";
import {
    Button,
    Card,
    Image,
    Section,
    TextButton,
    WidgetMarkup,
    Message,
    KeyValue,
    CardHeader,
    User,
    TextParagraph,
    OnClick,
    OpenLink,
    Icon,
    ImageButton
} from "hangouts-chat-webhook";

export class Converter {
    public static convert(slack: IncomingWebhookSendArguments): Message {
        const message: Message = new Message();

        if (!slack.attachments && slack.text) {
            message.setText(slack.text);
        } else if (slack.attachments) {
            message.setPreviewText(slack.text);

            if (slack.username) {
                message.setSender(new User().setDisplayName(slack["username"]));
            }

            slack.attachments.forEach(attachment => {
                const header: CardHeader = new CardHeader()
                    .setTitle(attachment["title"]);

                if (attachment.fallback) {
                    message.setFallbackText(message.getFallbackText() ? attachment.fallback + "\n" : attachment.fallback);
                    message.setPreviewText(message.getFallbackText().trim());
                }

                if (attachment.pretext) {
                    header.setSubtitle(attachment.pretext);
                }

                const card: Card = new Card()
                    .setHeader(header);

                const section: Section = new Section();

                if (attachment.author_name) {
                    section.addWidget(Converter.author(attachment));
                }

                if (attachment.image_url) {
                    section.addWidget(Converter.image(attachment));
                }

                if (attachment.text) {
                    section.addWidget(Converter.text(attachment));
                }

                if (attachment.fields) {
                    attachment.fields.forEach(field => {
                        section.addWidget(Converter.field(field));
                    });
                }

                if (attachment.footer) {
                    section.addWidget(Converter.footer(attachment));
                }

                if (attachment.title_link) {
                    section.addWidget(Converter.bottomLink(attachment));
                }

                message.addCard(card.addSection(section));
            });
        }

        return message;
    }

    private static image(attachment: MessageAttachment): WidgetMarkup {
        return new WidgetMarkup()
            .setImage(new Image()
                .setImageUrl(attachment["image_url"])
            );
    }

    private static formatText(text: string): string {
        const match = /^>>>([\s\S]*)/gm.exec(text);

        if (match && match.length > 0) {
            text = text.replace(match[0], match[1]
                .trim()
                .replace(/\n/g, "\n" + '<font color="#e3e4e6">┃</font> ')
            );
        }

        return text
            .replace(/\*(.+?)\*/g, "<b>$1</b>")
            .replace(/_(.+?)_/g, "<i>$1</i>")
            .replace(/~(.+?)~/g, "<strike>$1</strike>")
            .replace(/```(.+?)```/g, "<font color=\"#424242\">$1</font>")
            .replace(/^>(.+?)/gm, "<font color=\"#e3e4e6\">┃</font> $1")
            .replace(/`(.+?)`/g, "<font color=\"#d72b3f\">$1</font>")
            .trim();
    }

    private static text(attachment: MessageAttachment): WidgetMarkup {
        let color: String;

        if (attachment.color) {
            let hex: String = attachment.color;
            if (attachment.color == "danger") {
                hex = "#a30200";
                 } else if (attachment.color == "warning") {
                hex = "#daa038";
            } else if (attachment.color == "good") {
                hex = "#2eb886";
            } else if (attachment.color.substr(0, 1) != "#") {
                hex = "#e8e8e8";
            }

            color = '<font color="' + hex + '"><b>▮</b></font> ';
        }

        return new WidgetMarkup()
            .setTextParagraph(new TextParagraph()
                .setText(color + Converter.formatText(attachment.text))
            );
    }

    private static author(attachment: MessageAttachment): WidgetMarkup {
        const widget: WidgetMarkup = new WidgetMarkup();

        let onclick: OnClick;
        if (attachment.author_link) {
            onclick = new OnClick()
                .setOpenLink(new OpenLink()
                    .setUrl(attachment.author_link)
                );
        }

        if (attachment.author_icon) {
            widget.addButton(new Button()
                .setImageButton(new ImageButton()
                    .setIconUrl(attachment.author_icon)
                    .setName(attachment.author_name)
                    .setOnClick(onclick)
                )
            );
        }

        widget.addButton(new Button()
            .setTextButton(new TextButton()
                .setText(attachment.author_name)
                .setOnClick(onclick)
            )
        );

        return widget;
    }

    private static field(field: any): WidgetMarkup {
        return new WidgetMarkup()
            .setKeyValue(new KeyValue()
                .setTopLabel(field["title"])
                .setContent(field["value"])
                .setContentMultiline(!field["short"])
                .setIcon(Icon.DESCRIPTION)
            );
    }

    private static footer(attachment: MessageAttachment): WidgetMarkup {
        const footerLink: OnClick = new OnClick();

        if (attachment.title_link) {
            footerLink.setOpenLink(new OpenLink()
                .setUrl(attachment.title_link)
            );
        }

        const footer: WidgetMarkup = new WidgetMarkup();

        if (attachment.footer_icon) {
            footer.addButton(new Button()
                .setImageButton(new ImageButton()
                    .setIconUrl(attachment.footer_icon)
                    .setName(attachment.footer)
                    .setOnClick(footerLink)
                )
            );
        }

        footer.addButton(new Button()
            .setTextButton(new TextButton()
                .setText(attachment.footer)
                .setOnClick(footerLink)
            )
        );

        return footer;
    }

    private static bottomLink(attachment: MessageAttachment): WidgetMarkup {
        return new WidgetMarkup()
            .addButton(new Button()
                .setTextButton(new TextButton()
                    .setText("Open")
                    .setOnClick(new OnClick()
                        .setOpenLink(new OpenLink().
                            setUrl(attachment.title_link)
                        )
                    )
                )
            );
    }
}

