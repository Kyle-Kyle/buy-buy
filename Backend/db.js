/***********
 * Module for database connection
 *
 * module name: db
 * programmer: Kyle-Kyle
 * version: 0.0
 * 
 * This module sets up database connection and return a database handler if success
***********/

// connection
var db = require('mongoose');
var app = require('./index');
db.Promise = global.Promise;
db.connect('mongodb://'+app.get('db_u')+':'+app.get('db_p')+'@'+app.get('db_domain')+':'+app.get('db_port')+'/'+app.get('db_db'));
var conn = db.connection;

// error
conn.on('error', function(err) {
    console.log('Database connection error:', err);
    process.exit(1)
});

// success
conn.once('open', function() {
    console.log("Database connection success...");
});

module.exports = db;
