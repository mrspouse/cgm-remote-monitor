'use strict';

var moment = require('moment');

function configure (app, wares, ctx, env) {
  var express = require('express')
    , api = express.Router( );
  var translate = ctx.language.translate;

  // invoke common middleware
  api.use(wares.sendJSONStatus);
  // text body types get handled as raw buffer stream
  api.use(wares.bodyParser.raw());
  // json body types get handled as parsed json
  api.use(wares.bodyParser.json());

  ctx.virtAsstBase.setupVirtAsstHandlers(ctx.google_actions);

  api.post('/google_actions', ctx.authorization.isPermitted('api:*:read'), function (req, res, next) {
    console.log('Incoming request from Google Home');
    
    console.log('****** REQUEST *******');

    console.log('req: ',req.body);

    var name = req.body.intent.name;
    var query = req.body.intent.query;
    var metric = req.body.scene.slots.metric.value;
    var sessionId = req.body.session.id;
    var verificationStatus = req.body.user.verificationStatus;

    console.log('name: ',req.body.intent.name);
    console.log('query: ',req.body.intent.query);
    console.log('metric: ',req.body.scene.slots.metric.value);


    console.log('****** END REQUEST *******');
    
    var locale = req.body.session.languageCode.substr(0,2);
    var userLocale = req.body.user.locale.substr(0,2);
    console.log('locale: ',locale);
    console.log('userLocale: ',userLocale);
 
    if (locale == ''){
       locale = userLocale
    };
    console.log('lang: ',locale);
    ctx.language.set(locale);
    moment.locale(locale);

    var handler = ctx.google_actions.getIntentHandler(name, metric);
    if (handler){
      var sbx = initializeSandbox();
      handler(function (title, response) {
        console.log('output: ', response);
        res.json(ctx.google_actions.buildSpeechletResponse(response, false));
        next( );
        return;
      }, req.body.intent.params, sbx);
    } else {
      res.json(ctx.google_actions.buildSpeechletResponse(translate('virtAsstUnknownIntentText'), true));
      next( );
      return;
    }
  });

  ctx.virtAsstBase.setupMutualIntents(ctx.google_actions);

  function initializeSandbox() {
    var sbx = require('../../sandbox')();
    sbx.serverInit(env, ctx);
    ctx.plugins.setProperties(sbx);
    return sbx;
  }

  return api;
}

module.exports = configure;
