'use strict';

var _ = require('lodash');
var request = require('supertest');
var should = require('should');
var language = require('../lib/language')();

describe('Devicestatus Duplicate Prevention', function ( ) {
  this.timeout(10000);
  var self = this;
  var known = 'b723e97aa97846eb92d5264f084b2823f57c4aa1';

  var api = require('../lib/api/');
  beforeEach(function (done) {
    process.env.API_SECRET = 'this is my long pass phrase';
    self.env = require('../lib/server/env')();
    self.env.settings.authDefaultRoles = 'readable';
    self.env.settings.enable = ['careportal', 'api'];
    this.wares = require('../lib/middleware/')(self.env);
    self.app = require('express')();
    self.app.enable('api');
    require('../lib/server/bootevent')(self.env, language).boot(function booted(ctx) {
      self.ctx = ctx;
      self.ctx.ddata = require('../lib/data/ddata')();
      self.app.use('/api', api(self.env, ctx));
      done();
    });
  });

  it('prevent duplicate alarm records', function (done) {
    var alarmData = {
        device: 'Omnipod 5',
        alarm: 'Low insulin level',
        created_at: '2026-03-10T12:00:00Z'
    };

    // First insertion
    request(self.app)
      .post('/api/devicestatus/')
      .set('api-secret', known || '')
      .send(alarmData)
      .expect(200)
      .end(function (err) {
        if (err) return done(err);

        // Second insertion (duplicate)
        request(self.app)
          .post('/api/devicestatus/')
          .set('api-secret', known || '')
          .send(alarmData)
          .expect(200)
          .end(function (err) {
            if (err) return done(err);

            // Verify only one record exists
            request(self.app)
              .get('/api/devicestatus/')
              .query('find[alarm]=Low insulin level')
              .set('api-secret', known || '')
              .expect(200)
              .expect(function (res) {
                res.body.length.should.equal(1);
              })
              .end(done);
          });
      });
  });

  it('prevent duplicate InsulinPerDay records', function (done) {
    var insulinData = {
        device: 'Omnipod 5',
        lastSync: '2026-03-10T11:00:00Z',
        InsulinPerDay: [{ timestamp: '2026-03-10T10:00:00Z', value: 10 }]
    };

    // First insertion
    request(self.app)
      .post('/api/devicestatus/')
      .set('api-secret', known || '')
      .send(insulinData)
      .expect(200)
      .end(function (err) {
        if (err) return done(err);

        // Second insertion (duplicate)
        request(self.app)
          .post('/api/devicestatus/')
          .set('api-secret', known || '')
          .send(insulinData)
          .expect(200)
          .end(function (err) {
            if (err) return done(err);

            // Verify only one record exists
            request(self.app)
              .get('/api/devicestatus/')
              .query('find[lastSync]=2026-03-10T11:00:00Z')
              .set('api-secret', known || '')
              .expect(200)
              .expect(function (res) {
                res.body.length.should.equal(1);
              })
              .end(done);
          });
      });
  });
});
