db = require('./db');

// User model
var User_Schema = db.Schema({
    username: {type: String, required: true, unique: true, match: /^[A-z0-9_]{3,20}$/},
    password: {type: String, required: true},
    history: {type: Array, default: []},
    profile: {type: db.Schema.Types.Mixed, default: {}},
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
User_Schema.methods.commit = function(cb){
    this.save(function(err, user){
        err_msg = 'Fail to save information';
        if(err){
            if(err.message.indexOf('duplicate') > -1){
                err_msg = 'This username is taken';
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
