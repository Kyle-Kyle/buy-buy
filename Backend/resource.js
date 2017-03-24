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
// create comments
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
//get item details
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
//update item info
app.put('/items/:iid', function(req, res){
	if(!check_login(req, res))return;
	var iid=req.params.iid;
	var info=req.body;
	try{
		info.tags = JSON.parse(info.tags);
		info.attributes = JSON.parse(info.attributes);
		info.price = parseFloat(info.price);
		info.quantity = parseInt(info.quantity);
	}catch(err){
		return res.send({feedback: 'Failure'});
	}
	model.Item.get(iid, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var item=result.item;
		item.update_info(info, function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			res.send(result);
		})
	})
})
//delete item
app.delete('/items/:iid', function(req, res){
	if(!check_login(req, res))return;
	var iid=req.params.iid;
	model.Item.get(iid, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var item=result.item;
		model.Item.delete_(function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			res.send(result);
		})
	})
})

//get user info
app.get('/users/:uid', function(req, res, next){
	var uid = req.params.uid;
	if(uid == 'self')return next();
	if(!check_login(req, res))return;
	model.User.findById(uid, '_id username email profile', function(err, user){
		if(err)return res.send({feedback: 'Failure', err_msg: 'Invalid information'});
		return res.send({feedback: 'Success',user:user});
	});
})
//get self info
app.get('/users/self', function(req, res){
	if(!check_login(req, res))return;
	var uid = req.session.uid;
	model.User.findById(uid, '_id username email profile msg_buf history', function(err, user){
		if(err){
			req.session.destroy();
			return res.send({feedback: 'Failure', err_msg: 'Invalid information'});
		}
		return res.send({feedback: 'Success',user:user});
	})
})
//update user info
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
//get items of a user
app.get('/users/self/items',function(req, res){
	if(!check_login(req, res))return;
	var uid=req.session.uid;
	model.Item.find({uid:uid}, function(err,items){
		err_msg= 'Fail to get items of this user.'
		if(err){
			//may change err_msg
			return res.send({feedback: 'Failure', err_msg: err_msg});
		}
		if(!items){
			err_msg= 'No item returned.';
			return res.send({feedback: 'Failure', err_msg: err_msg});
		}
		return res.send({feedback: 'Success', items: items});
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

//Message resource need modify
//send message
app.post('/messages/:uid', function(req, res){
	if(!check_login(req, res))return;
	var info = req.body;
	var uid=req.params.uid;
	var uid2=req.session.uid;
	model.User.get(uid2, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var user=result.user;
		user.send_msg(info,function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			res.send(result);
		})
	})
})
//check new messages
app.get('/users/new_messages', function(req, res){
	if(!check_login(req, res))return;
	var uid=req.session.uid;
	model.User.get(uid, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var msg_buf=result.user.msg_buf;
		res.send({feedback: 'Success', msg_buf:msg_buf})
	})
})
//receive messages
app.get('/messages/:uid', function(req, res){
	if(!check_login(req, res))return;
	var uid=req.params.uid;
	var uid2=req.session.uid;
	model.User.get(uid2, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var user=result.user;
		user.recv_msg(uid, function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			res.send(result);
		})
	})
})

//Follow resource
//follow
app.get('/follow/:uid',function(req, res){
	if(!check_login(req, res))return;
	var followee_uid=req.params.uid;
	var follower_uid=req.session.uid;
	model.User.get(follower_uid, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var user=result.user;
		user.follow(followee_uid,function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			res.send(result);
		})
	})
})
//unfollow
app.get('/unfollow/:uid',function(req, res){
	if(!check_login(req, res))return;
	var followee_uid=req.params.uid;
	var follower_uid=req.session.uid;
	model.User.get(follower_uid, function(result){
		if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
		var user=result.user;
		user.unfollow(followee_uid,function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			res.send(result);
		})
	})
})

//list followees
app.get('/follow/followees', function(req, res){
	if(!check_login(req, res))return;
	var uid=req.session.uid;
	model.Follow.find({follower_uid:uid},function(err, followees){
		err_msg='Fail to find followees.';
		if(err){
			//may change err_msg
			return res.send({feedback: 'Failure', err_msg: err_msg});
		}
		if(!user){
			//may change err_msg
			return res.send({feedback: 'Failure', err_msg: err_msg});
		}
		return res.send({feedback: 'Success', followees: followees})
	})
})
//list followers
app.get('/follow/followers', function(req, res){
	if(!check_login(req, res))return;
	var uid=req.session.uid;
	model.Follow.find({followee_uid:uid},function(err, followers){
		err_msg='Fail to find followers.';
		if(err){
			//may change err_msg
			return res.send({feedback: 'Failure', err_msg: err_msg});
		}
		if(!user){
			//may change err_msg
			return res.send({feedback: 'Failure', err_msg: err_msg});
		}
		return res.send({feedback: 'Success', followers: followers})
	})
})

//Transaction resource
//buy request
app.post('/transactions/create', function(req, res){
	if(!check_login(req, res))return;
	var info=req.body;
	var iid=info.iid;
	var uid=req.session.uid;
	model.User.get(uid, function(result){
		var user=result.user;
		user.buy_request(iid, function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			res.send(result);
		})
	})
})
//sell confirm
app.get('/transactions/:tid/confirm', function(req, res){
	if(!check_login(req, res))return;
	var tid=req.params.tid;
	var uid=req.session.uid;
	model.User.get(uid, function(result){
		var user=result.user;
		user.sell_confirm(tid, function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			res.send(result);
		})
	})
})
//receive confirm
app.get('/transactions/:tid/receive', function(req, res){
	if(!check_login(req, res))return;
	var tid=req.params.tid;
	var uid=req.session.uid;
	model.User.get(uid, function(result){
		var user=result.user;
		user.recv_from(tid, function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			res.send(result);
		})
	})
})
//seller reject
app.get('/transactions/:tid/reject', function(req, res){
	if(!check_login(req, res))return;
	var tid=req.params.tid;
	var uid=req.session.uid;
	model.User.get(uid, function(result){
		var user=result.user;
		user.seller_reject(tid, function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			res.send(result);
		})
	})
})
//buyer cancel
app.get('/transactions/:tid/cancel', function(req, res){
	if(!check_login(req, res))return;
	var tid=req.params.tid;
	var uid=req.session.uid;
	model.User.get(uid, function(result){
		var user=result.user;
		user.buyer_cancel(tid, function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure'});
			res.send(result);
		})
	})
})

//debug test, for testing only, should be removed when the website goes online
//for convenience, no error handling here
app.get('/showdbs', function(req,res){
	var dbs={}
	model.User.find({}, function(err ,user){
		dbs.user=user;
		model.Item.find({}, function(err ,item){
			dbs.item=item;
			model.Category.find({}, function(err ,category){
				dbs.category=category;
				model.Follow.find({}, function(err ,follow){
					dbs.follow=follow;
					model.Message.find({}, function(err ,message){
						dbs.message=message;
						model.Transaction.find({}, function(err ,transaction){
							dbs.transaction=transaction;
							return res.send({feedback:'Success', dbs:dbs})
						})
					})
				})
			})
		})
	})
})

