db = require('./db');
var MsgSchema = db.Schema({
    msg: String
});
MsgSchema.methods.display = function(){
    console.log(this.msg);
}

var Msg = db.model('msg', MsgSchema);
module.exports.Msg = Msg;

Msg.find({}, function(err, result){
    if(err)return console.error(err);
    console.log(result);
});
