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
    console.log('****** END REQUEST *******');
    
    var sessionId = req.body.session.id;
    var verificationStatus = req.body.user.verificationStatus;
    var locale = req.body.session.languageCode.substr(0,2);
    var userLocale = req.body.user.locale.substr(0,2);
 
    if (locale == ''){
       locale = userLocale
    };
    console.log('locale: ', locale);
    console.log('userLocale: ', userLocale);
    console.log('set locale: ', locale);
    ctx.language.set(locale);
    moment.locale(locale);

    // Send bg on invocation via MetricNow intent
    if (req.body.intent.name == 'actions.intent.MAIN'){
      name = 'MetricNow';
      metric = 'bg';
      query = 'Nightscout welcome';
    } else {
      var name = req.body.intent.name;
      var query = req.body.intent.query;
      var metric = req.body.scene.slots.metric.value;
      var params = req.body.intent.params;
    }

    console.log('name: ', name);
    console.log('query: ', query);
    console.log('metric: ', metric);  
    console.log('params: ', params);  

    var handler = ctx.google_actions.getIntentHandler(name, metric);
    if (handler){
      var sbx = initializeSandbox();
      handler(function (title, response) {
        console.log('response: ', response);
        res.json(ctx.google_actions.buildSpeechletResponse(response, false));
        next( );
        return;
      }, req.body.intent.params, sbx);
      console.log('sbx: ', sbx); 
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
