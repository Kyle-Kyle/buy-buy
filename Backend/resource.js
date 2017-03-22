var app = require('./index');
var path = require('path');
var control = require('./control');
var model = require('./model_ext');
var check_login = control.check_login;

// Picture resource
app.get('/items/:iid/pictures/:p', function(req, res){
	var iid = req.params.iid;
	var p = req.params.p;
	model.Item.get(iid, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var item = result.item;
		var i = item.pictures.indexOf(p);
		if(i < 0)return res.send({feedback: 'Failure'});
		res.sendFile(path.join(__dirname, '..', 'uploads', item._id.toString(), p+'.jpg'));
	});
});
app.get('/items/:iid/thumbnails/:p', function(req, res){
	var iid = req.params.iid;
	var p = req.params.p;
	model.Item.get(iid, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var item = result.item;
		var i = item.pictures.indexOf(p);
		if(i < 0)return res.send({feedback: 'Failure'});
		res.sendFile(path.join(__dirname, '..', 'uploads', item._id.toString(), p+'_thumbnail.jpg'));
	});
});

// Comment resource
app.get('/items/:iid/comments', function(req, res){
	var iid = req.params.iid;
	model.Item.get(iid, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var item = result.item;
		item.populate('comment_id', function(err, item){
			if(err)return res.send({feedback: 'Failure'});
			res.send({feedback: 'Success', comments: item.comment_id.comments});
		});
	})
})
app.post('/items/:iid/comments', function(req, res){
	if(!check_login(req, res))return;
	var iid = req.params.iid;
	var content = req.body.content;
	var uid = req.session.uid;
	model.User.get(uid, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var user = result.user;
		user.comment({iid: iid, content: content}, function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			return res.send({feedback: 'Success', comments: result.comment.comments});
		})
	})
});
// Item create
app.post('/items/create', function(req, res){
	if(!check_login(req, res))return;
	var info = req.body;
	try{
		info.tags = JSON.parse(info.tags);
		info.attributes = JSON.parse(info.attributes);
		info.price = parseFloat(info.price);
		info.quantity = parseInt(info.quantity);
	}catch(err){
		return res.send({feedback: 'Failure'});
	}
	model.User.get(req.session.uid, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var user = result.user;
		user.create_item(info, function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			res.send(result);
		})
	})
})
app.get('/items/:iid', function(req, res){
	var iid = req.params.iid;
	model.Item.get(iid, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var item = result.item;
		item.populate('comment_id').populate('cid', function(err, item){
			if(err)return res.send({feedback: 'Failure'});
			var item = item.toObject();
			try{
				delete item.__v;
				delete item.cid.__v;
				delete item.cid.attributes;
				delete item.comment_id.__v;
				delete item.comment_id.iid;
			}catch(e){
				return res.send({feedback: 'Failure'});
			}
			return res.send({feedback: 'Success', item: item});
		})
	})
})
app.get('/users/:uid', function(req, res, next){
	var uid = req.params.uid;
	if(uid == 'self')return next();
	if(!check_login(req, res))return;
	model.User.findById(uid, '_id username email profile', function(err, user){
		if(err)return res.send({feedback: 'Failure', err_msg: 'Invalid information'});
		return res.send(user);
	});
})
app.get('/users/self', function(req, res){
	if(!check_login(req, res))return;
	var uid = req.session.uid;
	model.User.findById(uid, '_id username email profile msg_buf history', function(err, user){
		if(err){
			req.session.destroy();
			return res.send({feedback: 'Failure', err_msg: 'Invalid information'});
		}
		return res.send(user);
	})
})
app.put('/users/update', function(req, res){
	if(!check_login(req, res))return;
	var uid = req.session.uid;
	model.User.get(uid, function(result){
		if(result.feedback != 'Success')return res.send(result);
		var user = result.user;
		var keys = Object.keys(user.profile.toObject());
		var info = {};
		for(var i=0; i<keys.length; i++){
			var key = keys[i];
			if(req.body[key])info[key] = req.body[key];
			else info[key] = '';
		}
		user.update_profile(info, function(result){
			var user = result.user.toObject();
			delete user['password'];
			delete user['__v'];
			return res.send({feedback: 'Success', user: user});
		});
	})
})

//Get category list
app.get('/categories',function(req,res){
	model.Category.find({}, function(err,categories){
		err_msg= 'Fail to get category list.';
		if(err){
			//may change err_msg
			
			return res.send({feedback: 'Failure', err_msg: err_msg});
		}
		if(!categories){
			err_msg= 'No category returned.';
			return res.send({feedback: 'Failure', err_msg: err_msg});
		}
		return res.send({feedback: 'Success', categories: categories});
	})
})
//Get items under a category
app.get('/categories/:cid/items',function(req,res){
	var cid=req.params.cid;
	model.Category.get(cid, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var category=result.category;
		category.get_items(function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			res.send(result);
		})
	})
})
