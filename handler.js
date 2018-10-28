'use strict';

var aws = require('aws-sdk');
var iam = new aws.IAM();

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
                  if (err) console.log(err, err.stack);
                  else     console.log(data);
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