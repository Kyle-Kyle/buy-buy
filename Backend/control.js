var app = require('./index');
var multer = require('multer');
var model = require('./model_ext');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var sharp = require('sharp');
var upload = multer({dest: '../tmp'});
var crypto = require('crypto');
var send_email = require('./tools/send_email');

function encrypt(text){
	var cipher = crypto.createCipher(app.get('encrypt_algo'), app.get('secret'));
	var crypted = cipher.update(text,'utf8','hex');
	crypted += cipher.final('hex');
	return crypted;
}
function decrypt(text){
	var decipher = crypto.createDecipher(app.get('encrypt_algo'), app.get('secret'));
	var dec = decipher.update(text,'hex','utf8')
	dec += decipher.final('utf8');
	return dec;
}

function check_login(req, res){
	if(!req.session.uid){
		res.redirect('/');//login page
		return false;
	}
	return true
}
module.exports.check_login = check_login

function rm_tmp_pic(req){
	var files = req.files;
	for(var i=0; i<files.length; i++){
		fs.unlink(files[i].path, function(err){
			if(err)console.log(err);
		});
	}
}

function mv_tmp_pic(item, item_path, i, files, req, res){// leave dirty file
	if(i>=files.length)return;

	var len = item.pictures.length;
	if(len == 0)item.pictures.set(len, 0);
	else item.pictures.set(len, item.pictures[len-1]+1);

	var size;
	var pic = sharp(files[i].path);
	pic.metadata(function(err, metadata){
		if(err || !(metadata.format == 'png' || metadata.format == 'jpeg')){
			rm_tmp_pic(req);
			return res.send({feedback: 'Failure', err_msg: 'Invalid extension'});
		}
		size = metadata.width > metadata.height ? metadata.height: metadata.width;
		pic.resize(size, size).toFile(path.join(item_path, item.pictures[len]+'.jpg'), function(err){
			if(err){
				rm_tmp_pic(req);
				return res.send({feedback: 'Failure', err_msg: 'Fail to save pictures'});
			}
			if(i == files.length-1)item.save(function(err){
				if(err){
					rm_tmp_pic(req);
					return res.send({feedback: 'Failure', err_msg: 'Fail to save pictures'});
				}
				rm_tmp_pic(req);
				return res.send({feedback: 'Success'});
			})
			else mv_tmp_pic(item, item_path, i+1, files, req, res);
		});
		pic.resize(200, 200).toFile(path.join(item_path, item.pictures[len]+'_thumbnail.jpg'));
	});
}

var upload_pic = upload.array('pic', app.get('item_pic_size'));
app.post('/items/:iid/upload', function(req, res){// pictures to jpg
	upload_pic(req, res, function(err){

		if(err){
			rm_tmp_pic(req);
			return res.send({feedback: 'Failure', err_msg: 'Exceed upload max count'});
		}
		if(!check_login(req, res))return rm_tmp_pic(req);

		var valid_ext = ['jpg', 'jpeg', 'png'];
		var files = req.files;
		for(var i=0; i<files.length; i++){
			var strs = files[i].originalname.split('.');
			if(valid_ext.indexOf(strs[strs.length -1].toLowerCase()) < 0){
				rm_tmp_pic(req);
				return res.send({feedback: 'Failure', err_msg: 'Invalid extension'});
			}
		}

		var iid = req.params.iid;
		model.Item.get(iid, function(result){
			if(result.feedback != 'Success'){
				rm_tmp_pic(req);
				return res.send(result);
			}
			var uid = req.session.uid;
			var item = result.item;
			if(!item.uid.equals(uid)){
				rm_tmp_pic(req);
				return res.send({feedback: 'Failure', err_msg: 'Invalid information'});
			}
			if(item.pictures.length+files.length > app.get('item_pic_size')){
				rm_tmp_pic(req);
				return res.send({feedback: 'Failure', err_msg: 'Exceed upload max count'});
			}
			var item_path = path.join(__dirname, '..', 'uploads', item._id.toString());
			mkdirp(item_path, function(err){});
			mv_tmp_pic(item, item_path, 0, files, req, res);
		})
	});
});

app.delete('/items/:iid/pictures/:p', function(req, res){
	if(!check_login(req, res))return;
	var iid = req.params.iid;
	var p = req.params.p;
	model.Item.get(iid, function(result){
		if(result.feedback != 'Success')return res.send(result);
		var item = result.item;
		var i = item.pictures.indexOf(p);
		if(i < 0)return res.send({feedback: 'Failure', err_msg: 'Fail to delete picture'});
		item.pictures.splice(i, 1);
		item.save(function(err){
			if(err)return res.send({feedback: 'Failure', err_msg: 'Fail to delete picture'});
			var item_path = path.join(__dirname, '..', 'uploads', item._id.toString());
			fs.unlink(path.join(item_path, p+'.jpg'), function(err){
				if(err)console.log(err);
			});
			fs.unlink(path.join(item_path, p+'_thumbnail.jpg'), function(err){});
			return res.send({feedback: 'Success'});
		});
	})
});

app.post('/users/register', function(req, res){// vulnerable to DOS
	var username = req.body.username;
	var password = req.body.password;
	var email = req.body.email;
	try{
		if(!/^1155\d{6}@link\.cuhk\.edu\.hk/.test(email) || !/^[A-Za-z0-9_]{3,20}$/.test(username) || password.length < 8)return res.send({feedback: 'Failure', err_msg: 'Invalid information'});
		var hash = crypto.createHash('sha256').update(password).digest('base64');
		var encoded = encrypt(email)+'|'+encrypt(hash)+'|'+encrypt(username)+'|'+encrypt((+new Date()).toString());
		send_email.activate_email(email, encoded, function(result){
			if(result.feedback != 'Success')return res.send({feedback: 'Failure', err_msg: 'Fail to send email'});
			return res.send({feedback: 'Success'});
		});
	}catch(e){
		console.log(e);
		return res.send({feedback: 'Failure', err_msg: 'Invalid information'});
	}
});
app.post('/users/validate', function(req, res){// vulnerable to DOS and info listing
	var username = req.body.username;
	var email = req.body.email;
	var condition;
	if(username)condition = {username: username};
	else if(email)condition = {email: email};
	else return res.send({feedback: 'Failure'});
	model.User.findOne(condition, function(err, user){
		if(err)return res.send({feedback: 'Failure'});
		if(user)return res.send({feedback: 'Success', msg: 'taken'});
		return res.send({feedback: 'Success', msg: 'available'});
	})
})
app.get('/users/activate', function(req, res){// redirect
	var info = req.query.text;
	try{
		info = info.split('|');
		var username = decrypt(info[2]);
		var email = decrypt(info[0]);
		var hash = decrypt(info[1]);
		var timestamp = parseInt(decrypt(info[3]));
		var now = +new Date();
		if((now - timestamp) > 5*60*1000)return res.send({feedback: 'Failure', err_msg: 'Link expires'});
		model.User.findOne({username: username, email: email}, function(err, user){
			if(err)return res.send({feedback: 'Failure', err_msg: 'Fail to activate'});
			if(user)return res.send({feedback: 'Failure', err_msg: 'Link expires'});
			model.User.new_({username: username, email: email, password: hash}, function(result){
				if(result.feedback != 'Success')return res.send({feedback: 'Failure', err_msg: 'Fail to activate'});
				req.session.uid = result.user._id;
				return res.send({feedback: 'Success'});// welcome page
			});
		})
	}catch(e){
		return res.send({feedback: 'Failure', err_msg: 'Fail to activate'});
	}
})
app.post('/users/login', function(req, res){
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var hash = crypto.createHash('sha256').update(password).digest('base64');
	var condition;
	if(username)condition = {username: username, password: hash};
	else if(email)condition = {email: email, password: hash};
	else return res.redirect('/');//login page
	model.User.findOne(condition, function(err, user){
		if(err)return res.redirect('/');//login page
		if(!user)return res.redirect('/');//login page
		req.session.uid = user._id;
		return res.send({feedback: 'Success'});;// welcome page
	});
})
/*app.get('/secret_entrance', function(req, res){
	model.User.get('58ce4f9792e17573d6ea279a', function(result){
		req.session.uid = result.user._id;
		res.send('Login success!\n');
	})
});*/
