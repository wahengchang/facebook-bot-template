
var crypto = require('crypto'),
    request = require('request');




function facebookModule() {

    var isInit = false ; 

    var APP_SECRET ;
    var VALIDATION_TOKEN ;
    var PAGE_ACCESS_TOKEN ;
    var SERVER_URL ;
    

    var init = function(_initJson){
        console.log('-------------------- init ', _initJson)
        if(!_initJson){
            console.error("Missing config values");
            return false;
        }
        else{
            APP_SECRET = _initJson.APP_SECRET;
            VALIDATION_TOKEN = _initJson.VALIDATION_TOKEN;
            PAGE_ACCESS_TOKEN = _initJson.PAGE_ACCESS_TOKEN;
            SERVER_URL = _initJson.SERVER_URL;

            if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
                console.error("Missing config values");
                return false;
            }
            else{
                console.error("Init finished");
                isInit = true;
                return true;
            }
        }
    }

    function verifyRequestSignature(req, res, buf) {
        console.log('-------------------- verifyRequestSignature ')

        var signature = req.headers["x-hub-signature"];

        if (!signature) {
            // For testing, let's log an error. In production, you should throw an
            // error.
            console.error("Couldn't validate the signature.");
        } else {
            var elements = signature.split('=');
            var method = elements[0];
            var signatureHash = elements[1];

            var expectedHash = crypto.createHmac('sha1', APP_SECRET).update(buf).digest('hex');

            if (signatureHash != expectedHash) {
                throw new Error("Couldn't validate the request signature.");
            }
        }
    }


    function sendButtonMessage(recipientId) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: "This is test text",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.oculus.com/en-us/rift/",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Trigger Postback",
                            payload: "DEVELOPED_DEFINED_PAYLOAD"
                        }, {
                            type: "phone_number",
                            title: "Call Phone Number",
                            payload: "+16505551234"
                        }]
                    }
                }
            }
        };

        return callSendAPI(messageData);
    }

    function sendQuickReply(recipientId) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: "What's your favorite movie genre?",
                quick_replies: [{
                    "content_type": "text",
                    "title": "Action",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
                }, {
                    "content_type": "text",
                    "title": "Comedy",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
                }, {
                    "content_type": "text",
                    "title": "Drama",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
                }]
            }
        };

        return callSendAPI(messageData);
    }


    function callSendAPI(messageData) {
        return new Promise(function(resolve, reject) {

            request({
                uri: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {
                    access_token: PAGE_ACCESS_TOKEN
                },
                method: 'POST',
                json: messageData

            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var recipientId = body.recipient_id;
                    var messageId = body.message_id;

                    resolve({
                        messageId: messageId,
                        recipientId: recipientId,
                        message: "Successfully sent message with id "+ messageId + " to recipient " + recipientId
                    });
                } else {
                    console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
                    reject(error);
                }
            });
        });
    }

    function sendTextMessage(recipientId, messageText) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText,
                metadata: "DEVELOPER_DEFINED_METADATA"
            }
        };

        return callSendAPI(messageData);
    }


    function authGET(req, res, next) {
          if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VALIDATION_TOKEN) {
            console.log("Validating webhook");
            next();
          } else {
            console.error("Failed validation. Make sure the validation tokens match.");
            res.sendStatus(403);
          }
    }

    function listener () {
          var target  = arguments[arguments.length -2] ; 
          var targetMessageType ='';
          var cb  = arguments[arguments.length -1] ; 

          if(typeof target == 'string'){
            targetMessageType = target;
          }
          else{
            targetMessageType = target.messageType;
          }

          for (var i = 0; i < arguments.length -2 ; i++) {
            if(arguments[i] == targetMessageType){
                return cb();
            }
          }
    }

    function notListener () {
          var target  = arguments[arguments.length -2] ; 
          var targetMessageType ='';
          var cb  = arguments[arguments.length -1] ; 
          var isMatch = false;

          if(typeof target == 'string'){
            targetMessageType = target;
          }
          else{
            targetMessageType = target.messageType;
          }

          for (var i = 0; i < arguments.length -2 ; i++) {
            if(arguments[i] == targetMessageType){
                isMatch = true;
            }
          }
            
            if(!isMatch){
                return cb();
            }
    }

    function MessageListener() {
          listener()
    }


    function parsePOST(req, res, next) {

       var data = req.body;
       var returnJ = [];

       if (data.object == 'page') {
           // Iterate over each entry
           // There may be multiple if batched
           data.entry.forEach(function(pageEntry) {
               var pageID = pageEntry.id;
               var timeOfEvent = pageEntry.time;

               // Iterate over each messaging event
               pageEntry.messaging.forEach(function(messagingEvent) {
                    var messageType = '';
                   if (messagingEvent.optin) {
                        messageType = 'Authentication';
                   } else if (messagingEvent.message) {
                       if(messagingEvent.message.is_echo){
                            messageType = 'Echo';
                       } else if(messagingEvent.message.quick_reply){
                            messageType = 'QuickReply';
                       }
                   } else if (messagingEvent.delivery) {
                        messageType = 'DeliveryConfirmation';
                   } else if (messagingEvent.postback) {
                        messageType = 'Postback';
                   } else if (messagingEvent.read) {
                        messageType = 'MessageRead';
                   } else if (messagingEvent.account_linking) {
                        messageType = 'AccountLink';
                   } else {
                        console.error("Webhook received unknown messagingEvent: ", messagingEvent);
                        res.sendStatus(403);
                   }

                   returnJ.push({
                    messageType: messageType,
                    senderId: messagingEvent.sender.id,
                    message: messagingEvent.message
                   })
               });
           });

            req.afterParse = returnJ;
            next();
       }
       else{
            console.error("Data.object required page.");
            res.sendStatus(403);
       }
   }


    return {
        init: init,
        verifyRequestSignature: verifyRequestSignature,
        sendButtonMessage: sendButtonMessage,
        sendQuickReply: sendQuickReply,
        sendTextMessage: sendTextMessage,
        listener: listener,
        notListener: notListener,
        authGET: authGET,
        parsePOST: parsePOST
    };
}



/******************************************************************************************
Signleton pattern
******************************************************************************************/

module.exports =  (function() {  
    // Singleton instance goes into this variable
    var instance;

    // Singleton factory method
    function factory() {
        return facebookModule()
    }

    // Singleton instance getter
    function getInstance() {
        // If the instance does not exists, creates it
        if (instance === undefined) {
            instance = factory();
        }

        return instance;
    }

    // Public API definition
    return (function(){
        {
            // If the instance does not exists, creates it
            if (instance === undefined) {
                instance = factory();
            }

            return instance;
        }
    })()
})();


