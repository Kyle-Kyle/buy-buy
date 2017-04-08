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
	if(user._id.toString() == uid)return cb({feedback: 'Failure', err_msg: 'Self follow is prohibited'});
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
	if(user._id.toString() == uid)return cb({feedback: 'Failure', err_msg: 'Self unfollow is prohibited'});
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
	if(this._id.toString() == info.uid)return cb({feedback: 'Failure', err_msg: 'Self message sending is prohibited'});
	var uid1 = info.uid;
	var uid2 = this._id;
	var u = 2;
	if(this._id < info.uid){
		uid1 = this._id;
		uid2 = info.uid;
		u = 1;
	}
	var sender = this;
	User.get(info.uid, function(result){
		if(result.feedback != 'Success')return cb(result);
		var receiver = result.user;
		info.content = escape_html(info.content);
		Message.findOne({uid1: uid1, uid2: uid2}, function(err, message){
			if(err)return cb({feedback: 'Failure', err_msg: 'Fail to find message'});
			if(!message){
				Message.new_({uid1: uid1, uid2: uid2}, function(result){
					if(result.feedback != 'Success')return cb(result);
					receiver.update_buffer(info.uid, function(result){
						if(result.feedback != 'Success')return cb(result);
						sender.send_msg(info, cb);
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
					receiver.update_buffer(info.uid, function(result){
						if(result.feedback != 'Success')return cb(result);
						return cb({feedback: 'Success', message: message});
					});
				});
			}
		})
	})
}
User.prototype.recv_msg = function(uid, cb){
	if(typeof(uid) == 'undefined' || !uid)return cb({feedback: 'Failure', err_msg: 'Invalid information'});
	if(uid == this._id.toString())return cb({feedback: 'Failure', err_msg: 'Self message receiving is prohibited'});
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
User.prototype.comment = function(info, cb){
	if(typeof(info.content) == 'undefined' || !info.content)return cb({feedback: 'Failure', err_msg: 'Invalid information'});
	info.content = escape_html(info.content);
	var user = this;
	Item.get(info.iid, function(result){
		if(result.feedback != 'Success')return cb(result);
		Comment.findById(result.item.comment_id, function(err, comment){
			if(err)return cb({feedback: 'Failure', err_msg: 'Fail to add comment'});
			comment.comments.set(comment.comments.length, [user._id, info.content, +new Date()]);
			comment.save(function(err, comment){
				if(err)return cb({feedback: 'Failure', err_msg: 'Fail to add comment'});
				return cb({feedback: 'Success', comment: comment});
			});
		});
	})
}
User.prototype.buy_request = function(iid, cb){
	var buyer = this;
	Item.get(iid, function(result){
		if(result.feedback != 'Success')return cb(result);
		if(buyer._id.toString() == result.item.uid)return cb({feedback: 'Failure', err_msg: 'Self buying is prohibited'});
		User.get(result.item.uid, function(result){
			if(result.feedback != 'Success')return cb(result);
			var seller = result.user;
			Transaction.new_({buyer_id: buyer._id, seller_id: seller._id, iid: iid}, function(result){
				if(result.feedback != 'Success')return cb(result);
				var trans = result.transaction;
				buyer.history.set(buyer.history.length, trans._id);
				seller.history.set(seller.history.length, trans._id);
				buyer.save();
				seller.save();
				return cb(result);
			})
		})
	})
}

User.prototype.sell_confirm = function(tid, cb){
	var user = this;
	Transaction.get(tid, function(result){
		if(result.feedback != 'Success')return cb(result);
		var trans = result.transaction;
		if(!trans.seller_id == user._id.toString())return cb({feedback: 'Failure', err_msg: 'Fail to confirm sale'});
		if(trans.status_code == 2)return cb({feedback: 'Success', transaction: trans});
		if(trans.status_code != 1)return cb({feedback: 'Failure', err_msg: 'Fail to confirm sale'});
		trans.update_status_code(2, function(result){
			return cb(result);
		});
	})
}
User.prototype.receive_confirm = function(tid, cb){
	var user = this;
	Transaction.get(tid, function(result){
		var trans = result.transaction;
		if(!trans.buyer_id == user._id.toString())return cb({feedback: 'Failure', err_msg: 'Fail to confirm receive'});
		if(trans.status_code == 3)return cb({feedback: 'Success', transaction: trans});
		if(trans.status_code != 2)return cb({feedback: 'Failure', err_msg: 'Fail to confirm receive'});
		trans.update_status_code(3, function(result){
			return cb(result);
		});
	});
}
User.prototype.seller_reject = function(tid, cb){
	var user = this;
	Transaction.get(tid, function(result){
		var trans = result.transaction;
		if(!trans.seller_id == user._id.toString())return cb({feedback: 'Failure', err_msg: 'Fail to reject sale'});
		if(trans.status_code == 4)return cb({feedback: 'Success', transaction: trans});
		if(trans.status_code != 1)return cb({feedback: 'Failure', err_msg: 'Fail to reject sale'});
		trans.update_status_code(4, function(result){
			return cb(result);
		});
	});
}
User.prototype.buyer_cancel = function(tid, cb){
	var user = this;
	Transaction.get(tid, function(result){
		var trans = result.transaction;
		if(!trans.buyer_id == user._id.toString())return cb({feedback: 'Failure', err_msg: 'Fail to cancel purchase'});
		if(trans.status_code == 5)return cb({feedback: 'Success', transaction: trans});
		if(trans.status_code != 1 && tran.status_code != 2)return cb({feedback: 'Failure', err_msg: 'Fail to cancel purchase'});
		trans.update_status_code(5, function(result){
			return cb(result);
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
