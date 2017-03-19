model = require('./model');
db = require('./db');

User = model.User;
Category = model.Category;
Item = model.Item;
Message  = model.Message;
Follow = model.Follow;
Transaction = model.Transaction;
Comment = model.Comment;

// message buffer module
User.prototype.update_buffer = function(mid, cb){
	user = this;
	if(this.msg_buf.indexOf(mid) > -1)return cb({feedback: 'Success', user: user});
	if(!db.Types.ObjectId.isValid(mid))return cb({feedback: 'Failure', err_msg: 'Invalid Message ID'});
	this.msg_buf.push(mid);
	this.save(function(err, user){
		err_msg = 'Fail to update buffer';
		if(err)return cb({feedback: 'Failure', err_msg: err_msg});
		return cb({feedback: 'Success', user: user});
	});
}
User.prototype.clear_buffer = function(mid, cb){
	user = this;
	if(this.msg_buf.indexOf(mid) < 0)return cb({feedback: 'Failure', err_msg: 'Fail to clear buffer'});
	this.msg_buf.splice(this.msg_buf.indexOf(mid), 1);
	this.save(function(err, user){
		err_msg = 'Fail to clear buffer';
		if(err)return cb({feedback: 'Failure', err_msg: err_msg});
		return cb({feedback: 'Success', user: user});
	})
}
User.prototype.create_item = function(info, cb){
	info.uid = this._id;
	Item.new_(info, function(result){
		cb(result);
	})
}

module.exports.User = User;
module.exports.Category = Category;
module.exports.Item = Item;
module.exports.Message = Message;
module.exports.Follow = Follow;
module.exports.Transaction = Transaction;
module.exports.Comment = Comment;
