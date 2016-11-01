/*
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* jshint node: true, devel: true */
'use strict';

var bodyParser = require('body-parser'),
    config = require('config'),
    express = require('express'),
    https = require('https'),
    facebookModule = require('./module/facebook'),
    validateGET = facebookModule.validateGET,
    parsePOST = facebookModule.parsePOST;

facebookModule.init({
  APP_SECRET: process.env.APP_SECRET,
  VALIDATION_TOKEN: process.env.VALIDATION_TOKEN,
  PAGE_ACCESS_TOKEN: process.env.PAGE_ACCESS_TOKEN,
  SERVER_URL: process.env.SERVER_URL
})

var app = express();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: facebookModule.verifyRequestSignature }));
app.use(express.static('public'));

/*
 * Use your own validation token. Check that the token used in the Webhook
 * setup is the same token used here.
 *
 */
app.get('/webhook', validateGET, function (req, res, next) {
    res.status(200).send(req.query['hub.challenge']);
});

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', parsePOST, function (req, res) {

  var dataList = req.afterParse ;


  dataList.forEach(function(data){
    facebookModule.notListener('DeliveryConfirmation' ,'Echo', 'MessageRead', data, function(){

      var _message = '';

      if (data.message) {
        if (data.message.text) {
          _message = 'this is test message: ' +data.message.text;
        }
        else{
          _message = data.message.attachments[0].payload.url;
        }
      }
      
      facebookModule.sendTextMessage(data.senderId, _message)
    })
  })

  res.sendStatus(200);
});

/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL.
 *
 */
app.get('/authorize', function (req, res) {
  var accountLinkingToken = req.query.account_linking_token;
  var redirectURI = req.query.redirect_uri;

  // Authorization Code should be generated per user by the developer. This will
  // be passed to the Account Linking callback.
  var authCode = "1234567890";

  // Redirect users to this URI on successful login
  var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid
// certificate authority.
app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
