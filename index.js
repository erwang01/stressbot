'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()), // creates express http server
  request = require("request"),
  ACCESS_TOKEN = "EAAChQKEZAjl0BAChdxUJq0ZBMDrpo2akneoO7BKJCfAkyZAVXluhcJA50KPnaVNsbZAL6IAAQMzspYZAA4lcMHd72tA2z9ur1EKlN8ZAihmAVJKeLygW1ybqhQxMdk23obdOHYunNvEAZBbPVVP85S7gklnoQ8RkOCyxux2spHcqYnMNDfCiwIk";

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening on ' +( process.env.PORT || 1337)));

// Server index page
app.get("/", function (req, res) {
    res.send("Deployed!");
  });

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
            processEvent(webhook_event);
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFICATION_TOKEN
        
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
        
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
        
        } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
        }
    }
});

function processEvent(webhook_event) {
    var sender, recipient, text, url, nlp;
    if(webhook_event.sender && webhook_event.sender.id) {
        sender = webhook_event.sender.id;
    }
    if(webhook_event.recipient && webhook_event.recipient.id) {
        sender = webhook_event.recipient.id;
    }
    if(webhook_event.message) {
        if(webhook_event.message.text) {
            text=webhook_event.message.text;
        }
        if (webhook_event.message.attachments && webhook_event.message.attachments.URL) {
            url = webhook_event.message.attachments.URL;
        }
        if (webhook_event.message.nlp) {
            nlp = webhook_event.message.nlp;
            console.log(nlp);
        }
    }
    sendMessage(sender, "you sent" + text);
}

function sendMessage(recipientID, text) {
    request({
        url: "https://graph.facebook.com/v2.12/me/messages",
        params: {"access_token" : ACCESS_TOKEN},
        //url: "https://graph.facebook.com/v2.6/me/messages?access_token=EAAChQKEZAjl0BAIWvG1jUS4rDi2X5kUy8HJYy3gdZC2ML2JDqiXkrZCocYUZAGgVLLFNKMi2TTVSAT7FZBYSZAPTPIZAgmvCYcargqHV642xCZAwzwdZAwtnUiA1AQNSF1wqWR6Nmud9Szxwd7iatq92ab1btTD1QZBBmrZAefc0n0v9xpUorlYBIbd",
        method: "POST",
        json: 
            {
                "messaging_type": "RESPONSE",
                "recipient": {
                    "id": recipientID
                },
                "message": {
                    "text": text
                }
            }
        },
        function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Upload successful!  Server responded with:', body);
    });
}
