# slack2hangoutschat-webhook
> Slack 2 Google HangoutChat webhook converter

[![license](https://img.shields.io/github/license/tchiotludo/slack2hangoutschat-webhook.svg?maxAge=2592000&style=flat-square)](https://github.com/tchiotludo/slack2hangoutschat-webhook/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/v/slack2hangoutschat-webhook.svg?maxAge=2592000?style=flat-square)](https://www.npmjs.com/package/slack2hangoutschat-webhook)
[![Dependency Status](https://david-dm.org/tchiotludo/slack2hangoutschat-webhook.svg?style=flat-square)](https://david-dm.org/tchiotludo/slack2hangoutschat-webhook)
[![devDependency Status](https://david-dm.org/tchiotludo/slack2hangoutschat-webhook/dev-status.svg?style=flat-square)](https://david-dm.org/tchiotludo/slack2hangoutschat-webhook#info=devDependencies)

This project convert and forward all incoming Slack webhook to Hangouts chat.
In an opinionated way, it expose a webserver to that will proxy Slack webhook to Google chat Api.

## Online demo
https://slack2hangouts-chat.now.sh/

## Installation

### Docker

```sh
docker run -d \
    -p 3000:3000 \
    tchiotludo/slack2hangoutschat-webhook
```

Go to http://localhost:3000 for instruction

### Local

```bash
git clone https://github.com/tchiotludo/slack2hangoutschat-webhook
cd slack2hangoutschat-webhook
npm install
npm run watch # for dev with watch
npm run build && NODE_ENV="production" npm run start # build and start
```

Go to http://localhost:3000 for instruction

### Azure App

* Create a Http Trigger
* `npm install slack2hangoutschat-webhook`
* update to index.js with this content
```js
const webhook = require('slack2hangoutschat-webhook/dist/webhook');
module.exports = webhook.Webhook.azure
```
* Deploy to azure

## Api Usage
```bash
npm install slack2hangoutschat-webhook
```

```js
import { Converter } from "slack2hangoutschat-webhook";

console.log(Converter.convert({{
   "attachments": [
       {
           "fallback": "Required plain-text summary of the attachment.",
           "color": "#36a64f",
           "pretext": "Optional text that appears above the attachment block",
           "author_name": "Bobby Tables",
           "author_link": "https://gsuite.google.com/products/chat/",
           "author_icon": "https://www.gstatic.com/images/branding/product/2x/chat_64dp.png",
           "title": "Slack API Documentation",
           "title_link": "https://api.slack.com/",
           "text": "Optional text that appears within the attachment",
           "fields": [
               {
                   "title": "Priority",
                   "value": "High",
                   "short": false
               }
           ],
           "image_url": "https://assets.brandfolder.com/oox8px-b08c7c-5m1qjd/original/full-color-mark%202x.png",
           "thumb_url": "https://assets.brandfolder.com/oox90q-9q2cew-bw1vdr/view.png",
           "footer": "Slack API",
           "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
           "ts": 123456789
       }
   ]
})
```


## License
MIT © [tchiotludo](https://github.com/tchiotludo)