var faker = require('faker');
var async = require('async');
//var request = require('request');
var model = require('./model');

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
