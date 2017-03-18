db = require('./db');

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
var User = db.model('User', User_Schema);
module.exports.User = User;

/*var Item_Schema = db.Schema({
    uid: {type: db.Schema.ObjectId, ref: 'User'},
});
var Item = db.model('Item', Item_Schema);
module.exports.Item = Item;*/

function str_array(v){
	if(v.indexOf('title') < 0)return false;
	if(v.indexOf('description') < 0)return false;
	for(var i=0;i<v.length;i++){
		if(!/^[A-Za-z0-9\s]{3,20}$/.test(v[i]))return false;
	}
	return true;
}
var  Category_Schema = db.Schema({
	name: {type: String, required: true, unique: true, match: /^[A-Za-z0-9]{3,20}$/},
	attributes: {type: Array, required: true, validate: {validator: str_array}},
	sold: {type: Number, default: 0}
});

Category_Schema.statics.new_ = function(info, cb){
	delete info['sold'];
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
Category_Schema.methods.delete_ = function(cb){
	this.remove(function(err){
		if(err){
			err_msg = 'Fail to remove';
			return cb({feedback: 'Failure', err_msg: err_msg});
		}
		return cb({feedback: 'Success'});
	});
}
var Category = db.model('Category', Category_Schema);
module.exports.Category = Category;
