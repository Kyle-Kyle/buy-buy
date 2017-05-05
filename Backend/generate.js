/***********
 * Module for generating test data
 *
 * module name: generate
 * programmer: Kyle-Kyle
 * version: 0.0
 *
 * This module generate random data for testing.
 * The fake data can help programmers easily find possible errors.
***********/
var faker = require('faker');
var async = require('async');
var request = require('request');
var model = require('./model');
var async = require('async');
var fs = require('fs');

domain = 'localhost:5000';
url = 'http://'+domain;

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}
function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
	var j = Math.floor(Math.random() * (i + 1));
	var temp = array[i];
	array[i] = array[j];
	array[j] = temp;
	}
	return array;
}
// create 1000 users
/*
var sid = 1155000000;
var usernames = new Set([]);
var num = 1000
var name;
while(usernames.size < num){
	name = faker.internet.userName();
	if(!name.match(/^[a-zA-Z0-9_.]{3,20}$/))continue;
	usernames.add(name);
}
usernames = Array.from(usernames);
for(var i=0;i<num;i++){
	var password = faker.internet.password();
	var new_sid = sid+i;
	var email = new_sid+'@link.cuhk.edu.hk';
	var user = {username: usernames[i], password: password, email: email};
	model.User.new_(user, function(result){
		if(result.feedback != 'Success'){
			console.log(user);
			console.log(result);
		}
	})
}
*/

// create categories
/*
categories = [];
categories.push({name: 'textbook', attributes: ['title', 'condition', 'description', 'subject']})
categories.push({name: 'laptop', attributes: ['title', 'condition', 'description', 'brand']})
categories.push({name: 'usb', attributes: ['title', 'condition', 'description', 'volume']})
categories.push({name: 'dressing', attributes: ['title', 'condition', 'description', 'size']})
categories.push({name: 'bag', attributes: ['title', 'condition', 'description']})
categories.push({name: 'cosmetic', attributes: ['title', 'condition', 'description', 'brand']})
categories.push({name: 'shoes', attributes: ['title', 'condition', 'description', 'size']})
for(var i=0; i<categories.length; i++){
	model.Category.new_(categories[i], function(result){
		if(result.feedback != 'Success'){
			console.log(result);
		}
	})
}
*/
/*
// create items
var jar = {};
var tags = ['good', 'computer', 'vali good', 'book', 'high quality'];
model.User.find({}, function(err, users){
	var i = 0;
	async.whilst(function(){
		return i < users.length;
	},
	function(next){
		var user = users[i];
		var jar = request.jar();
		request.get({url: 'http://'+domain+'/faker?username='+user.username, jar: jar}, function(err, res, body){
			body = JSON.parse(body);
			if(body.feedback != 'Success')console.log(user);
			request.get({url: url+'/users/self', jar: jar}, function(err, res, body){
				model.Category.find({}, function(err, categories){
					var form = {};
					var j = getRandomInt(0, categories.length-1);
					var category = categories[j];
					var attributes = {};
					shuffleArray(tags);

					form.cid = category._id.toString();
					form.price = parseFloat(faker.commerce.price());
					form.quantity = getRandomInt(1, 10);
					form.tags = JSON.stringify(tags.slice(0, getRandomInt(0, tags.length)));
					for(var k=0; k<category.attributes.length; k++){
						switch(category.attributes[k]){
							case 'title':
								attributes['title'] = faker.commerce.productName();
								break;
							case 'condition':
								attributes['condition'] = getRandomInt(0, 4);
								break;
							case 'description':
								attributes['description'] = faker.commerce.productAdjective();
								break;
							default:
								attributes[category.attributes[k]] = faker.commerce.productAdjective();
								break;
						}
					}
					form.attributes = JSON.stringify(attributes);
					request.post({url: url+'/items/create', jar: jar, form: form}, function(err, res, body){
						if(err)console.log(err);
						console.log(i);
						i += 1;
						next();
					})
				})
			});
		})
	},
	function(err){
		console.log('done');
	})
});
*/
/*
// create images
model.User.find({}, function(err, users){
	var i = 0;
	async.whilst(function(){
		return i<users.length;
	},
	function(next){
		var user = users[i];
		var jar = request.jar();
		request.get({url: url+'/faker?username='+user.username, jar: jar}, function(err, res, body){
			model.Item.find({uid: user._id}, function(err, items){
				var j = 0;
				async.whilst(function(){
					return j < items.length;
				},
				function(next2){
					var item = items[j];
					var fd = fs.createWriteStream('image.jpeg');
					image = faker.image.technics();
					var stream = request.get(image).pipe(fd);
					stream.on('finish', function(){
						form = {pic: fs.createReadStream('image.jpeg')};
						request.post({url: url+'/items/'+item._id+'/upload', formData: form, jar: jar}, function(err, res, body){
							body = JSON.parse(body);
							if(err)console.log(err);
							if(body.feedback != 'Success')console.log(body);
							console.log(i+'-'+j);
							j += 1;
							next2();
						})
					});
				},
				function(err2){
					i += 1;
					next();
				})
			})
		})
	},
	function(err){
		console.log('done');
	});
})*/


