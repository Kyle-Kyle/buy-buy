var express = require('express');
var app = express();
module.exports = app;

// load configurations
var config = require('../config');
for(var key in config) {
    app.set(key, config[key]);
}
require('./tools/signal');

require('./db');
require('./view');
require('./resource');

app.listen(app.get('port'), function(){
    console.log('Buy-Buy is running on port', app.get('port'));
});
