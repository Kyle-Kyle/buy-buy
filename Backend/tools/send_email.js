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

function send_email(to, subject, text, html){

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
            return console.log(error);
        }
        //console.log('Message %s sent: %s', info.messageId, info.response);
    });
}
module.exports = send_email;
