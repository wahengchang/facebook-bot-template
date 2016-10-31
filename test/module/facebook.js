var should = require('should');


var facebookModule = require('../../module/facebook')
    // validateGET = facebookModule.validateGET,
    // parsePOST = facebookModule.parsePOST;

var testUserId = process.env.TEST_USER_ID;


describe('Test init() /module/facebook.js', function() {
  this.timeout(40000);

  it('Test init(), empty input', function(done) {
    facebookModule.init().should.be.eql(false);
    done();
  });

  it('Test init(), missing parameters', function(done) {
    facebookModule.init({APP_SECRET: ''}).should.be.eql(false);
    done();
  });

  it('Test init(), happy path', function(done) {
    facebookModule.init({
      APP_SECRET: 'APP_SECRET',
      VALIDATION_TOKEN: 'VALIDATION_TOKEN',
      PAGE_ACCESS_TOKEN: 'PAGE_ACCESS_TOKEN',
      SERVER_URL: 'SERVER_URL'
    }).should.be.eql(true);
    done();
  });
})


describe('Test send message /module/facebook.js', function() {
  this.timeout(40000);

  it('sendTextMessage, happy path', function(done) {

    facebookModule.sendTextMessage(testUserId, 'this is test message').then(function(result){
      console.log(result)
      done();
    },function(err){
      console.log(err)
      done(err);
    })

  });

  it('sendTextMessage, error', function(done) {

    facebookModule.sendTextMessage('testUserId', 'this is test message').then(function(result){
      console.log(result)
      done('expect error');
    },function(err){
      console.log(JSON.stringify(err))
      done();
    })

  });

  it('sendButtonMessage', function(done) {
    var VALIDATION_TOKEN = 'abc;'

    facebookModule.sendButtonMessage(testUserId).then(function(result){
      console.log(result)
      done();
    },function(err){
      console.log(JSON.stringify(err))
      done(err);
    })

  });

  it('sendQuickReply', function(done) {
    var VALIDATION_TOKEN = 'abc;'

    facebookModule.sendQuickReply(testUserId).then(function(result){
      console.log(result)
      done();
    },function(err){
      console.log(JSON.stringify(err))
      done(err);
    })
  });


})

