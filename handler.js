'use strict';

var aws = require('aws-sdk');
var nodemailer = require('nodemailer');
var iam = new aws.IAM();

var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

var mfaGroupName = 'MFA-enforced';

var mfaGroupUsers = [];

module.exports.handler = function(event, context) {

  iam.getGroup({ GroupName: mfaGroupName }, function(err, data) {
    if (err) console.log(err, err.stack);
    else {

      var mfaUsers = data.Users || [];

      // Add users who are already in the group to an array
      mfaUsers.forEach(function(user) {
        mfaGroupUsers.push(user.UserName);
      });

      iam.listUsers({}, function(err, data) {

        if (err) 
          console.log(err, err.stack);
        else {
          var allUsers = data.Users || [];
          allUsers.forEach(function(user) {

            // If the user has logged in to AWS Management Console atleast once and is not added to MFA-enabled group, add him
            if ('PasswordLastUsed' in user && !mfaGroupUsers.includes(user.UserName)) {

                console.log("Adding the user to MFA group : " + user.UserName);

                var params = {
                  GroupName: mfaGroupName, 
                  UserName: user.UserName
                };
                iam.addUserToGroup(params, function(err, data){
                  if (err) {
                    console.log(err, err.stack);
                  }
                  else {
                    console.log(user.UserName + " added to " + mfaGroupName + " group successfully.")
                    console.log(data);

                    if(!process.env.EMAIL || !process.env.PASSWORD) console.log("Bot email and username not set !");

                    if(validateEmail(user.UserName) && process.env.EMAIL && process.env.PASSWORD) {
                      var mailOptions = {
                        from: process.env.EMAIL,
                        to: user.UserName,
                        subject: process.env.EMAIL_SUBJECT,
                        html: process.env.EMAIL_BODY
                      };
                      transporter.sendMail(mailOptions, function(error, info){
                        if (error)  console.log(error);
                        else        console.log('Email sent: ' + info.response);
                      });
                    } else {
                      console.log("Email not sent to user: " + user.UserName);
                    }
                  }
                });
            }
          });

          // Clear all the users in mfaGroupUsers
          mfaGroupUsers = [];
        }
      });
    }
  });
}

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}