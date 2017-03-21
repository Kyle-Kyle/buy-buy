var app = require('./index');
var path = require('path');

app.get('/items/:iid/pictures/:p', function(req, res){
	var iid = req.params.iid;
	var p = req.params.p;
	model.Item.get(iid, function(result){
		if(result.feedback != 'Success')return res.status(404).send('Not found');
		var item = result.item;
		var i = item.pictures.indexOf(p);
		if(i < 0)return res.status(404).send('Not found');
		res.sendFile(path.join(__dirname, '..', 'uploads', item._id.toString(), p+'.jpg'));
	});
});
app.get('/items/:iid/thumbnails/:p', function(req, res){
	var iid = req.params.iid;
	var p = req.params.p;
	model.Item.get(iid, function(result){
		if(result.feedback != 'Success')return res.status(404).send('Not found');
		var item = result.item;
		var i = item.pictures.indexOf(p);
		if(i < 0)return res.status(404).send('Not found');
		res.sendFile(path.join(__dirname, '..', 'uploads', item._id.toString(), p+'_thumbnail.jpg'));
	});
});
