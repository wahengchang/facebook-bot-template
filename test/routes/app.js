
var should = require('should');
var agent = require('supertest').agent(require('../../app'));


describe('Test GET /webhook', function() {
  this.timeout(40000);
  it('GET /webhook , happy path', function(done) {
    var VALIDATION_TOKEN = process.env.MESSENGER_VALIDATION_TOKEN;

    agent.get('/webhook?hub.mode=subscribe&hub.verify_token='+VALIDATION_TOKEN)
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err);

      done();
    });
  })

  it('GET /webhook , error', function(done) {
    var VALIDATION_TOKEN = 'abc;'

    agent.get('/webhook?hub.mode=subscribe&hub.verify_token='+VALIDATION_TOKEN)
    .expect(403)
    .end(function (err, res) {
      if (err) return done(err);

      done();
    });
  })
})


describe.only('Test POST /webhook', function() {
  this.timeout(40000);

  var param = {
      "object": "page",
      "entry": [{
          "id": "1595937827294375",
          "time": 1477901182385,
          "messaging": [{
              "sender": {
                  "id": "1201342816584690"
              },
              "recipient": {
                  "id": "1595937827294375"
              },
              "timestamp": 1477901182365,
              "message": {
                  "mid": "mid.1477901182365:873aeb6433",
                  "seq": 2522,
                  "text": "hi"
              }
          }]
      }]
  }

  it('POST /webhook , happy path', function(done) {

    agent.post('/webhook')
    .send(param)
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err);

      console.log(res.body)

      done();
    });
  })

})