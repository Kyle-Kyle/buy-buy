// connection
var db = require('mongoose');
var app = require('./index');
<<<<<<< HEAD
=======
db.Promise = global.Promise;
>>>>>>> cc247f248e817f88f764db59521827940dd87c97
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
