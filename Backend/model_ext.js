model = require('./model');
User = model.User;
Category = model.Category;
Item = model.Item;


Item.prototype.add_comment = function(info, cb){ /*require detail err_msg*/
    err_msg = 'Fail to add comment';
    item = this;
    if(!(typeof info.uid !== 'undefined' && info.uid) || !(typeof info.content!== 'undefined' && info.content))return cb({feedback: 'Failure', err_msg: err_msg});
    User.get(info.uid, function(result){
        if(result.feedback != 'Success')return cb({feedback: 'Failure', err_msg: err_msg});
        comment = {uid: info.uid, username: result.user.username, content: escape_html(info.content), timestamp: +new Date()};
        item.comments.push(comment);
        item.save(function(err, item){
            if(err)return cb({feedback: 'Failure', err_msg: err_msg});
            return cb({feedback: 'Success', item: item});
        }); 
    })  
}

module.exports.User = User;
module.exports.Category = Category;
module.exports.Item = Item;
