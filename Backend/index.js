var express = require('express');
var app = express();
module.exports = app;

// load configurations
var config = require('../config');
for(var key in config) {
    app.set(key, config[key]);
}
require('./tools/signal');
<<<<<<< HEAD
=======
var session = require('express-session');
app.use(session({
	secret: app.get('secret'),
	resave: false,
	saveUninitialized: false
}));
var body_parser = require('body-parser');
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));
>>>>>>> cc247f248e817f88f764db59521827940dd87c97

require('./db');
require('./view');
require('./resource');
<<<<<<< HEAD
=======
require('./control');
>>>>>>> cc247f248e817f88f764db59521827940dd87c97

app.listen(app.get('port'), function(){
    console.log('Buy-Buy is running on port', app.get('port'));
});
