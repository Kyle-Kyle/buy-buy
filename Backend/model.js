db = require('./db');
escape_html = require('escape-html');

// User model
var User_Schema = db.Schema({
	username: {type: String, required: true, unique: true, match: /^[A-Za-z0-9_.]{3,20}$/},
	password: {type: String, required: true},
	history: [{type: db.Schema.Types.ObjectId, ref: 'Transaction', validate: {isAsync: true, validator: transaction_val}}],
	profile: {
		nickname: {type: String, match: /^[A-Za-z0-9_]{3,20}$/, default: ''},
		description: {type: String, match: /^.{0,300}$/, default: ''},
		phone: {type: String, match: /^\+?[\d\s]{3,20}$/, default: ''},
		wechat: {type: String, match: /^[A-Za-z0-9]{3:20}$/, default: ''},
		email: {type: String, match: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, default: ''},
		qq: {type: String, match: /^\d{4,12}$/, default: ''},
		facebook: {type: String, match: /^[A-Za-z0-9_.\s]{3,50}$/, default: ''}
	},
	email: {type: String, required: true, unique: true, match: /^1155\d{6}@link\.cuhk\.edu\.hk$/},
	msg_buf: [{type: db.Schema.Types.ObjectId, ref: 'User', validate: {isAsync: true, validator: user_val}}]
});
// User model: search by uid
User_Schema.statics.get = function(uid, cb){
	this.model('User').findById(uid, function(err, user){
		err_msg = 'Fail to find user.';
		if(err){
			if(err.message.indexOf('Cast') > -1){
				err_msg = 'Invalid User ID';
			}
			cb({feedback: 'Failure', err_msg: err_msg});
			return;
		}
		if(!user){
			err_msg = 'Invalid User ID';
			cb({feedback: 'Failure', err_msg: err_msg});
			return;
		}
		cb({feedback: 'Success', user: user});
		return;
	});
}
// User model: update profile
User_Schema.methods.update_profile = function(profile, cb){
	this.profile = profile;
	this.profile.description = profile.description;
	this.save(function(err, user){
		err_msg = 'Fail to update information';
		if(err){
			if(err.message.indexOf('validation') > -1){
				err_msg = 'Invalid information';
			}
			cb({feedback: 'Failure', err_msg: err_msg});
			return;
		}
		cb({feedback: 'Success', user: user});
		return;
	});
}
// User model: create new instance
User_Schema.statics.new_ = function(info, cb){
	var User = this.model('User');
	info.history = []
	info.msg_buf = []
	User.create(info, function(err, user){
		err_msg = 'Fail to create user';
		if(err){
			if(err.message.indexOf('duplicate') > -1){
				err_msg = 'The username is taken';
				if(err.message.indexOf('$email') > -1)err_msg = 'The email is taken';
			}
			if(err.message.indexOf('validation') > -1){
				err_msg = 'Invalid information';
			}
			cb({feedback: 'Failure', err_msg: err_msg});
			return;
		}
		cb({feedback: 'Success', user: user});
		return;
	});
}

// validation function for attribute, in case of JSON parse injection
function str_array(v){
	if(v.indexOf('title') < 0)return false;
	if(v.indexOf('description') < 0)return false;
	if(v.indexOf('condition') < 0)return false;
	for(var i=0;i<v.length;i++){
		if(!/^[A-Za-z0-9\s]{3,20}$/.test(v[i]))return false;
	}
	return true;
}
function pos_val(v){
	return (v >= 0)
}
// Category model
var  Category_Schema = db.Schema({
	name: {type: String, required: true, unique: true, match: /^[A-Za-z0-9]{3,20}$/},
	attributes: {type: Array, required: true, validate: {validator: str_array}},
	sold: {type: Number, default: 0, validate: {validator: pos_val}}
});
// Category model: create new instance
Category_Schema.statics.new_ = function(info, cb){
	delete info['sold']; // in case of fake sold number
	var Category = this.model('Category');
	Category.create(info, function(err, category){
		err_msg = 'Fail to create category';
		if(err){
			if(err.message.indexOf('duplicate') > -1){
				err_msg = 'The category name is taken';
			}
			if(err.message.indexOf('validation') > -1){
				err_msg = 'Invalid information';
			}
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', category: category});
	});
}
// Category model: search by cid
Category_Schema.statics.get = function(cid, cb){
	this.model('Category').findById(cid, function(err, category){
		err_msg = 'Fail to find category.';
		if(err){
			if(err.message.indexOf('Cast') > -1){
				err_msg = 'Invalid Category ID';
			}
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		if(!category){
			err_msg = 'Invalid Category ID';
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', category: category});
	});
}
// Category model: update category name
Category_Schema.methods.update_name = function(name, cb){
	this.name = name;
	this.save(function(err, category){
		if(err){
			err_msg = 'Fail to update information';
			/*more need to verify: duplication, validation*/
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', category: category});
	});
};
// Category model: delete category
Category_Schema.methods.delete_ = function(cb){
	this.remove(function(err){
		if(err){
			err_msg = 'Fail to remove category';
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success'});
	});
}

// Item validators
function attribute_val(d, cb){
	this.model('Category').get(this.cid, function(result){
		if(result.feedback != 'Success')return false;
		attr1 = result.category.attributes.sort();
		attr2 = Object.keys(d).sort();
		if(attr1.length == attr2.length && attr1.every(function(u, i){return u === attr2[i]}))return cb(true);
		return cb(false);
	})
}
// Item model
var Item_Schema = db.Schema({
	uid: {type: db.Schema.ObjectId, ref: 'User', required: true, validate: {isAsync: true, validator: user_val}},
	cid: {type: db.Schema.ObjectId, ref: 'Category', required: true, validate: {isAsync: true, validator: category_val}},
	quantity: {type: Number, required: true, validate: {validator: pos_val}},
	price: {type: Number, required: true, validate: {validator: pos_val}},
	tags: [{type: String, match: /[^<>]{1,20}/}],
	comment_id : {type: db.Schema.ObjectId, ref: 'Comment', validate: {isAsync: true, validator: comment_val}},
	pictures: [{type: Number}],
	attributes: {type: db.Schema.Types.Mixed, required:true, validate: {isAsync:true, validator: attribute_val}},
	open_timestamp: {type: Number, default: 0},
	close_timestamp: {type: Number, default: 0}
});
// set price precision
Item_Schema.path('price').set(function(num) {
	return num.toFixed(2);
});
// Item model: create new instance
Item_Schema.statics.new_ = function(info, cb){
	var Item = this.model('Item');
	timestamp = +new Date();
	info.open_timestamp = timestamp;
	delete info.close_timestamp;
	delete info.comments;
	delete info.comment_id;
	info.pictures = [];
	if(typeof(info.tags) !== 'undefined' && info.tags){
		for(var i=0;i<info.tags.length;i++)info.tags[i] = escape_html(info.tags[i]);
		this.tags = info.tags
	}
	for(var key in info.attributes){
		info.attributes[key] = escape_html(info.attributes[key]);
	}
	Item.create(info, function(err, item){
		err_msg = 'Fail to create item';
		if(err){
			if(err.message.indexOf('validation') > -1){
				err_msg = 'Invalid information';
			}
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		var Comment = db.model('Comment', Comment_Schema);
		Comment.new_({iid: item._id}, function(result){
			if(result.feedback != 'Success'){
				item.remove();
				return cb({feedback: 'Failure', err_msg: err_msg});
			}
			item.comment_id = result.comment._id;
			item.save(function(err, item){
				if(err)return cb({feedback: 'Failure', err_msg: err_msg});
			});
			return cb({feedback: 'Success', item: item});
		});
	});
}
// Item model: get by item id
Item_Schema.statics.get = function(iid, cb){
	this.model('Item').findById(iid, function(err, item){
		err_msg = 'Fail to find item.';
		if(err){
			if(err.message.indexOf('Cast') > -1){
				err_msg = 'Invalid Item ID';
			}
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		if(!item){
			err_msg = 'Invalid Item ID';
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', item: item});
	});
}
// Item model: update item info [price, quantity, tags, attributes]
Item_Schema.methods.update_info = function(info, cb){
	if(typeof(info.price) !== 'undefined' && info.price){
		this.price = info.price
	}
	if(typeof(info.quantity) !== 'undefined'){
		this.quantity = info.quantity
	}
	if(typeof(info.tags) !== 'undefined' && info.tags){
		for(var i=0;i<info.tags.length;i++)info.tags[i] = escape_html(info.tags[i]);
		this.tags = info.tags
	}
	if(typeof(info.attributes) !== 'undefined' && info.attributes){
		for(var key in info.attributes){
			info.attributes[key] = escape_html(info.attributes[key]);
		}
		this.attributes = info.attributes
	}
	this.save(function(err, item){
		if(err){
			err_msg = 'Fail to update information';
			/*more need to verify: duplication, validation*/
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', item: item});
	});
};
// Item model: delete item
Item_Schema.methods.delete_ = function(cb){
	this.remove(function(err){
		if(err){
			err_msg = 'Fail to delete item';
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success'});
	});
}

// Message model
var Message_Schema = db.Schema({
	uid1: {type: db.Schema.ObjectId, ref: 'User', required: true, validate: {isAsync: true, validator: user_val}},
	uid2: {type: db.Schema.ObjectId, ref: 'User', required: true, validate: {isAsync: true, validator: user_val}},
	messages: {type: Array, default: []},
});
// Message model: get message by id
Message_Schema.statics.get = function(mid, cb){
	this.model('Message').findById(mid, function(err, message){
		err_msg = 'Fail to find message';
		if(err){
			if(err.message.indexOf('Cast') > -1){
				err_msg = 'Invalid Message ID';
			}
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		if(!message){
			err_msg = 'Invalid Message ID';
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', message: message});
	});
}
// Message model: create new instance
Message_Schema.statics.new_ = function(info, cb){
	delete info.messages;
	var Message = this.model('Message');
	Message.create(info, function(err, message){
		err_msg = 'Fail to create message';
		if(err){
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', message: message});
	});
}

// Follow model
var Follow_Schema = db.Schema({
	follower_id: {type: db.Schema.ObjectId, ref: 'User', required: true, validate: {isAsync: true, validator: user_val}},
	followee_id: {type: db.Schema.ObjectId, ref: 'User', required: true, validate: {isAsync: true, validator: user_val}},
	timestamp: {type: Number, required: true}
});
// Follow model: search by id
Follow_Schema.statics.get = function(fid, cb){
	this.model('Follow').findById(fid, function(err, follow){
		err_msg = 'Fail to find follow instance';
		if(err){
			if(err.message.indexOf('Cast') > -1){
				err_msg = 'Invalid Follow ID';
			}
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		if(!follow){
			err_msg = 'Invalid Follow ID';
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', follow: follow});
	});
}
// Follow model: create new instance
Follow_Schema.statics.new_ = function(info, cb){
	var Follow = this.model('Follow');
	info.timestamp = +new Date();
	Follow.create(info, function(err, follow){
		err_msg = 'Fail to create follow instance';
		if(err){
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', follow: follow});
	});
}
// Follow model: delete instance
Follow_Schema.methods.delete_ = function(cb){
	this.remove(function(err){
		if(err){
			err_msg = 'Fail to remove follow instance';
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success'});
	});
}

// Transaction model
var Transaction_Schema = db.Schema({
	seller_id: {type: db.Schema.ObjectId, ref: 'User', required: true, validate: {isAsync: true, validator: user_val}},
	buyer_id: {type: db.Schema.ObjectId, ref: 'User', required: true, validate: {isAsync: true, validator: user_val}},
	iid: {type: db.Schema.ObjectId, ref: 'Item', required: true, validate: {isAsync: true, validator: item_val}},
	status_code: {type: Number, default: 1, enum: [1, 2, 3, 4, 5]},
	timestamp: {type: Array, required: true}
});
// Transaction model: search by id
Transaction_Schema.statics.get = function(tid, cb){
	this.model('Transaction').findById(tid, function(err, trans){
		err_msg = 'Fail to find transaction';
		if(err){
			if(err.message.indexOf('Cast') > -1){
				err_msg = 'Invalid Transaction ID';
			}
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		if(!trans){
			err_msg = 'Invalid Transaction ID';
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', transaction: trans});
	});
}
// Transaction model: create new instance
Transaction_Schema.statics.new_ = function(info, cb){
	delete info.status_code;
	var Transaction = this.model('Transaction');
	info.timestamp = [+new Date(), 0, 0, 0, 0];
	Transaction.create(info, function(err, trans){
		err_msg = 'Fail to create transaction';
		if(err){
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', transaction: trans});
	});
}
// Transaction model: update status code
Transaction_Schema.methods.update_status_code = function(status_code, cb){
	this.status_code = status_code;
	this.timestamp.set(status_code-1, +new Date());
	this.save(function(err, trans){
		if(err){
			err_msg = 'Fail to update information';
			/*more need to verify: duplication, validation*/
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', transaction: trans});
	});
};

// Comment model
var Comment_Schema = db.Schema({
	iid: {type: db.Schema.ObjectId, required: true, validate: {isAsync: true, validator: item_val}},
	comments: {type: Array, default: []},
});
// Comment model: create new instance
Comment_Schema.statics.new_ = function(info, cb){
	delete info.comments;
	var Comment = this.model('Comment');
	Comment.create(info, function(err, comment){
		err_msg = 'Fail to create comment';
		if(err){
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', comment: comment});
	});
}

function user_val(uid, cb){
	this.model('User').findById(uid, function(err, user){
		if(err)return cb(false);
		if(!user)return cb(false);
		return cb(true);
	})
}
function category_val(cid, cb){
	this.model('Category').findById(cid, function(err, category){
		if(err)return cb(false);
		if(!category)return cb(false);
		return cb(true);
	})
}
function item_val(iid, cb){
	this.model('Item').findById(iid, function(err, item){
		if(err)return cb(false);
		if(!item)return cb(false);
		return cb(true);
	})
}
function message_val(mid, cb){
	this.model('Message').findById(mid, function(err, message){
		if(err)return cb(false);
		if(!message)return cb(false);
		return cb(true);
	})
}
function transaction_val(tid, cb){
	this.model('Transaction').findById(tid, function(err, trans){
		if(err)return cb(false);
		if(!trans)return cb(false);
		return cb(true);
	})
}
function comment_val(coid, cb){
	this.model('Comment').findById(coid, function(err, comment){
		if(err)return cb(false);
		if(!comment)return cb(false);
		return cb(true);
	})
}
var User = db.model('User', User_Schema);
var Category = db.model('Category', Category_Schema);
var Item = db.model('Item', Item_Schema);
var Message = db.model('Message', Message_Schema);
var Follow = db.model('Follow', Follow_Schema);
var Transaction = db.model('Transaction', Transaction_Schema);
var Comment = db.model('Comment', Comment_Schema);
module.exports.User = User;
module.exports.Category = Category;
module.exports.Item = Item;
module.exports.Message = Message;
module.exports.Follow = Follow;
module.exports.Transaction = Transaction;
module.exports.Comment = Comment;
