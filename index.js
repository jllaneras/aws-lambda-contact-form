console.log('Loading function...');

var querystring = require('querystring');
var AWS = require('aws-sdk');
var ses = new AWS.SES();

// Environment variables
var RECEIVER = process.env.RECEIVER_EMAIL;
var SENDER = process.env.SENDER_EMAIL;
var SUBJECT = process.env.EMAIL_SUBJECT;

exports.handler = (event, context, callback) => {
    console.log('Received event: ', event);
    sendEmail(event, function (error, data) {
        var response = {
            "isBase64Encoded": false,
            "headers": {'Content-Type': 'text/html'},
            "statusCode": 200,
            "body": "<!DOCTYPE html><body><h2>Thank you for your email!</h2></body></html>"
        };
        callback(error, response);
    });
};

function sendEmail (event, done) {
    var data = querystring.parse(event.body);

    // Check honeypot fields.
    if (data['name'] != '' || data['email'] != '' || data['message'] != '') {
        console.log('Email flagged as spam.');
        done();
        return;
    }
    
    var email = data['30e9'];
    var name = data['d27b'];
    var message = data['da2e'];

    var params = {
        Destination: {
            ToAddresses: [RECEIVER]
        },
        ReplyToAddresses: [email],
        Message: {
            Body: {
                Text: {
                    Data: 'Name: ' + name +
                    '\nEmail: ' + email +
                    '\n\nMessage:\n\n' + message,
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: SUBJECT + ': ' + name,
                Charset: 'UTF-8'
            }
        },
        Source: SENDER
    }

    ses.sendEmail(params, done)
}

