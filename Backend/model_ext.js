model = require('./model');
db = require('./db');
escape_html = require('escape-html');
app = require('./index');

User = model.User;
Category = model.Category;
Item = model.Item;
Message  = model.Message;
Follow = model.Follow;
Transaction = model.Transaction;
Comment = model.Comment;

// User model extension
User.prototype.update_buffer = function(uid, cb){
	var user = this;
	if(this.msg_buf.indexOf(uid) > -1)return cb({feedback: 'Success'});
	if(!db.Types.ObjectId.isValid(uid))return cb({feedback: 'Failure', err_msg: 'Invalid Message ID'});
	this.msg_buf.push(uid);
	this.save(function(err, user){
		err_msg = 'Fail to update buffer';
		if(err)return cb({feedback: 'Failure', err_msg: err_msg});
		return cb({feedback: 'Success'});
	});
}
User.prototype.clear_buffer = function(uid, cb){
	var user = this;
	if(this.msg_buf.indexOf(uid) < 0)return cb({feedback: 'Success'});
	this.msg_buf.splice(this.msg_buf.indexOf(uid), 1);
	this.save(function(err, user){
		err_msg = 'Fail to clear buffer';
		if(err)return cb({feedback: 'Failure', err_msg: err_msg});
		return cb({feedback: 'Success'});
	})
}
User.prototype.create_item = function(info, cb){
	info.uid = this._id;
	Item.new_(info, function(result){
		cb(result);
	})
}
User.prototype.follow = function(uid, cb){
	var user = this;
	if(user._id == uid)return cb({feedback: 'Failure', err_msg: 'Self follow is prohibited'});
	Follow.findOne({follower_id: user._id, followee_id: uid}, function(err, follow){
		if(err)return cb({feedback: 'Failure', err_msg: 'Fail to find follow instance'});
		if(follow)return cb({feedback: 'Failure', err_msg: 'Follow instance exists'});
		Follow.new_({follower_id: user._id, followee_id: uid}, function(result){
			return cb(result);
		});
	})
}
User.prototype.unfollow = function(uid, cb){
	var user = this;
	if(user._id == uid)return cb({feedback: 'Failure', err_msg: 'Self unfollow is prohibited'});
	Follow.findOne({follower_id: user._id, followee_id: uid}, function(err, follow){
		if(err)return cb({feedback: 'Failure', err_msg: 'Fail to find follow instance'});
		if(!follow)return cb({feedback: 'Failure', err_msg: 'Follow instance doesn\'t exist'});
		follow.delete_(function(result){
			cb(result);
		});
	})
}
User.prototype.send_msg = function(info, cb){
	if(typeof(info.content) == 'undefined' || !info.content)return cb({feedback: 'Success', err_msg: 'Invalid information'});
	if(typeof(info.uid) == 'undefined' || !info.uid)return cb({feedback: 'Success', err_msg: 'Invalid information'});
	if(this._id == info.uid)return cb({feedback: 'Failure', err_msg: 'Self message sending is prohibited'});
	var uid1 = info.uid;
	var uid2 = this._id;
	var u = 2;
	if(this._id < info.uid){
		uid1 = this._id;
		uid2 = info.uid;
		u = 1;
	}
	var user = this;
	info.content = escape_html(info.content);
	Message.findOne({uid1: uid1, uid2: uid2}, function(err, message){
		if(err)return cb({feedback: 'Failure', err_msg: 'Fail to find message'});
		if(!message){
			var messages = [[u, info.content, +new Date()]];
			Message.new_({uid1: uid1, uid2: uid2, messages: messages}, function(result){
				if(result.feedback != 'Success')return cb(result);
				user.update_buffer(info.uid, function(result){
					if(result.feedback != 'Success')return cb(result);
					return cb({feedback: 'Success', message: message});
				});
			})
		}
		else{
			var messages = message.messages;
			if(messages.length == app.get('msg_buf_size')){
				messages.pull(messages[0]);
			}
			messages.set(messages.length, [u, info.content, +new Date()]);
			message.messages = messages;
			message.save(function(err, message){
				if(err)return cb({feedback: 'Failure', err_msg: 'Fail to save message'});
				user.update_buffer(info.uid, function(result){
					if(result.feedback != 'Success')return cb(result);
					return cb({feedback: 'Success', message: message});
				});
			});
		}
	})
}
User.prototype.recv_msg = function(uid, cb){
	if(typeof(uid) == 'undefined' || !uid)return cb({feedback: 'Failure', err_msg: 'Invalid information'});
	if(uid == this._id)return cb({feedback: 'Failure', err_msg: 'Self message receiving is prohibited'});
	var uid1 = uid;
	var uid2 = this._id;
	if(this._id < uid){
		uid1 = this._id;
		uid2 = uid;
	}
	var user = this;
	Message.findOne({uid1: uid1, uid2 :uid2}, function(err, message){
		if(err)return cb({feedback: 'Failure', err_msg: 'Fail to find message'});
		if(!message)return cb({feedback: 'Success', message: {uid1: uid1, uid2:uid2, messages:[]}});
		user.clear_buffer(uid, function(result){
			if(result.feedback != 'Success')return cb(result);
			return cb({feedback: 'Success', message: message});
		});
	});
}

// Category model extension
Category.prototype.update_sold = function(cb){
	this.sold += 1;
	this.save(function(err, category){
		if(err)return cb({feedback: 'Failure', err_msg: 'Fail to update sold'});
		return cb({feedback: 'Success', category: category});
	})
}
Category.prototype.get_items = function(cb){
	Item.find({cid: this._id}, function(err, items){
		if(err)return cb({feedback: 'Failure', err_msg: 'Fail to find items under this category'});
		return cb({feedback: 'Success', items: items});
	});
}

module.exports.User = User;
module.exports.Category = Category;
module.exports.Item = Item;
module.exports.Message = Message;
module.exports.Follow = Follow;
module.exports.Transaction = Transaction;
module.exports.Comment = Comment;
