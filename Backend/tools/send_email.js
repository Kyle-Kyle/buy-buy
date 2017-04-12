var app = require('../index');
var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: app.get('email_a'),
		pass: app.get('email_p')
	}
});

function send_email(to, subject, text, html, cb){

	// setup email data with unicode symbols
	let mailOptions = {
		from: '"Buy-Buy" '+app.get('email_a'), // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		text: text, // plain text body
		html: html // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return cb({feedback: 'Failure'});
		}
		cb({feedback: 'Success'});
	});
}

function activate_email(email, info, cb){
	var address = app.get('host')? app.get('host') : 'localhost:'+app.get('port');
	var link = 'http://'+address+'/users/activate?text='+info;
	send_email(email, 'Click to activate your account', link, '<a href="'+link+'">Click to enjoy your journey on Buy-Buy!</a>', cb);
}
module.exports.activate_email = activate_email;
module.exports.send_email = send_email;
