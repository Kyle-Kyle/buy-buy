var express = require('express');
var path = require('path');

var app = express();
module.exports = app;

app.use(express.static(path.join(__dirname, '../Frontend')));

app.get('/*.html', function(req, res) {
	res.type('text/html');
	console.log(path.join(__dirname, '../Frontend', req.url));
	res.sendFile(path.join(__dirname, '../Frontend', req.url));
});

app.listen(8081, function(){
    console.log('Buy-Buy is running on port', 8081);
});
