db = require('./db');
escape_html = require('escape-html');

// User model
var User_Schema = db.Schema({
    username: {type: String, required: true, unique: true, match: /^[A-Za-z0-9_]{3,20}$/},
    password: {type: String, required: true},
    history: {type: Array, default: []},
    profile: {
        phone: {type: String, match: /^\+?[\d\s]{3,20}$/, default: ''},
        wechat: {type: String, match: /^[A-Za-z0-9]{3:20}$/, default: ''},
        email: {type: String, match: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, default: ''},
        qq: {type: String, match: /^\d{4,12}$/, default: ''},
        facebook: {type: String, match: /^[A-Za-z0-9_.\s]{3,50}$/, default: ''}
    },
    email: {type: String, required: true, unique: true, match: /^1155\d{6}@link\.cuhk\.edu\.hk$/},
    msg_buffer: {type: Array, default: []}
});
// User model: search by uid
User_Schema.statics.get = function(uid, cb){
    this.model('User').findOne({_id:uid}, function(err, user){
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
	this.save(function(err, result){
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
	this.model('Category').findOne({_id:cid}, function(err, category){
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
function tag_val(v){
	for(var i=0;i<v.length;i++){
		if(/[<>]/.test(v[i]) || v[i].length>20)return false;
	}
	return true;
}
function attribute_val(d, cb){
	Category.get(this.cid, function(result){
		if(result.feedback != 'Success')return false;
		attr1 = result.category.attributes.sort();
		attr2 = Object.keys(d).sort();
		if(attr1.length == attr2.length && attr1.every(function(u, i){return u === attr2[i]}))return cb(true);
		return cb(false);
	})
}
// Item model
var Item_Schema = db.Schema({
	uid: {type: db.Schema.ObjectId, required: true},
	cid: {type: db.Schema.ObjectId, required: true},
	quantity: {type: Number, required: true, validate: {validator: pos_val}},
	price: {type: Number, required: true, validate: {validator: pos_val}},
	tags: {type: Array, default: [], validate: {validator: tag_val}},
	comments: {type: Array, default: []},
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
	Item.create(info, function(err, item){
		err_msg = 'Fail to create item';
		if(err){
			if(err.message.indexOf('validation') > -1){
				err_msg = 'Invalid information';
			}
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', item: item});
	});
}
// Item model: get by item id
Item_Schema.statics.get = function(iid, cb){
	this.model('Item').findOne({_id:iid}, function(err, item){
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
	if(typeof(info.quantity) !== 'undefined' && info.quantity){
		this.quantity = info.quantity
	}
	if(typeof(info.tags) !== 'undefined' && info.tags){
		this.tags = info.tags
	}
	if(typeof(info.attributes) !== 'undefined' && info.attributes){
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
	uid1: {type: db.Schema.ObjectId, required: true},
	uid2: {type: db.Schema.ObjectId, required: true},
	messages: {type: Array, default: []},
});
// Message model: create new instance
Message_Schema.statics.new_ = function(info, cb){
	delete info.messages;
	var message = this.model('Message');
	Message.create(info, function(err, message){
		err_msg = 'Fail to create message';
		if(err){
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success', message: message});
	});
}

var User = db.model('User', User_Schema);
var Category = db.model('Category', Category_Schema);
var Item = db.model('Item', Item_Schema);
var Message = db.model('Message', Message_Schema);
module.exports.User = User;
module.exports.Category = Category;
module.exports.Item = Item;
module.exports.Message = Message;

model_ext = require('./model_ext');
Item = model_ext.Item;
Category = model_ext.Category;
User = model_ext.User;
